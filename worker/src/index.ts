export interface Env {
  SITE_BUCKET: R2Bucket;
}

const DOMAIN = "shipartifact.com";

const RESERVED_SUBDOMAINS = [
  "api",
  "www",
  "app",
  "admin",
  "mail",
  "ftp",
  "cdn",
];

function notFoundPage(slug: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Not Found — ShipArtifact</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #06080d;
      color: #e2e4e9;
    }
    .container { text-align: center; }
    h1 { font-size: 72px; font-weight: 700; color: #6366f1; }
    p { color: #6b7280; margin-top: 12px; font-size: 16px; }
    a { color: #6366f1; margin-top: 24px; display: inline-block; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>${slug}.${DOMAIN} does not exist yet.</p>
    <a href="https://${DOMAIN}">Create it on ShipArtifact &rarr;</a>
  </div>
</body>
</html>`;
}

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Extract subdomain
    const parts = hostname.split(".");
    if (
      parts.length < 3 ||
      hostname === DOMAIN ||
      hostname === `www.${DOMAIN}`
    ) {
      // Root domain — redirect to main site on Vercel
      return Response.redirect(
        `https://${DOMAIN}${url.pathname}`,
        301
      );
    }

    const slug = parts[0];

    if (RESERVED_SUBDOMAINS.includes(slug)) {
      return new Response("Not Found", { status: 404 });
    }

    // Fetch from R2
    const key = `sites/${slug}/index.html`;
    const object = await env.SITE_BUCKET.get(key);

    if (!object) {
      return new Response(notFoundPage(slug), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response(object.body, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60",
        "X-Powered-By": "ShipArtifact",
      },
    });
  },
};
