# Yoonsik Trend Party

A baby-blue giveaway (GA) registration page for Yoonsik fans. Visitors sign up with a public display name, their X and Instagram profile links (kept private), and a unique GA number from 100 to 500. The public participant list shows only names and GA numbers.

## Tech

- Vite + TypeScript (vanilla) with Tailwind CSS v4
- Netlify Functions (`/api/participants`) for reading and submitting registrations
- Netlify Database (managed Postgres) with Drizzle ORM. A unique constraint keeps GA numbers from being taken twice.
- Netlify Image CDN for the cover art

## Run locally

```bash
npm install
netlify dev --port 8889
```

## Schema changes

Edit `db/schema.ts`, then run `npx drizzle-kit generate --name <change_name>`. Netlify applies the migrations on deploy.

## Viewing private registration data

Social links are stored in the `participants` table and never returned by the public API. You can read them with
`netlify db connect --query "SELECT name, twitter, instagram, ga_number FROM participants ORDER BY created_at"`.
