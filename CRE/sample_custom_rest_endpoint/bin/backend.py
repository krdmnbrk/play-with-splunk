import traceback
import json
from splunk.persistconn.application import PersistentServerConnectionApplication


def list2dict(list):
    dict = {}
    for i in list:
        dict[i[0]] = i[1]
    return dict


class Backend(PersistentServerConnectionApplication):
    def __init__(self, _command_line, _command_arg):
        super(PersistentServerConnectionApplication, self).__init__()

    # Handle a syncronous from splunkd.
    def handle(self, in_string):
        """
        Called for a simple synchronous request.
        @param in_string: request data passed in
        @rtype: string or dict
        @return: String to return in response.  If a dict was passed in,
                 it will automatically be JSON encoded before being returned.
        """
        try:
            ##########################
            ### PUT YOUR CODE HERE ###
            ##########################

            request = json.loads(in_string)
            method = request["method"]
            datas = list2dict(request.get("form", []))
            params = list2dict(request.get("query", []))
            rest_path = request["rest_path"]

            if rest_path.lower() == '/sample_api_v1/getRequest'.lower() and method.upper() == 'GET':
                return {'payload': {"result": {"status": "GET request is successful.", "params": params}}, 'status': 200}

            elif rest_path.lower() == '/sample_api_v1/postRequest'.lower() and method.upper() == 'POST':
                return {'payload': {"result": {"status": "POST request is successful.", "params": params, "data": datas}}, 'status': 200}

            else:
                return {'payload': {"result": 'Invalid endpoint or HTTP method.'}, 'status': 400}
            
        except BaseException as e:
            return {'payload': {
                "result": {
                    'error_details': str(traceback.format_exc()),
                    'error': str(e)
                }
            }, 'status': 500}


    def handleStream(self, handle, in_string):
        """
        For future use
        """
        raise NotImplementedError(
            "PersistentServerConnectionApplication.handleStream")

    def done(self):
        """
        Virtual method which can be optionally overridden to receive a
        callback after the request completes.
        """
        pass
