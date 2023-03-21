# Custom REST Endpoints

## How to use custom REST endpoints as backend API?

[Medium Post | Play with Splunk | Sigma Rule Project - Custom REST Endpoint](https://krdmnbrk.medium.com/play-with-splunk-sigma-rule-project-configuring-kv-store-d44cfde23aa4)

In this section, I talked about Splunk custom REST endpoints. There are two Splunk apps.

#### sample_custom_rest_endpoint

This apps shows how to handle GET & POST request with custom REST endpoints.

#### custom_rest_endpoint

This is the main app that will be used in Sigma Rule project.

The app contains a custom REST endpoint that integrated with a Sigma Rule to SPL converter.

To learn all details, read the Medium post linked at top of the README.

##### Try it out!

Clone the repository

```bash
git clone https://github.com/krdmnbrk/play-with-splunk.git
```

Copy the app to your app folder

```bash
cp -r play-with-splunk/CRE/custom_rest_endpoint $SPLUNK_HOME/etc/apps
```

Restart Splunk

```bash
$SPLUNK_HOME/bin/splunk restart
```

Then, send a GET request

```bash
curl -k -u <username>:<password> https://localhost:8089/servicesNS/-/custom_rest_endpoint/sigma/getRuleList
```