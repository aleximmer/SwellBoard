import json

class MongoConfig:
    
    __host = None
    __port = None
    __name = None
    __user = None
    __pass = None

    def __init__(self):
        config = self.__read_config('.server_config.json')
        self.__host = config.get('host')
        self.__port = config.get('port')
        self.__name = config.get('name')
        self.__user = config.get('user')
        self.__pass = config.get('pass')

    def __read_config(self, json_config):
        return json.load(json_config)

    def get_vaues(self):
        return {
            'host': self.__host,
            'port': self.__port,
            'name': self.__name,
            'user': self.__user,
            'pass': self.__pass
        }