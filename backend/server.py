import json
from flask import jsonify
from pymongo import MongoClient
import gridfs
from auxiliary.nocache import nocache
from auxiliary.cookie import Cookie
from flask_cors import CORS, cross_origin
from auxiliary.supervisor import Supervisor
from auxiliary.mongoconfig import MongoConfig
from flask import Flask, request, send_from_directory, make_response, redirect

# Server configuration
SERVER_HOST = 'localhost'
SERVER_PORT = 5010
DB_CONFIG = MongoConfig().get_values()

# Sessions-related variables
SESSION_COOKIE_LABEL = 'session_cookie'
SUPERVISOR = Supervisor()

# Initailize application
application = Flask(__name__)
application.config.from_object(__name__)
cors = CORS(application)

# Configure Database
mongo_url = "mongodb://{}:{}@{}/{}".format(
    DB_CONFIG['user'],
    DB_CONFIG['pass'],
    DB_CONFIG['host'],
    DB_CONFIG['name']
)
db = MongoClient(mongo_url)
#application.config["APPLICATION_ROOT"] = '/api/1.0'

def decode_request(request):
    '''
    This method decodes a flask.request
    object and returns a session cookie
    as an auziliary.Cookie object and a
    dictionary containing all the 
    request's arguments (both for POST
    and GET methods).
    '''
    encoded_cookie = request.cookies.get('session_cookie', None)
    session_cookie = None#Cookie().decode(encoded_cookie)
    request_arguments = request.form if (request.method == 'POST') else request.args
    return session_cookie, request_arguments

def encode_response(response, session_cookie):
    '''
    This methods encodes an auxiliary.Cookie
    object and injects it into the reposnse's
    body.
    '''
    #response.set_cookie(SESSION_COOKIE_LABEL, session_cookie.encode())
    return response

def valid_request(path, cookie, args):
    '''
    This method makes use of the Supervisor
    class to verify the integrity and 
    validity of a request.
    '''
    arg_val = SUPERVISOR.validate_arguments(path, args)
    cookie_val = True#SUPERVISOR.validate_cookie(cookie)
    return (arg_val and cookie_val)

@application.route('/login', methods=['POST'])
@nocache
def login():
    '''
    This method takes care of registering a
    user and returning a valid cookie.

    Parameters:
        username <desired loggin username>
    
    Return:
        None
    '''
    cookie, args = decode_request(request)
    if SUPERVISOR.validate_arguments(request.path, args) == False:
        return "Necessary parameter 'username' not found\n", 400
    if SUPERVISOR.validate_cookie(cookie) == False:
        cookie = Cookie(args['username'])
        response = make_response("Loged in", 200)
        return encode_response(response, cookie)
    return "Re-authentication not allowed\n", 403

@application.route('/models', methods=['GET'])
@cross_origin()
def get_models():
    '''
    This method takes care of querying all
    the models from a user.

    Parameters:
        None

    Return:
        JSON encoded list of all models.
    '''
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request\n", 400

    models = db['Swell']['runs'].find({}, {'config': 1})
    models = set([i['config']['method_tag'] for i in models])

    return encode_response(json_response(models), cookie)

@application.route('/runs', methods=['GET'])
@cross_origin()
def get_runs():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request\n", 400

    runs = db['Swell']['runs'].find({'config.method_tag': args['model_name']}, {'config': 1, 'heartbeat': 1})
    runs = list(runs)

    return encode_response(json_response(runs), cookie)

@application.route('/metrics/names', methods=['GET'])
@cross_origin()
def get_metric_names():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request\n", 400

    metric_names = db['Swell']['runs'].find_one({'_id': int(args['run_id'])}, {'info': 1})
    metric_names = set([i['name'] for i in metric_names['info']['metrics']])

    return encode_response(json_response(metric_names), cookie)

@application.route('/metrics/scalars', methods=['GET'])
@cross_origin()
def get_metric_scalars():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request\n", 400

    run_id = int(args['run_id'])
    metric_name = args['metric_name']
    run_metric = db['Swell']['metrics'].find_one({'run_id': run_id, 'name': metric_name})
    run_metric = {k: v for k, v in run_metric.items() if k != '_id'}
    return encode_response(json_response(run_metric), cookie)

@application.route('/results/names', methods=['GET'])
@cross_origin()
def get_result_names():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request\n", 400

    result_names = db['Swell']['runs'].find_one({'_id': int(args['run_id'])}, {'result': 1})['result'].keys()
    result_names = list(result_names)

    return encode_response(json_response(result_names), cookie)

@application.route('/results/scalars', methods=['GET'])
@cross_origin()
def get_result_scalars():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request\n", 400

    run_metric = dict()
    run_metric['value'] = db['Swell']['runs'].find_one({'_id': int(args['run_id'])}, {'result': 1})['result'][
        args['result_name']]
    run_metric['name'] = db['Swell']['runs'].find_one({'_id': int(args['run_id'])}, {'config': 1})['config'][
                             'method_tag'] + '-{}'.format(args['run_id'])
    return encode_response(json_response(run_metric), cookie)

@application.route('/params/names', methods=['GET'])
@cross_origin()
def get_param_names():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request\n", 400

    param_names = db['Swell']['runs'].find_one({'_id': int(args['run_id'])}, {'config': 1})

    return encode_response(json_response(param_names), cookie)

@application.route('/params/scalars', methods=['GET'])
@cross_origin()
def get_param_scalars():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request\n", 400

    param_scalars = db['Swell']['runs'].find_one({'_id': int(args['run_id'])}, {'config': 1})['config'][args['param_name']]
    param_scalars = [param_scalars]

    return encode_response(json_response(param_scalars), cookie)

@application.route('/artifacts', methods=['GET'])
@cross_origin()
def get_artifacts():
    cookie, args = decode_request(request)
    if valid_request(request.path, cookie, args) == False:
        return "Invalid request\n", 400

    fs = gridfs.GridFS(db['Swell'])
    artifacts = {}
    for file in db['Swell']['runs'].find_one({'_id': int(args['run_id'])}, {'artifacts'})['artifacts']:
        if '.png' in file['name']:
            fig = fs.get(file['file_id']).read()
            artifacts[file['file_id']] = fig

    return encode_response(json_response(artifacts), cookie)

def json_response(dictionary):
    data = dictionary
    if type(data) is list:
        data = {'data': data}
    elif type(data) is set:
        data = {'data': list(data)}
    return jsonify(data)

def not_implemented():
    return make_response("Method not implemented\n", 403)

if __name__ == '__main__':
    application.run(host=SERVER_HOST, port=SERVER_PORT)