# Colegiul Național „Costache Negruzzi” · website redesign demo

Next.js + Payload CMS, hosted on Vercel (Hobby), Neon Postgres, Vercel Blob for uploads.

## Local setup

```bash
npm install
npx vercel env pull .env.local --environment=production
npm run dev
```

Open http://localhost:3000/admin and create the first admin user.

Env vars: see `.env.example`.
