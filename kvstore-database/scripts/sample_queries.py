import json
from collection_ops import getDatas

##
# To get all rules
query_1 = {}
data = getDatas(query=query_1)
# print(json.dumps(data, indent=4))
##


##
# To get all high level rules
query_2 = {
    "level": "high"
}
data = getDatas(query=query_2)
# print(json.dumps(data, indent=4))
##


##
# To get first 10 rules which created by Thomas Patzke
user = "Thomas Patzke"
query_3 = {"author": user}
##
data = getDatas(query=query_3, limit=10)
# print(json.dumps(data, indent=4))


##
# To get all rules which is experimental AND low level. Just return title, author, level and status fields.
query_4 = {
    "$and": [
        {"level": "low"},
        {"status": "experimental"},
    ]
}
data = getDatas(query=query_4, fields="title,author,level,status")
# print(json.dumps(data, indent=4))
##


##
# To get all rules which is stable OR medium level skipping first 10 matches rules
query_5 = {
    "$or": [
        {"level": "medium"},
        {"status": "stable"}
    ]
}
data = getDatas(query=query_5, skip=10)
# print(json.dumps(data, indent=4))
##
