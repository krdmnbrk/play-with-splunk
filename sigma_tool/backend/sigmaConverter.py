from sigma.collection import SigmaCollection
from sigma.backends.splunk import SplunkBackend
from sigma.pipelines.splunk import splunk_windows_pipeline


def getRuleQuery(rule_data):
    backend = SplunkBackend(splunk_windows_pipeline())
    content = SigmaCollection.from_dicts([rule_data])
    try:
        query = backend.convert(content, "default")[0]
    except BaseException as e:
        query = f"ERROR: {e}"
    return query
