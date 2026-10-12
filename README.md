# REASA — Mobile-first MCQ quiz platform

A Next.js 16 + TypeScript + Prisma/PostgreSQL website for international users. The content catalogue is seeded from `prisma/seed.ts` and includes 8 categories, 96 two-question quiz sets, and 192 unique multiple-choice questions.

## Local development

1. Copy your own `.env` into this directory and set `DATABASE_URL` plus a strong `SESSION_SECRET`.
2. Run `npm install`.
3. Run `npx prisma generate`.
4. Run `npx prisma migrate deploy` to apply the included authentication and timer migration.
5. Run `npx prisma db seed` once to replace the old category/puzzle catalogue with the new MCQ collection. **This removes old quizzes and their linked attempts/answers. Back up first if needed.**
6. Run `npm run dev` and visit `http://localhost:3000`.

## Production notes

- Set `NEXT_PUBLIC_SITE_URL` and a monitored `NEXT_PUBLIC_SUPPORT_EMAIL` before launch.
- Never commit `.env`; use hosting environment variables.
- Do not run the destructive seed on every deployment.
- Review `UPDATE-NOTES.md` for the AdSense and deployment checklist. A successful build and live database/browser tests are still required before launch.
