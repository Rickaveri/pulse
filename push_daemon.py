#!/usr/bin/env python3
import base64
import json
import ssl
import time
import urllib.request

SUPABASE_URL = "https://tdvpxxpnyinjzirizxea.supabase.co"
SUPABASE_KEY = "sb_publishable_uiEi-rt3J7ZCeGKrskZy2w_FVoVMNPV"
SSL_CTX = ssl.create_default_context()

processed_ids = set()

def fetch_push_rows():
    url = f"{SUPABASE_URL}/rest/v1/messages?select=id,content&content=like.__PUSH__%25&order=created_at.desc&limit=10"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    })
    with urllib.request.urlopen(req, context=SSL_CTX, timeout=8) as resp:
        return json.loads(resp.read().decode("utf-8"))

def delete_push_row(msg_id):
    url = f"{SUPABASE_URL}/rest/v1/messages?id=eq.{msg_id}"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }, method="DELETE")
    try:
        urllib.request.urlopen(req, context=SSL_CTX, timeout=6)
    except Exception:
        pass

def forward_to_apns(pkt):
    endpoint = pkt.get("u")
    auth_hdr = pkt.get("a")
    body_b64 = pkt.get("b")
    if not endpoint or not auth_hdr or not body_b64:
        return
    raw_body = base64.b64decode(body_b64)
    req = urllib.request.Request(
        endpoint,
        data=raw_body,
        headers={
            "Authorization": auth_hdr,
            "Content-Encoding": "aes128gcm",
            "Content-Type": "application/octet-stream",
            "TTL": "86400",
            "Urgency": "high"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=10) as resp:
            print(f"[APNs Push Sent] status={resp.status} endpoint={endpoint[:45]}...", flush=True)
    except Exception as e:
        print(f"[APNs Push Error] {e}", flush=True)

def main():
    print("Pulse APNs/FCM Web Push Daemon started...", flush=True)
    while True:
        try:
            rows = fetch_push_rows()
            for r in rows:
                mid = r.get("id")
                if not mid or mid in processed_ids:
                    continue
                processed_ids.add(mid)
                content = r.get("content", "")
                if content.startswith("__PUSH__|"):
                    pkt = json.loads(content[9:])
                    forward_to_apns(pkt)
                    delete_push_row(mid)
        except Exception:
            pass
        time.sleep(1.5)

if __name__ == "__main__":
    main()
