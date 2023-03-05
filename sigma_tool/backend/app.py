from sigmaConverter import getRuleQuery
import os
import re
from tempfile import gettempdir
import shutil
from zipfile import ZipFile
from glob import glob
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import yaml
import json
import requests
import pymongo


dir_path = gettempdir()
zipped_repository_path = os.path.join(dir_path, "sigma.zip")
repository_path = os.path.join(dir_path, "sigma-master")
rules_path = os.path.join(repository_path, "rules")
app = Flask(__name__)
CORS(app)


def returnError(error_msg):
    return {
        "status": "fail",
        "error_msg": error_msg
    }


def deleteFolder(folder_path):
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)


def connectMongoInstances(database, collection):
    c = pymongo.MongoClient('mongodb://database:27017/')
    # c = pymongo.MongoClient('mongodb://localhost:27017/')
    db = c[database]
    col = db[collection]
    return col


def deleteAllDocuments():
    col = connectMongoInstances("sigma", "rules")
    x = col.delete_many({})
    return x.deleted_count


def addDocuments():
    col = connectMongoInstances("sigma", "rules")
    rules = repoToJSON()
    x = col.insert_many(rules)
    deleteFolder(repository_path)
    return x.inserted_ids


def repoToJSON():
    json_list = []
    paths = glob(os.path.join(rules_path, "**", "*.yml"), recursive=True)
    # paths = glob(os.path.join(rules_path, "windows", "**", "*.yml"), recursive=True)
    for path in paths:
        jsonContent = yaml.safe_load(open(path))
        jsonContent["spl"] = getRuleQuery(jsonContent)
        json_list.append(jsonContent)
    return json_list


def downloadRepo():
    deleteFolder(repository_path)
    r = requests.get("https://github.com/SigmaHQ/sigma/archive/master.zip")
    if r.ok:
        with open(zipped_repository_path, 'wb') as file:
            file.write(r.content)
        with ZipFile(zipped_repository_path, 'r') as zipped:
            zipped.extractall(path=dir_path)
        os.remove(zipped_repository_path)
    else:
        ...


@app.before_request
def downloadRepoIfNotExist():
    if request.endpoint in ["getRuleList"]:
        col = connectMongoInstances("sigma", "rules")
        ruleCount = col.count_documents({})
        if ruleCount == 0:
            downloadRepo()
            addDocuments()


# @app.route('/downloadSigmaRepo', methods=['GET'])
# def downloadSigmaRepo():
#     try:
#         downloadRepo()
#         deleteAllDocuments()
#         addDocuments()
#         return {"status": "success"}, 200
#     except BaseException as e:
#         return returnError(str(e)), 500


@app.route('/getRuleList', methods=['GET'])
def getRuleList():
    col = connectMongoInstances("sigma", "rules")
    rules = []
    try:
        start = int(request.args.get('start', 0))
        end = int(request.args.get('end', 100))
        search = request.args.get('search', "")
        if start >= end:
            return returnError(str("Start parameter have to be lower than end parameter.")), 400

        if search.strip() == "":
            query = {}
        else:
            regex_pattern = re.compile('.*{}.*'.format(re.escape(search)), re.IGNORECASE)
            query = { "$or": [{ field_name: {"$regex": regex_pattern}} for field_name in col.find_one().keys()] }
        rules = col.find(query)
        rules = list(rules)
        ruleCount = len(rules)
        rules = [{k:v for k,v in d.items() if k != "_id"} for d in rules[start:end]] # To delete "_id" key from MongoDB
        rules = [json.dumps(i) for i in rules]
        return jsonify({
            "start": start,
            "end": end,
            "totalCount": ruleCount,
            "rules": rules
        }), 200
    except BaseException as e:
        return returnError(str(e)), 500


@app.route('/addSplunkUrl', methods=["POST"])
@cross_origin()
def addSplunkURL():
    try:
        data = json.loads(request.data)
        url = data["url"]
        if len(url) >= 100:
            raise Exception('URL length must be less then 100 chars')
        c = connectMongoInstances("sigma", "splunkurl")
        c.delete_many({})
        c.insert_one({"url": url})
        return {"status": "success"}, 200
    except BaseException as e:
        return returnError(str(e)), 500


@app.route('/getSplunkUrl', methods=["GET"])
def getSplunkURL():
    try:
        c = connectMongoInstances("sigma", "splunkurl")
        r = c.find_one({})
        return {
            "status": "success",
            "url": r.get("url") if r else None
        }
    except BaseException as e:
        return returnError(str(e)), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5454, debug=True)
