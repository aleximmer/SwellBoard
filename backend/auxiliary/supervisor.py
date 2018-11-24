ARGS = {
    '/login': ['username'],
    '/models': [],
    '/runs': [],
    '/metrics/names': ['run_ids'],
    '/metrics/scalars': ['run_ids', 'metric_name'],
    '/results/names': ['run_ids'],
    '/results/scalars': ['run_ids', 'result_name'],
    '/params/names': ['run_ids'],
    '/params/scalars': ['run_ids', 'param_name'],
    '/artifacts': ['run_id']
}

class Supervisor:
    
    def __init__(self):
        pass

    def validate_cookie(self, cookie):
        if cookie is None:
            return False
        if cookie.username is None:
            return False
        if len(cookie.username) <= 0:
            return False
        return True

    def validate_arguments(self, path, args):
        mandatory_args = ARGS.get(path, [])
        for arg in mandatory_args:
            if arg not in args:
                return False
        return True