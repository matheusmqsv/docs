import sys, json, os, re
from functools import wraps

REDACT_KEYS = re.compile(r'(token|secret|key)$', re.I)

class Ctx:
    def __init__(self, payload):
        self.environment = payload.get("env") or payload.get("environment")
        self.vars = payload.get("variables", {}) or {}
        self.artifacts_dir = payload.get("artifactsDir")
        self._out = {"set":{}, "asserts":[], "logs":[], "artifacts":[]}

    def set(self, **kwargs):
        for k,v in kwargs.items():
            self._out["set"][k]=v

    def log(self, msg:str):
        self._out["logs"].append(str(msg))

    def artifact(self, path:str):
        self._out["artifacts"].append(path)

    def assertPass(self, name:str, details:str=""):
        self._out["asserts"].append({"name":name,"status":"pass","details":details})

    def assertFail(self, name:str, details:str=""):
        self._out["asserts"].append({"name":name,"status":"fail","details":details})

    def env(self, name:str):
        return os.getenv(name)

    def secret(self, name:str):
        return self.env(name)

def _redact(obj):
    def walk(x):
        if isinstance(x, dict):
            out = {}
            for k,v in x.items():
                out[k] = "***" if REDACT_KEYS.search(k or "") else walk(v)
            return out
        if isinstance(x, list):
            return [walk(v) for v in x]
        return x
    return walk(obj)

def hook():
    def deco(fn):
        @wraps(fn)
        def inner():
            raw = sys.stdin.read()
            payload = json.loads(raw or "{}")
            ctx = Ctx(payload)
            try:
                fn(ctx)
                out = _redact(ctx._out)
                print(json.dumps(out))
                sys.exit(0)
            except SystemExit:
                raise
            except Exception as e:
                ctx._out["asserts"].append({"name":"hook_error","status":"error","details":str(e)})
                print(json.dumps(_redact(ctx._out)))
                sys.exit(1)
        return inner
    return deco
