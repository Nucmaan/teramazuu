# Taste, Click & Vote — #SCIM2026

The campaign site for the **Week of Italian Cuisine in the World 2026** in Mogadishu, organised by the Embassy of Italy. Visitors learn about Tiramisù, find the participating restaurants, and vote. Administrators manage the campaign and see the results.

- **Campaign window:** 30 October – 10 November 2026, `Africa/Mogadishu` (UTC+3). You can change it in Admin → Settings.
- **Stack:** Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, Motion, PostgreSQL + Prisma 7, Zod, React Hook Form, Recharts, Radix primitives, Cloudflare Turnstile.

## Quick start

```bash
cp .env.example .env          # then set VOTE_HASH_SECRET and ADMIN_PASSWORD
npm install
npm run db:up                 # Postgres 17 in Docker, on port 5433
npm run db:migrate            # applies migrations (including the CHECK constraints)
npm run db:seed               # the 4 restaurants, the campaign settings, and the first OWNER admin
npm run dev
```

- Public site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- To try the ballot before voting opens, sign in as an admin and open `/vote?preview=1`. Preview votes are saved with a test flag. They never appear in counts, charts or public results. Owners can purge them from Admin → Votes.

| Script | Purpose |
| --- | --- |
| `npm run build` | Generates the Prisma client, then builds for production |
| `npm test` | Unit tests (validation, timezone) and database-constraint integration tests |
| `npm run typecheck` / `npm run lint` | Static checks |
| `npm run db:deploy` | Applies migrations in production |
| `npm run admin:create -- <email> <password> [OWNER\|EDITOR\|VIEWER] [name]` | Creates an admin or resets an admin's password |

## Architecture

```
app/(site)/          Public pages: home, results, privacy, terms (share nav and footer)
app/vote/            Ballot page and the submitVote server action
app/admin/           Login, plus a (panel) group: overview, votes, restaurants, QR, settings
app/media/[id]       Serves images uploaded in the admin (stored in Postgres)
components/home/     Homepage sections
components/vote/     Multi-step ballot, rating scale, Turnstile, success screen
components/admin/    Charts, forms, admin navigation
lib/                 db, auth, security, campaign (cached reads), admin-data, time, validation
prisma/              Schema, migrations, seed
proxy.ts             Quick cookie check that sends visitors without a session away from /admin
```

**Rendering.** The homepage, terms and results are cached with `"use cache"` and tagged. When admins edit content, `updateTag()` updates the public site immediately. `/vote` and the admin pages use a static shell and stream request-time data inside `<Suspense>`. The open/closed check runs on the server at request time.

**Voting safeguards.** None of these can guarantee one vote per person. Cookies can be cleared and networks are shared.
- Zod validation on the client and the server. Postgres `CHECK` constraints hold every rating between 1 and 5.
- The voting window is enforced on the server.
- Cloudflare Turnstile is verified on the server. In production, voting fails closed if the keys are missing.
- A configurable limit per device and restaurant, based on an anonymous cookie. Concurrent submissions are serialised with a Postgres advisory lock.
- A configurable limit per network per hour. Keep it generous, because diners share restaurant Wi-Fi.
- A hidden honeypot field.
- No raw IPs or identifiers are stored, only keyed HMAC fingerprints (`VOTE_HASH_SECRET`).

**Admin security.**
- Passwords are hashed with scrypt.
- Sessions use random tokens. Only the SHA-256 of each token is stored, so sessions can be revoked.
- Cookies are httpOnly and SameSite=Lax, and expire after 12 hours.
- Logins are throttled per email + network, with equal timing for unknown accounts.
- Every page, action and route checks the session against the database. `proxy.ts` is only the quick first check.
- Roles: **Owner** has everything, including settings, deleting votes and managing admins. **Editor** manages restaurants and images. **Viewer** sees analytics and can export.

**Charts.** All chart data comes from the database. Test votes are excluded. The palette was checked for colour-blind safety: Italian flag green against red fails deuteranopia separation, so the charts use green against violet. Every multi-series chart has a matching table.

## Production checklist

1. Set `NEXT_PUBLIC_SITE_URL` to the real domain. QR codes, the sitemap and Open Graph tags all use it. The QR page shows a warning while it points to localhost.
2. Create production Turnstile keys for that domain and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. The keys in `.env.example` are Cloudflare's always-pass test keys.
3. Generate a fresh `VOTE_HASH_SECRET` (32+ random bytes) and a strong `ADMIN_PASSWORD`.
4. Run `npm run db:deploy && npm run db:seed`.
5. Make sure the hosting proxy sets `X-Forwarded-For`, `X-Real-IP` or `CF-Connecting-IP` correctly. The per-network limit depends on it.

## Needs organiser approval

This list covers things not decided in this codebase. Nothing here claims approval from the Embassy.

- **The restaurant list conflicts between sources.** The project brief names La Terrazza, La Trattoria, Pescatore and Spaghetti House, and those four are seeded. The official poster (`public/images/terama.png`) instead lists Caffe Concerto, Cultiva, Il Giocoliere, La Dolce Vita, Lucca at Villa Rosa Kempinski, Mambo Italia, Non Solo Gelato and Sugo. Confirm the final list and update it in Admin → Restaurants. Restaurants can be added, edited, disabled, or deleted while they have no votes.
- **Official logos.** The navigation uses a text lockup in the poster's style rather than recreated emblems. Supply vector logos for the Embassy of Italy and the Italian Trade Agency, with permission to use them.
- **Restaurant descriptions and photos.** Descriptions are left blank on purpose. Card images are licensed Unsplash placeholders. Replace them with photos from each venue (upload in the admin).
- **Terms & Conditions and Privacy Policy.** The terms show the offer wording from the poster: complimentary Tiramisù after ordering a main dish, while stock lasts. The privacy page describes what the software actually does. Both need the Embassy's formal text.
- **Results.** The public leaderboard ranks by average overall rating. It stays hidden until an owner turns on "Public results". Confirm the official ranking method and any minimum number of votes.

## Image credits

Food photography in `public/images/photo/` comes from [Unsplash](https://unsplash.com/s/photos/tiramisu) under the Unsplash License. The campaign poster, the dessert photo and the "Week of the Italian Cuisine in the World" graphic in `public/images/` were supplied by the client.
