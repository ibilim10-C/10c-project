addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

// BOT_TOKEN must be set as a secret/environment variable in Cloudflare Worker (e.g., via Wrangler secret)
const BOT_TOKEN =
  typeof TW_BOT_TOKEN !== "undefined"
    ? TW_BOT_TOKEN
    : typeof BOT_TOKEN !== "undefined"
    ? BOT_TOKEN
    : null;

async function handleRequest(request) {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "Only POST allowed" }),
      { status: 405, headers: jsonCorsHeaders() }
    );
  }

  if (!BOT_TOKEN) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "BOT_TOKEN not configured in worker",
      }),
      { status: 500, headers: jsonCorsHeaders() }
    );
  }

  try {
    const form = await request.formData();
    const chat_id = form.get("chat_id");
    const caption = form.get("caption") || "";
    const photo = form.get("photo");

    if (!chat_id || !photo) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing chat_id or photo" }),
        { status: 400, headers: jsonCorsHeaders() }
      );
    }

    const fd = new FormData();
    fd.append("chat_id", chat_id);
    if (caption) fd.append("caption", caption);
    fd.append("photo", photo, photo.name || "photo.jpg");

    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: fd,
      }
    );

    const tgJson = await tgRes.json();
    return new Response(JSON.stringify(tgJson), {
      status: tgRes.status,
      headers: jsonCorsHeaders(),
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: jsonCorsHeaders(),
    });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonCorsHeaders() {
  return Object.assign({ "Content-Type": "application/json" }, corsHeaders());
}
