# http://<server-ip>:5000/add_consumer?key=DASS_iiith&secret=qwerty


from flask import Flask, render_template, request
from pylti.flask import lti

app = Flask(__name__)
app.secret_key = 'a_super_secret_key'

# This is where we store consumers in-memory
app.config['PYLTI_CONFIG'] = {
    'consumers': {
        'moodle': {
            'secret': 'secret'
        }
    }
}

# Allow iframe embedding (needed for Moodle)
@app.after_request
def add_headers(response):
    response.headers['X-Frame-Options'] = 'ALLOWALL'
    response.headers['Content-Security-Policy'] = "frame-ancestors *"
    return response

def error(exception):
    return f"Error: {exception}"

@app.route("/launch", methods=["POST"])
@lti(error=error, request='initial', app=app)
def launch(lti):
    print("=== LTI Launch Params ===")
    for key, val in request.form.items():
        print(f"{key}: {val}")
    return render_template("landing.html", 
                         user_id=lti.name, 
                         user_email=getattr(lti, 'email', f"{lti.name}"),
                         roles=lti.role)

@app.route("/")
def index():
    return "LTI Provider is running. POST to /launch to initiate LTI session."

# Dynamically add a new consumer via GET
@app.route("/add_consumer", methods=["GET"])
def add_consumer():
    key = request.args.get("key")
    secret = request.args.get("secret")

    if not key or not secret:
        return "Missing key or secret", 400

    # Add to app.config['PYLTI_CONFIG']
    app.config['PYLTI_CONFIG']['consumers'][key] = {'secret': secret}
    return f"Consumer '{key}' added successfully.", 200

# Optional: list consumers
@app.route("/list_consumers")
def list_consumers():
    return app.config['PYLTI_CONFIG']['consumers']

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
