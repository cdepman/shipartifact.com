# ShipArtifact

Build in Claude. Ship to the world.

Deploy your Claude artifacts as live websites in seconds. Paste your code, pick a name, get a URL.

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/)
- PostgreSQL (local or remote)
- A [Clerk](https://clerk.com) account (for auth)
- A [Cloudflare](https://cloudflare.com) account (for R2 storage + Worker)

## Local Development Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up PostgreSQL

Create a local database:

```bash
createdb shipartifact
```

If you need to specify a user:

```bash
createdb -U your_username shipartifact
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

At minimum, set these for local dev:

```
POSTGRES_URL=postgresql://localhost:5432/shipartifact
POSTGRES_URL_NON_POOLING=postgresql://localhost:5432/shipartifact
```

See `.env.example` for all required variables (Clerk keys, Cloudflare R2 credentials, etc).

### 4. Run database migrations

Generate and apply the schema:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Cloudflare Worker (artifact subdomain serving)

The `worker/` directory contains a Cloudflare Worker that serves deployed artifacts at `*.shipartifact.com`.

```bash
cd worker
npm install
npx wrangler dev    # local dev
npx wrangler deploy # deploy to production
```

Configure the Worker Route for `*.shipartifact.com/*` in your Cloudflare dashboard or in `worker/wrangler.toml`.

## Project Structure

```
src/
  app/
    page.tsx              # Landing page
    dashboard/page.tsx    # User's deployed sites
    new/page.tsx          # Paste & deploy flow
    site/[slug]/page.tsx  # Site management
    api/
      deploy/route.ts     # Deploy pipeline
      preview/route.ts    # Preview generation
      sites/              # Site CRUD
  lib/
    db/                   # Schema, queries, connection
    artifact/             # Detection, wrapping, validation
    cloudflare/           # R2 upload client
  components/
    editor/               # Code editor, preview, deploy form
    dashboard/            # Site cards, empty state
    shared/               # Navbar, logo
worker/                   # Cloudflare Worker for *.shipartifact.com
```

## Deployment

### Vercel

Deploy the Next.js app to Vercel. Set all environment variables from `.env.example` in your Vercel project settings. Vercel will auto-detect the Next.js framework.

### Cloudflare

1. Add `shipartifact.com` to Cloudflare as a zone
2. Create an R2 bucket named `shipartifact-sites`
3. Set up wildcard DNS: `*` AAAA `100::` (proxied)
4. Deploy the Worker: `cd worker && npx wrangler deploy`
5. Configure the Worker Route for `*.shipartifact.com/*`

### DNS

- `shipartifact.com` → CNAME to `cname.vercel-dns.com` (DNS-only)
- `*.shipartifact.com` → AAAA `100::` (proxied, handled by Worker)
