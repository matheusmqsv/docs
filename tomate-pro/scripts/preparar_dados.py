#!/usr/bin/env python3
from sdk.py.tomate_hooks import hook
import os, json, urllib.request

def post_json(url, data, headers=None, timeout=10):
    req = urllib.request.Request(
        url, data=json.dumps(data).encode(),
        headers={**({"Content-Type":"application/json"}), **(headers or {})},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)

@hook()
def run(ctx):
    links_token = ctx.env("LINKS_BEARER_TOKEN")
    links_base  = ctx.env("LINKS_BASE_URL") or "https://api.exemplo.com/links"
    if not links_token:
        raise RuntimeError("LINKS_BEARER_TOKEN ausente")

    body = post_json(f"{links_base}/unique", {"scope":"login"},
                     headers={"Authorization": f"Bearer {links_token}"})
    url_unica = body.get("url")
    if not url_unica:
        raise RuntimeError("Resposta de Links sem 'url'")

    ctx.set(url_unica=url_unica)
    ctx.log(f"url_unica: {url_unica}")

    if os.getenv("CREATE_SEED_ORDER") == "1":
        orders_token = ctx.env("ORDERS_BEARER_TOKEN")
        orders_base  = ctx.env("ORDERS_BASE_URL") or "https://api.exemplo.com/orders"
        if not orders_token:
            raise RuntimeError("ORDERS_BEARER_TOKEN ausente")
        resp = post_json(f"{orders_base}/orders", {"items":[{"name":"Cartão Virtual"}]},
                         headers={"Authorization": f"Bearer {orders_token}"})
        pid = resp.get("id")
        if pid:
            ctx.set(pedido_id=pid)
            ctx.log(f"pedido seed: {pid}")

if __name__ == "__main__":
    run()
