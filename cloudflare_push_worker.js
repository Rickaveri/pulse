const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, Prefer, x-upsert, x-target-url"
};

function base64ToUint8Array(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const urlObj = new URL(request.url);

    // Прозрачный резервный прокси к Supabase для мобильных сетей / eSIM в роуминге (v58)
    const targetUrl = request.headers.get("x-target-url") || urlObj.searchParams.get("target");
    if (targetUrl && targetUrl.startsWith("https://tdvpxxpnyinjzirizxea.supabase.co/")) {
      try {
        const forwardHeaders = new Headers();
        ["apikey", "authorization", "content-type", "prefer", "x-upsert"].forEach((h) => {
          const val = request.headers.get(h);
          if (val) forwardHeaders.set(h, val);
        });
        const bodyBuf = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
        const supRes = await fetch(targetUrl, {
          method: request.method,
          headers: forwardHeaders,
          body: bodyBuf
        });
        const respHeaders = new Headers(CORS_HEADERS);
        const ct = supRes.headers.get("content-type");
        if (ct) respHeaders.set("Content-Type", ct);
        return new Response(supRes.body, {
          status: supRes.status,
          headers: respHeaders
        });
      } catch (err) {
        return new Response(JSON.stringify({ message: String(err) }), {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
    }

    if (request.method === "GET") {
      return new Response(
        "PULSE_PUSH_WORKER_READY_V58",
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "text/plain; charset=utf-8" } }
      );
    }
    if (request.method === "POST") {
      try {
        const data = await request.json();
        const endpoint = data.endpoint || data.u;
        const authHeader = data.authHeader || data.a;
        const bodyB64 = data.bodyB64 || data.b;
        const delayMs = Number(data.delayMs || 0);

        if (!endpoint || !authHeader || !bodyB64) {
          return new Response(JSON.stringify({ ok: false, error: "Missing fields" }), {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
          });
        }

        if (delayMs > 0 && delayMs <= 15000) {
          await new Promise((r) => setTimeout(r, delayMs));
        }

        const rawBody = base64ToUint8Array(bodyB64);
        const apnsRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": authHeader,
            "Content-Encoding": "aes128gcm",
            "Content-Type": "application/octet-stream",
            "TTL": "86400",
            "Urgency": "high"
          },
          body: rawBody
        });

        const errText = apnsRes.ok ? "" : await apnsRes.text().catch(() => "");
        return new Response(
          JSON.stringify({ ok: apnsRes.ok, status: apnsRes.status, info: errText }),
          { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ ok: false, error: String(err) }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
    }
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }
};
