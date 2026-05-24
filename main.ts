Deno.serve({ port: 8000 }, async (req) => {
  // Handle CORS preflight (OPTIONS request)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Range, Icy-MetaData",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const STREAM_URL = "http://176.227.215.27:5539/stream";

  // Abort the upstream fetch if it takes longer than 15 seconds to respond
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const upstream = await fetch(STREAM_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Icy-MetaData": "1",
        "Accept": "*/*",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!upstream.ok) {
      throw new Error(`Upstream responded with ${upstream.status}`);
    }

    // Force proper audio streaming headers
    const headers = new Headers({
      "Content-Type": "audio/mpeg",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked",
    });

    // Return the response body as a stream
    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    if (err.name === "AbortError") {
      return new Response("Stream timeout (upstream slow)", { status: 504 });
    }
    return new Response("Stream unavailable", { status: 500 });
  }
});
