// main.ts
Deno.serve({ port: 8000 }, async (req) => {
  // Your stable HTTP stream URL (no token expiration)
  const STREAM_URL = "http://176.227.215.27:5539/stream";

  try {
    const response = await fetch(STREAM_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Icy-MetaData": "1"
      }
    });

    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Content-Type", "audio/mpeg");

    return new Response(response.body, {
      status: 200,
      headers
    });
  } catch (err) {
    console.error(err);
    return new Response("Stream unavailable", { status: 500 });
  }
});
