import os
import sys
from subprocess import Popen, PIPE
import re
from tempfile import gettempdir
import shutil
from zipfile import ZipFile
from glob import glob
import json
import requests
cur_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(f'{cur_path}/../lib')
import yaml


dir_path = gettempdir()
zipped_repository_path = os.path.join(dir_path, "sigma.zip")
repository_path = os.path.join(dir_path, "sigma-master")
rules_path = os.path.join(repository_path, "rules")


def getRuleQuery(path):
    try:
        sigma_folder = os.path.join(cur_path, "sigma")
        query = Popen([f"{sigma_folder}/sigmac", "--target", "splunk", "--config", f"{sigma_folder}/config/splunk-windows.yml", "-I", "-d", "--output-fields", "title,id,status,description,author,references,fields,falsepositives,level,tags", "--output-format", "json", "-r", path], stdout=PIPE, stderr=PIPE)
        output, error = query.communicate()
        rules = json.loads(output.decode())
    except BaseException as e:
        rules = f"ERROR: {e}"
    return rules


def deleteFolder(folder_path):
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)


def downloadRepo():
    deleteFolder(repository_path)
    r = requests.get("https://github.com/SigmaHQ/sigma/archive/master.zip", timeout=60)
    if r.ok:
        with open(zipped_repository_path, 'wb') as file:
            file.write(r.content)
        with ZipFile(zipped_repository_path, 'r') as zipped:
            zipped.extractall(path=dir_path)
        os.remove(zipped_repository_path)
    else:
        pass


def repoToJSON():
    path = os.path.join(rules_path, "windows")
    rules = getRuleQuery(path)
    for rule in rules:
        rule["rule"] = rule["rule"][0]
    return rules
