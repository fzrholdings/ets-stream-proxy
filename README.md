# ETS Ceylon FM Stream Proxy

This proxy converts HTTP radio stream to HTTPS for embedding in Google Sites.

## Deploy on Deno Deploy

1. Fork this repo or upload to your GitHub.
2. Go to [Deno Deploy](https://console.deno.com).
3. Create a new project → "Deploy from GitHub".
4. Select this repository.
5. Entrypoint: `main.ts`
6. Deploy.

## Stream URL after deploy:
`https://your-project.deno.dev`

## Embed in Google Sites:
```html
<audio controls autoplay>
  <source src="https://your-project.deno.dev" type="audio/mpeg">
</audio>
