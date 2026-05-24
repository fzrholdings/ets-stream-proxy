// main.ts
Deno.serve({ port: 8000 }, async (req) => {
  // Allow CORS for your Google Site
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(STREAM_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Icy-MetaData": "1", // Required for Icecast metadata
        "Accept": "*/*",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status}`);
    }

    // Headers required for proper audio streaming
    const headers = new Headers({
      "Content-Type": "audio/mpeg",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "Content-Type, Icy-Br, Icy-Genre, Icy-Name",
      "Cache-Control": "no-cache, no-store",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked", // Force chunked transfer
    });

    // Copy any existing headers from the upstream
    if (response.headers.has("Icy-Br")) headers.set("Icy-Br", response.headers.get("Icy-Br"));
    if (response.headers.has("Icy-Name")) headers.set("Icy-Name", response.headers.get("Icy-Name"));

    return new Response(response.body, { headers });
  } catch (error) {
    console.error("Proxy error:", error);
    if (error.name === "AbortError") {
      return new Response("Stream timeout", { status: 504 });
    }
    return new Response("Stream unavailable", { status: 500 });
  }
});
