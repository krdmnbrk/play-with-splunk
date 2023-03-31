import os
import sys
dir_path = os.path.dirname(os.path.realpath(__file__))
lib_path = os.path.join(dir_path, "..", "lib")
sys.path.append(lib_path)

import splunklib.client as client

class collectionOps:
    def __init__(self, host, port, token, ssl):
        self.conn = client.connect(
            host=host,
            port=port,
            token=token,
            scheme="https" if ssl else "http"
        )

        # get all kvstores
        kvStores = self.conn.kvstore

        # get specific kvstore
        sigmaCollection = kvStores["sigma"]

        # get data object
        sigmaCollectionData = sigmaCollection.data

        self.sigmaCollectionData = sigmaCollectionData

    def getDatas(self, **kwargs):
        return self.sigmaCollectionData.query(**kwargs)

    def deleteDatas(self, query={}):
        self.sigmaCollectionData.delete(query=query)

    def addData(self, data):
        self.sigmaCollectionData.insert(data)

    def addDatas(self, data_list):
        self.sigmaCollectionData.batch_save(*data_list)

    def updateData(self, key, data):
        self.sigmaCollectionData.update(key, data)
