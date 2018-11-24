import pickle
import codecs

class Cookie:

    version = 1.0
    user_id = None

    def __init__(self, user_id):
        self.user_id = user_id

    def encode(self):
        return codecs.encode(pickle.dumps(self), "base64").decode()

    @staticmethod
    def decode(cookie):
        return pickle.loads(codecs.decode(cookie.encode(), "base64"))