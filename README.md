This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This repo is configured for Vercel (App Router + API routes).

Requirements

- DATABASE_URL: Neon/Vercel Postgres pooled URL
- NEXTAUTH_SECRET: a strong random string
- NEXTAUTH_URL: your deployed URL (e.g., https://<project>.vercel.app)
- Optional: Vercel Blob enabled (used automatically in production for file uploads)

Steps

1. Push to GitHub and import the repo in Vercel
2. Set env vars above for Production (and Preview if needed)
3. Run initial migrations locally against the remote DB or via your CI
4. Deploy

Notes

- Local dev writes uploads to public/uploads; on Vercel, uploads go to Vercel Blob (public URLs) automatically.
