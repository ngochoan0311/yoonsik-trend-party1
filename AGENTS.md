# AGENTS.md

## Architecture
- `index.html` + `src/main.ts` + `src/style.css`: single-page frontend (Vite, vanilla TS, Tailwind v4 via `@tailwindcss/vite`). UI copy is in **Vietnamese**, so keep new copy in Vietnamese.
- `netlify/functions/participants.ts`: `GET /api/participants` returns `{ name, gaNumber }[]` only. `POST` validates and inserts a registration.
- `db/schema.ts` / `db/index.ts`: Drizzle schema and client (`drizzle-orm/netlify-db`). Migrations live in `netlify/database/migrations/` and are generated with `npx drizzle-kit generate --name ...`. Never edit applied migrations.
- `public/img/cover.png`: AI-generated cover art (no likeness of a real person), served through `/.netlify/images`.

## Conventions / decisions
- **Privacy:** `twitter` and `instagram` must never be exposed by any public endpoint.
- GA numbers are integers from 100 to 500 and unique. The DB unique constraint is the source of truth, and the function maps Postgres `23505` to HTTP 409.
- The project replaces an earlier Google Apps Script / Google Sheet backend. The original design came from the user's uploaded HTML and was kept close to it (baby-blue palette, layout, copy).
- `drizzle-orm` / `drizzle-kit` must stay on the `@beta` dist-tag.
