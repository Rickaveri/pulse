// ============================================================================
// КРУГЛОСУТОЧНЫЙ ОБЛАЧНЫЙ PUSH-СЕРВЕР PULSE 24/7 (Cloudflare Workers)
// Пересылает зашифрованные бинарные пакеты Web Push (aes128gcm + VAPID)
// напрямую в Apple APNs (web.push.apple.com) и Google FCM (fcm.googleapis.com)
// ============================================================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
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

    if (request.method === "GET") {
      return new Response(
        "✅ Облачный Push-сервер Pulse 24/7 активен и готов доставлять уведомления в Apple APNs и Google FCM!",
        {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "text/plain; charset=utf-8" }
        }
      );
    }

    if (request.method === "POST") {
      try {
        const data = await request.json();
        const endpoint = data.endpoint || data.u;
        const authHeader = data.authHeader || data.a;
        const bodyB64 = data.bodyB64 || data.b;

        if (!endpoint || !authHeader || !bodyB64) {
          return new Response(JSON.stringify({ ok: false, error: "Missing fields" }), {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
          });
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

        return new Response(
          JSON.stringify({ ok: apnsRes.ok, status: apnsRes.status }),
          {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ ok: false, error: String(err) }),
          {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
          }
        );
      }
    }

    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }
};
