// main.ts
Deno.serve({ port: 8000 }, async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  const STREAM_URL = "http://176.227.215.27:5539/stream";

  try {
    const upstream = await fetch(STREAM_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!upstream.body) {
      return new Response("No stream", { status: 500 });
    }

    // Direct piping without TransformStream (simpler)
    const { readable, writable } = new TransformStream();
    upstream.body.pipeTo(writable).catch(() => {});

    return new Response(readable, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    return new Response("Stream error", { status: 500 });
  }
});
