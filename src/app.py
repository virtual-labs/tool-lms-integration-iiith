from flask import Flask, render_template
from pylti.flask import lti

app = Flask(__name__)
app.secret_key = 'a_super_secret_key'  # Needed for Flask sessions


""" 
app.config['PYLTI_CONFIG'] = {
    'consumers': {
        'consumer_key1': {
            'secret': 'consumer_secret1'
        },
        'consumer_key2': {
            'secret': 'consumer_secret2'
        }
    }
} 
"""


# Define the PyLTI configuration
app.config['PYLTI_CONFIG'] = {
    'consumers': {
        'moodle': {
            'secret': 'secret'
        }
    }
}

def error(exception):
    return f"Error: {exception}"

@app.route("/launch", methods=["POST"])
@lti(error=error, request='initial', app=app, config=app.config['PYLTI_CONFIG'])
def launch(lti):
    return render_template("landing.html", user_id=lti.name, roles=lti.role)

@app.route("/")
def index():
    return "LTI Provider is running. POST to /launch to initiate LTI session."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
