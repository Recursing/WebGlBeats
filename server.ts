const kv = await Deno.openKv();
const SIGNALING_TTL_MS = 10 * 60 * 1000; // 10 minutes
Deno.serve(async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const path = url.pathname;

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // POST /offer/:token - Phone sends offer
  if (req.method === "POST" && path.startsWith("/offer/")) {
    const token = path.split("/")[2];
    const offer = await req.text();
    await kv.set(["offer", token], offer, { expireIn: SIGNALING_TTL_MS });
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  // GET /offer/:token - PC polls for offer
  if (req.method === "GET" && path.startsWith("/offer/")) {
    const token = path.split("/")[2];
    const result = await kv.get(["offer", token]);
    if (result.value) {
      return new Response(JSON.stringify({ offer: result.value }), { headers });
    }
    return new Response(JSON.stringify({ offer: null }), { headers });
  }

  // POST /answer/:token - PC sends answer
  if (req.method === "POST" && path.startsWith("/answer/")) {
    const token = path.split("/")[2];
    const answer = await req.text();
    await kv.set(["answer", token], answer, { expireIn: SIGNALING_TTL_MS });
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  // GET /answer/:token - Phone polls for answer
  if (req.method === "GET" && path.startsWith("/answer/")) {
    const token = path.split("/")[2];
    const result = await kv.get(["answer", token]);
    if (result.value) {
      return new Response(JSON.stringify({ answer: result.value }), {
        headers,
      });
    }
    return new Response(JSON.stringify({ answer: null }), { headers });
  }

  return new Response("WebRTC Signaling Server", { headers });
});
