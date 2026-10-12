# REASA Mobile-First International Quiz Update

This package replaces the previous visual-only update with a larger mobile-first implementation. The content seed intentionally resets the old quiz catalogue because that was requested.

## What changed

- Responsive layouts for mobile, tablet and desktop, including Android WebView-sized screens and safe-area spacing.
- Left-side navigation drawer with a dimmed backdrop and slide-in animation.
- Cleaner professional styling, DM Sans/Manrope typography and Lucide SVG icons instead of emoji-style navigation icons.
- Category cards and quiz cards use each category's own topic-related Unsplash photo URL; generic random image fallbacks were removed.
- Search now submits a real database query for published quiz titles, descriptions and category names.
- Login and signup use real database accounts, scrypt password hashes and an HTTP-only signed session cookie. Referral codes are accepted on sign-up; the account referral page provides a share/copy link.
- Quiz timer starts when the quiz player loads; elapsed time is saved with the result.
- Result sharing uses the Web Share API when available and copies the result link otherwise.
- Completed quiz sets are remembered in local storage and marked Completed in the category/search listings on that device; completed cards are no longer clickable there.
- The seed creates 8 topic-focused categories, 12 sets per category (96 sets total), and 192 unique MCQs. Each set contains two distinct four-option questions. Questions are not reused across sets in the seed catalogue.
- Fake homepage traffic/rating numbers were removed. Featured sections, counts and leaderboard data come from the database. The Trending section stays hidden until there are actual puzzles marked trending.
- Added Privacy, Terms, Contact, sitemap and robots routes, plus basic security headers. Removed the admin pages and admin mutation APIs rather than leaving unauthenticated content-management endpoints exposed.

## Windows setup

1. Extract this ZIP into a **new folder**; keep your old project as a backup.
2. Copy your existing working `.env` file into the new project root. Do not upload or share that file.
3. In `.env`, keep your existing working `DATABASE_URL` and add a unique session secret. Generate one in a terminal with:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```
   Copy the printed value into `.env` as `SESSION_SECRET="your-generated-value"`. Also set `NEXT_PUBLIC_SITE_URL` to your real production URL and `NEXT_PUBLIC_SUPPORT_EMAIL` to an email address you actually monitor.
4. Open a terminal in the project folder and run:
   ```powershell
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   npm run dev
   ```
5. Open `http://localhost:3000`.

### Important content reset

`npx prisma db seed` **deletes the old puzzles/categories and their linked attempts/answers** and then creates the new catalogue. This is intentional based on the request to remove the previous categories and quizzes. Back up the database first if you need any old results.

## Deployment and AdSense checklist

- Set `DATABASE_URL`, a strong unique `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_SUPPORT_EMAIL` in your hosting provider's environment settings.
- Run `npm install`, `npx prisma generate`, `npx prisma migrate deploy`, and `npx prisma db seed` in the deployment workflow as appropriate. Seed only once for the initial content reset; do not reseed on every deployment because it deletes quiz attempts.
- Run `npm run build` before production deployment and test login/signup, search, a complete quiz, result sharing, and the mobile drawer on a real phone/WebView.
- The Privacy/Terms/Contact pages are starter copy, not legal advice. Review them against the actual data practices and jurisdiction, configure the support contact, and add any advertising/analytics disclosures and consent platform required for your audience before applying to AdSense.
- AdSense approval is never guaranteed by code or policy pages alone; Google reviews the live site and content.

## Verification limitation

I checked TypeScript/TSX syntax across the project (zero syntax parse errors). A full Next.js build, database migration and live browser test could not be run in this environment because dependency installation timed out and the project's private database credentials are not available here. Therefore this ZIP is a substantial implementation update, but it must still pass the build and live integration steps above before production launch.


## Admin panel and authentication updates
- `/admin` requires an authenticated user whose database role is `ADMIN`.
- Create an account with the `ADMIN_EMAIL` value, configure `ADMIN_BOOTSTRAP_KEY`, then POST `/api/admin/bootstrap` with header `x-admin-bootstrap-key: <your key>`. Remove `ADMIN_BOOTSTRAP_KEY` immediately after success. Never put this key in browser code or commit `.env`.
- Admin can add/edit/publish/unpublish/delete puzzles, manage question text/images/options, and add/edit/hide categories. Public visual styling is preserved; admin UI uses the existing dark palette.
- Login/signup now redirect to `/profile`; navbar checks `/api/auth/me` and displays Profile while a valid session exists.
- Profile stats are derived from completed database attempts: completed attempts, XP (10 per earned point), and accuracy. These are database-based estimates, not manually entered values.
- Existing database `.env` and `SESSION_SECRET` must be retained. No migration/seed is needed for these additions.
