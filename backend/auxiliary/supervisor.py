ARGS = {
    '/login': ['username'],
    '/models': [],
    '/runs': ['model_name'],
    '/metrics/names': ['run_id'],
    '/metrics/scalars': ['run_id', 'metric_name'],
    '/results/names': ['run_id'],
    '/results/scalars': ['run_id', 'result_name'],
    '/params/names': ['run_id'],
    '/params/scalars': ['run_id', 'param_name'],
    '/artifacts': ['run_id']
}

class Supervisor:
    
    def __init__(self):
        pass

    def validate_cookie(self, cookie):
        if cookie is None:
            return False
        if cookie.user_id is None:
            return False
        if len(cookie.user_id) <= 0:
            return False
        return True

    def validate_arguments(self, path, args):
        mandatory_args = ARGS.get(path, [])
        for arg in mandatory_args:
            if arg not in args:
                return False
        return True