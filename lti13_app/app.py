from flask import Flask, jsonify, request, render_template, send_from_directory, session
from pylti1p3.contrib.flask import (
    FlaskRequest,
    FlaskCacheDataStorage,
    FlaskOIDCLogin,
    FlaskMessageLaunch
)
from pylti1p3.tool_config import ToolConfJsonFile
from flask_caching import Cache
from pylti1p3.grade import Grade
from pylti1p3.lineitem import LineItem
from werkzeug.exceptions import Forbidden
import datetime

def fixed_get_request_param(self, key):
    if request.method == 'POST':
        return request.form.get(key)
    else:
        return request.args.get(key)

def fixed_get_param(self, key):
    if request.method == 'POST':
        return request.form.get(key)
    else:
        return request.args.get(key)

FlaskRequest._get_request_param = fixed_get_request_param
FlaskRequest.get_param = fixed_get_param

app = Flask(__name__)
app.secret_key = 'super-secret'
cache = Cache(app, config={'CACHE_TYPE': 'simple'})


@app.after_request
def allow_iframe(response):
    response.headers['X-Frame-Options'] = 'ALLOWALL'
    return response

def get_tool_conf():
    return ToolConfJsonFile("tool_config.json")

def get_launch_data_storage():
    return FlaskCacheDataStorage(cache)

@app.route("/token", methods=["POST"])
def token():
    return jsonify({
        "access_token": "dummy-access-token",
        "token_type": "Bearer",
        "expires_in": 3600,
        "scope": "openid"
    })

@app.route('/login', methods=['GET', 'POST'])
def login():
    try:
        tool_conf = get_tool_conf()
        launch_data_storage = get_launch_data_storage()
        flask_request = FlaskRequest()
        target_link_uri = flask_request.get_param('target_link_uri')
        
        if not target_link_uri:
            raise Exception('Missing "target_link_uri" param')

        oidc_login = FlaskOIDCLogin(flask_request, tool_conf, launch_data_storage=launch_data_storage)
        return oidc_login.enable_check_cookies().redirect(target_link_uri)
        
    except Exception as e:
        return f"Login failed: {str(e)}", 400

@app.route("/experiments")  
def experiments():
    """Display available experiments"""
    return render_template("experiments_list.html")

@app.route("/launch", methods=["POST"])
def launch():
    try:
        tool_conf = get_tool_conf()
        launch_data_storage = get_launch_data_storage()
        flask_request = FlaskRequest()

        message_launch = FlaskMessageLaunch(flask_request, tool_conf, launch_data_storage=launch_data_storage)
        launch_data = message_launch.get_launch_data()

        user_name = launch_data.get("name", "Anonymous")
        user_email = launch_data.get("email", "unknown@example.com")
        
        # Store launch data in session for grade passback
        session['launch_id'] = message_launch.get_launch_id()
        session['launch_data'] = launch_data

        # Show experiments instead of landing page
        return render_template("experiments_list.html", 
                             user_id=user_name, 
                             user_email=user_email)
        
    except Exception as e:
        return f"Launch failed: {str(e)}", 400

@app.route("/submit-grade", methods=["POST"])
def submit_grade():
    try:
        data = request.get_json()
        experiment = data.get('experiment')
        score = float(data.get('score', 0))
        total = float(data.get('total', 1))
        percentage = float(data.get('percentage', 0))
        is_partial = data.get('isPartial', False)

        launch_id = session.get('launch_id')
        if not launch_id:
            return jsonify({
                'success': True, 
                'message': f'Score recorded: {percentage*100:.1f}% (No LTI session for grade passback)',
                'score': score,
                'total': total,
                'isPartial': is_partial,
                'note': 'Running in standalone mode'
            })

        # Setup tool and launch objects
        tool_conf = get_tool_conf()
        flask_request = FlaskRequest()
        launch_data_storage = get_launch_data_storage()

        # Recreate the message launch from cache
        message_launch = FlaskMessageLaunch.from_cache(
            launch_id, flask_request, tool_conf, launch_data_storage=launch_data_storage)

        # Check if AGS is available before proceeding
        if not message_launch.has_ags():
            raise Forbidden("Grade passback not supported")

        # Get launch data and extract required information
        launch_data = message_launch.get_launch_data()
        resource_link_id = launch_data.get(
            'https://purl.imsglobal.org/spec/lti/claim/resource_link', {}).get('id')
        sub = launch_data.get('sub')

        print("=== GRADE SUBMISSION DEBUG ===")
        print(f"Launch data user ID (sub): {sub}")
        print(f"Resource link ID: {resource_link_id}")
        print(f"Original score: {score}, total: {total}, percentage: {percentage}")

        # Get AGS service
        ags = message_launch.get_ags()

        # Get existing line items first
        print("Getting existing line items...")
        try:
            line_items = ags.get_lineitems()
            print(f"Available line items: {line_items}")
        except Exception as e:
            print(f"Error getting line items: {e}")
            line_items = []

        # Convert percentage to score (test with simple 0-1 range first)
        if percentage <= 1.0:
            score_given = percentage  # Keep as 0-1 ratio
            score_maximum = 1.0
        else:
            score_given = percentage / 100.0  # Convert 100-scale to 0-1
            score_maximum = 1.0

        print(f"Using score_given: {score_given}, score_maximum: {score_maximum}")

        # Create simple grade dictionary (bypassing Grade class)
        simple_grade = {
            "scoreGiven": score_given,
            "scoreMaximum": score_maximum,
            "activityProgress": "InProgress" if is_partial else "Completed",
            "gradingProgress": "Pending" if is_partial else "FullyGraded",
            "userId": sub,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
        }

        print(f"Simple grade payload: {simple_grade}")

        # Try to find existing line item first
        line_item = None
        if line_items:
            # Use the first available line item
            line_item = line_items[0]
            print(f"Using existing line item: {line_item}")
        else:
            # Create new line item using simple dictionary approach
            line_item_data = {
                "scoreMaximum": score_maximum,
                "label": f"{experiment or 'Experiment'} Score",
                "tag": "experiment"
            }
            
            if resource_link_id:
                line_item_data["resourceId"] = resource_link_id

            print(f"Creating new line item with data: {line_item_data}")
            
            # Create LineItem object
            line_item_obj = LineItem()
            line_item_obj.set_score_maximum(score_maximum) \
                         .set_label(f"{experiment or 'Experiment'} Score") \
                         .set_tag("experiment")
            
            if resource_link_id:
                line_item_obj.set_resource_id(resource_link_id)

            line_item = ags.find_or_create_lineitem(line_item_obj)
            print(f"Created/found line item: {line_item}")

        # Now try submitting the simple grade
        print("Submitting simple grade...")
        
        # Method 1: Try with simple dictionary directly
        try:
            # This might not work depending on the library implementation
            result = ags.put_grade(simple_grade, line_item)
            print(f"SUCCESS with simple dict: {result}")
            
            return jsonify({
                'success': True,
                'message': f'{"Partial" if is_partial else "Final"} grade submitted: {score_given:.3f}/{score_maximum}',
                'score': score,
                'total': total,
                'isPartial': is_partial,
                'method': 'simple_dict',
                'result': str(result)
            })
            
        except Exception as dict_error:
            print(f"Simple dict method failed: {dict_error}")
            
            # Method 2: Use Grade object with minimal data
            print("Trying with Grade object...")
            
            grade_obj = Grade()
            grade_obj.set_score_given(score_given) \
                     .set_score_maximum(score_maximum) \
                     .set_timestamp(simple_grade["timestamp"]) \
                     .set_activity_progress(simple_grade["activityProgress"]) \
                     .set_grading_progress(simple_grade["gradingProgress"]) \
                     .set_user_id(sub)

            print(f"Grade object created: {grade_obj}")
            
            result = ags.put_grade(grade_obj, line_item)
            print(f"SUCCESS with Grade object: {result}")
            
            return jsonify({
                'success': True,
                'message': f'{"Partial" if is_partial else "Final"} grade submitted: {score_given:.3f}/{score_maximum}',
                'score': score,
                'total': total,
                'isPartial': is_partial,
                'method': 'grade_object',
                'result': str(result)
            })

    except Exception as e:
        print(f"Submit grade error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Try to get more details from the exception
        error_details = {
            'error': str(e),
            'type': type(e).__name__
        }
        
        if hasattr(e, 'response'):
            error_details['response_status'] = getattr(e.response, 'status_code', 'Unknown')
            error_details['response_text'] = getattr(e.response, 'text', 'No response text')
            error_details['response_headers'] = dict(getattr(e.response, 'headers', {}))
        
        print(f"Error details: {error_details}")
        
        return jsonify({'success': False, 'error_details': error_details})


# Add a test route for easier debugging
@app.route("/test-grade")
def test_grade():
    """Test grade submission with hardcoded values"""
    try:
        launch_id = session.get('launch_id')
        if not launch_id:
            return "No LTI session found. Launch the tool first."
        
        # Simulate a grade submission
        test_data = {
            'experiment': 'test',
            'score': 85,
            'total': 100,
            'percentage': 0.85,
            'isPartial': False
        }
        
        # Call submit_grade logic directly with test data
        with app.test_request_context('/submit-grade', 
                                    method='POST', 
                                    json=test_data):
            session['launch_id'] = launch_id  # Preserve session
            result = submit_grade()
            return result
            
    except Exception as e:
        return f"Test failed: {str(e)}"


# Add route to inspect current session and launch data
@app.route("/debug-session")
def debug_session():
    """Debug current session state"""
    try:
        launch_id = session.get('launch_id')
        launch_data = session.get('launch_data', {})
        
        debug_info = {
            'has_launch_id': bool(launch_id),
            'launch_id': launch_id,
            'user_id': launch_data.get('sub'),
            'user_name': launch_data.get('name'),
            'resource_link': launch_data.get('https://purl.imsglobal.org/spec/lti/claim/resource_link', {}),
            'ags_claim': launch_data.get('https://purl.imsglobal.org/spec/lti-ags/claim/endpoint', {}),
            'session_keys': list(session.keys())
        }
        
        return jsonify(debug_info)
        
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route("/experiment/<experiment_name>")
def run_experiment(experiment_name):
    """Serve individual experiment from simulation folder"""
    try:
        # Check if user has an active LTI session
        has_lti_session = 'launch_id' in session
        
        return render_template(f"simulation/{experiment_name}.html", 
                             show_back_button=True,
                             back_url="/experiments",
                             has_lti_session=has_lti_session)
    except Exception as e:
        return f"Experiment not found: {experiment_name}", 404

@app.route("/")
def index():
    return "LTI 1.3 Tool is running. Go to /login to start."

# Add static file serving routes with better error handling
@app.route('/simulation/css/<path:filename>')
def simulation_css(filename):
    try:
        return send_from_directory('templates/simulation/css', filename)
    except:
        return "CSS file not found", 404

@app.route('/simulation/js/<path:filename>')
def simulation_js(filename):
    try:
        return send_from_directory('templates/simulation/js', filename)
    except:
        return "JS file not found", 404

# Handle CSS and JS files relative to experiment pages
@app.route('/experiment/css/<path:filename>')
def experiment_css(filename):
    try:
        return send_from_directory('templates/simulation/css', filename)
    except:
        return "CSS file not found", 404

@app.route('/experiment/js/<path:filename>')
def experiment_js(filename):
    try:
        return send_from_directory('templates/simulation/js', filename)
    except:
        return "JS file not found", 404

if __name__ == "__main__":
    app.run(port=5000, debug=True)