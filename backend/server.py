import json
from auxiliary.nocache import nocache
from auxiliary.cookie import Cookie
from auxiliary.supervisor import Supervisor
from flask import Flask, request, send_from_directory, make_response, redirect

SERVER_HOST = 'localhost'
SERVER_PORT = 5001
SESSION_COOKIE_LABEL = 'session_cookie'
SUPERVISOR = Supervisor()

# Initailize application
application = Flask(__name__)
application.config.from_object(__name__)
application.config["APPLICATION_ROOT"] = '/api/1.0'

def decode_request(request):
    '''
    This method decodes a flask.request
    object and returns a session cookie
    as an auziliary.Cookie object and a
    dictionary containing all the 
    request's arguments (both for POST
    and GET methods).
    '''
    session_cookie = request.cookies.get('session_cookie', None)
    request_arguments = request.form if (request.method == 'POST') else request.args
    return session_cookie, request_arguments

def encode_response(response, session_cookie):
    '''
    This methods encodes an auxiliary.Cookie
    object and injects it into the reposnse's
    body.
    '''
    response.set_cookie(SESSION_COOKIE_LABEL, session_cookie.encode())
    return response

def valid_request(path, cookie, args):
    '''
    This method makes use of the Supervisor
    class to verify the integrity and 
    validity of a request.
    '''
    arg_val = SUPERVISOR.validate_arguments(path, args)
    cookie_val = SUPERVISOR.validate_cookie(cookie)
    return (arg_val and cookie_val)

@application.route('/login', methods=['POST'])
@nocache
def login():
    cookie, args = decode_request(request)
    if SUPERVISOR.validate_arguments(request.path, args) == False:
        return "Necessary parameter 'username' not found", 400
    if SUPERVISOR.validate_cookie(cookie) == False:
        cookie = Cookie(args['username'])
        response = make_response(200)
        return encode_response(response, cookie)
    return "Re-authentication not allowed", 403

@application.route('/models', methods=['GET'])
def get_models():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request", 400
    return None

@application.route('/runs', methods=['GET'])
def get_runs():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request", 400
    return None

@application.route('/metrics/names', methods=['GET'])
def get_metric_names():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request", 400
    return None

@application.route('/metrics/scalars', methods=['GET'])
def get_metric_scalars():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request", 400
    return None

@application.route('/results/names', methods=['GET'])
def get_result_names():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request", 400
    return None

@application.route('/results/scalars', methods=['GET'])
def get_result_scalars():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request", 400
    return None

@application.route('/params/names', methods=['GET'])
def get_param_names():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request", 400
    return None

@application.route('/params/scalars', methods=['GET'])
def get_param_scalars():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request", 400
    return None

@application.route('/artifacts', methods=['GET'])
def get_artifacts():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request", 400
    return None

if __name__ == '__main__':
    application.run(host=SERVER_HOST, port=SERVER_PORT)