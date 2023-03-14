import os
import json
from collection_ops import addDatas, deleteDatas

dir_path = os.path.dirname(os.path.realpath(__file__))
sample_data_path = os.path.join(dir_path, 'rules.json')

rule_datas = open(sample_data_path, 'r').read()
json_formatted = json.loads(rule_datas)

deleteDatas()

while len(json_formatted) > 1000: # splunk bulk data limit
    addDatas(json_formatted[:1000])
    json_formatted = json_formatted[1000:]
else:
    addDatas(json_formatted)
