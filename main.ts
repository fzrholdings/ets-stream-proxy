// main.ts
Deno.serve({ port: 8000 }, async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Range, Icy-MetaData",
      },
    });
  }

  const STREAM_URL = "http://176.227.215.27:5539/stream";

  const upstream = await fetch(STREAM_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Icy-MetaData": "1",
    },
  });

  if (!upstream.body) {
    return new Response("No stream body", { status: 500 });
  }

  // Create a TransformStream to force chunked transfer
  const { readable, writable } = new TransformStream();
  upstream.body.pipeTo(writable).catch((err) => console.error("Pipe failed", err));

  return new Response(readable, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
});
