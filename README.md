# Oaisis — Project Management App

Modern project/files workspace built with Next.js App Router, featuring a multi-column explorer, previews for common file types, and simple tasks. Ready for Vercel with Postgres and Blob storage.

## Tech stack and libraries

- Next.js 15 (App Router, TypeScript, React 19)
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- NextAuth v4 (Credentials provider)
- Prisma v6 with PostgreSQL
- Vercel Blob (production file storage) with local filesystem fallback in dev
- Deployed on Vercel

Templates and setup:

- Bootstrapped with `create-next-app`
- ESLint Flat config with `next/core-web-vitals`

## Features

- Authentication (email + password)
  - Sign up and sign in screens
  - JWT session strategy (NextAuth)
- Dashboard
  - List your projects and create a new one
- Project explorer (multi-column)
  - Columns with resizable widths (discrete steps) and persistent view width
  - Directory tree with inline folder toggle and drag-and-drop to move files
  - File preview pane supports images, PDF, audio, video, and text/code with safe truncation
  - “note(tasks)” icon on items opens a side drawer to view/edit notes (label standardized to “note(tasks)”)
  - Upload and delete files
- Tasks (per project)
- Storage behavior
  - Development: files saved under `public/uploads`
  - Production: files uploaded to Vercel Blob with public URLs

Data model (Prisma): `User`, `Project`, `Task`, `Directory`, `File`

- `File` has `url`, optional `directoryId`, `size`, `mimeType`, and optional `note`
- `Directory` supports nesting via `parentId` and has optional `note`

## Project structure (abridged)

- `src/app` — App Router pages and API routes
  - `auth/[...nextauth]` — NextAuth handler
  - `auth/signin`, `auth/signup` — UI pages
  - `dashboard` — dashboard and project pages
  - `api/*` — REST endpoints (projects, directories, files, tasks, signup)
  - `api/admin/seed-demo` — guarded endpoint to seed a demo user
- `src/lib`
  - `prisma.ts` — Prisma singleton (serverless-safe)
  - `authOptions.ts` — centralized NextAuth options
  - `storage.ts` — helpers (production checks)
- `prisma/schema.prisma` — Prisma schema (PostgreSQL datasource)
- `public/uploads` — dev-only uploaded files
- `scripts/createDemoUser.ts` — optional local seeding script

## Environment variables

Required

- `DATABASE_URL` — PostgreSQL connection string (Neon/Vercel Postgres)
- `NEXTAUTH_SECRET` — strong random string
- `NEXTAUTH_URL` — your app URL (e.g. `http://localhost:3000` locally, `https://<app>.vercel.app` in prod)

Optional

- `SEED_TOKEN` — required to call the guarded demo-seed endpoint

Production (Vercel)

- Vercel Blob: enable the Vercel Blob integration on your project OR set `BLOB_READ_WRITE_TOKEN` in Environment Variables. The API uses this token when present.

## Local development

1. Install deps

```bash
npm install
```

2. Configure `.env`

- Set `DATABASE_URL` to a Postgres instance (recommended for parity). Example: Neon pooled URL.
- Set `NEXTAUTH_SECRET` to any strong random string for local.

3. Create DB schema

```bash
npx prisma db push
```

4. Start dev

```bash
npm run dev
```

Open http://localhost:3000

### Seed a demo user locally (optional)

Option A — via script

```bash
npx ts-node scripts/createDemoUser.ts
```

Option B — via API (requires `SEED_TOKEN` in `.env`)

- POST `http://localhost:3000/api/admin/seed-demo` with header `x-seed-token: <SEED_TOKEN>`

Demo credentials: `demo@demo.com` / `demo123`

## Deployment (Vercel)

1. Connect the repository to Vercel
2. Set env vars in Vercel → Project Settings → Environment Variables
   - `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
   - Optional `SEED_TOKEN` if using the seed endpoint
3. Deploy

This repo is configured to sync the schema during build:

- `package.json` build runs: `prisma db push && next build`
- `vercel.json` sets a 60s max duration for route handlers

Uploads

- Local dev: saved under `public/uploads`
- Vercel: uploaded to Vercel Blob with public URLs

### Troubleshooting uploads

- Error: `Vercel Blob: No token found`
  - Fix: In Vercel, either enable the Blob integration for this project or add `BLOB_READ_WRITE_TOKEN` env var. Redeploy.

## Security notes

- Passwords are stored in plaintext for demo simplicity. For production, update signup and sign-in to use `bcrypt` and hashed passwords throughout.
- The demo seeding endpoint is protected via a header token. Only set `SEED_TOKEN` in environments where you need it, and remove it afterward.

## Troubleshooting

- Error: `The table "public.User" does not exist`
  - Ensure `DATABASE_URL` is correct and run `npx prisma db push` (locally) or redeploy so the build step syncs the schema on Vercel.
- File previews not rendering in production
  - Ensure the app is deployed on Vercel (Blob integration available) and your uploaded files return public URLs.

## License

MIT (or your preferred license)
