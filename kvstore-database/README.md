# KV Store

## How to Use KV Store as Database?

[Medium Post | Play with Splunk | Sigma Rule Project - Configuring KV Store](https://krdmnbrk.medium.com/play-with-splunk-sigma-rule-project-configuring-kv-store-d44cfde23aa4)

In this section, I talked about Splunk KV Store. There are some scripts that helps to operate collection and a Splunk app.

To install app

```sh
git clone https://github.com/krdmnbrk/play-with-splunk.git
cd play-with-splunk/kvstore-database
cp -r collection_sample_app $SPLUNK_HOME/etc/apps/
$SPLUNK_HOME/bin/splunk restart
```

To run scripts you need to install splunk-sdk package. Preferred way is creating virtualenv.

```sh
cd scripts
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> Note: Usage of "virtualenv" may differ from system to system. [Virtualenv Docs](https://docs.python.org/3/library/venv.html)

Edit credentials in **collections_ops.py** file.

```py
import splunklib.client as client

# connect to splunk
conn = client.connect(
    host="localhost",
    port=8089,
    username="admin",
    password="playwithsplunk"
    )
```

Then, you are ready to play with it.

In next section, I will talk about how to create custom REST endpoint on Splunk.
