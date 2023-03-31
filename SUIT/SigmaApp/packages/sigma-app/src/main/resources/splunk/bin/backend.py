import traceback
import json
import math
from splunk.persistconn.application import PersistentServerConnectionApplication
import os
import sys
dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(dir_path)
from sigma_ops import downloadRepo, repoToJSON
from collection_ops import collectionOps


def list2dict(list):
    dict = {}
    for i in list:
        dict[i[0]] = i[1]
    return dict


def get_all_values(d):
    """Get all values of a nested dictionary"""
    values = []
    for v in d.values():
        if isinstance(v, dict):
            values.extend(get_all_values(v))
        else:
            values.append(v)
    return values


def insert2collection(collection):
    downloadRepo()
    a = repoToJSON()
    collection.deleteDatas()
    while len(a) > 1000:
        collection.addDatas(a[:1000])
        a = a[1000:]
    else:
        collection.addDatas(a)


class Backend(PersistentServerConnectionApplication):
    def __init__(self, _command_line, _command_arg):
        super(PersistentServerConnectionApplication, self).__init__()

    def handle(self, in_string):
        try:
            request = json.loads(in_string)
            method = request["method"]
            datas = list2dict(request.get("form", []))
            params = list2dict(request.get("query", []))
            rest_path = request["rest_path"]
            rest_uri = request["server"]["rest_uri"]
            rest_ip = rest_uri.split("://")[1].split(":")[0]
            rest_port = int(rest_uri.split(":")[2])
            rest_ssl = True if rest_uri.split("://")[0] == "https" else False
            token = request["session"]["authtoken"]

            
            if method.upper() == "GET" and rest_path.lower() == "/sigma/getRuleList".lower():
                
                collection_ops = collectionOps(host=rest_ip, port=rest_port, token=token, ssl=rest_ssl)

                rules = collection_ops.getDatas(query={}, limit=1)
                if len(rules) == 0:
                    insert2collection(collection_ops)
                rules = []
                try:
                    start = int(params.get('start', 0))
                    end = int(params.get('end', 100))
                    search = params.get('search', "")
                    if start >= end:
                        return {'payload': {"result": "Start parameter have to be lower than end parameter."}, 'status': 400}
                    
                    rules = collection_ops.getDatas(query={})
                    if search.strip() != "":
                        rules = [i for i in rules if any(search.lower() in str(x).lower() for x in get_all_values(i))]
                    ruleCount = len(rules)
                    rules = rules[start:end]

                    for rule in rules:
                        del rule["_key"]
                        del rule["_user"]

                    pageCount = math.ceil(ruleCount / (end - start)) if ruleCount > end - start else 1

                    result = {
                        "rules": rules,
                        "start": start,
                        "end": end,
                        "totalCount": ruleCount,
                        "pageCount": pageCount,
                    }
                    return {'payload': {"result": result}, 'status': 200}

                except BaseException as e:
                    return {'payload': {"result": str(e)}, 'status': 500}
            else:
                return {'payload': request, 'status': 200}
        except BaseException as e:
            return {'payload': {"result": str(traceback.format_exc())}, 'status': 500}

    def handleStream(self, handle, in_string):
        raise NotImplementedError(
            "PersistentServerConnectionApplication.handleStream")

    def done(self):
        pass
