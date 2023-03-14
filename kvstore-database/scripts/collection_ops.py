import splunklib.client as client

# connect to splunk
conn = client.connect(
    host="localhost",
    port=8089,
    username="admin",
    password="playwithsplunk"
    )

# get all kvstores
kvStores = conn.kvstore

# get specific kvstore
sigmaCollection = kvStores["sigma"]

# get data object
sigmaCollectionData = sigmaCollection.data


def getDatas(**kwargs):
    return sigmaCollectionData.query(**kwargs)


def deleteDatas(query={}):
    sigmaCollectionData.delete(query=query)


def addData(data):
    sigmaCollectionData.insert(data)


def addDatas(data_list):
    sigmaCollectionData.batch_save(*data_list)


def updateData(key, data):
    sigmaCollectionData.update(key, data)
