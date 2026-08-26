# Redendron Media

The Redendron Media website. Next.js 16 (App Router) with Payload CMS 3
embedded in the same app, so the site and its admin panel deploy as one thing.

- **Site** — `app/(frontend)`
- **Admin** — `app/(payload)`, served at `/admin`
- **Content model** — `cms/collections` and `cms/globals`

---

## Running it locally

```bash
npm install
npm run dev          # http://localhost:3000, admin at /admin
```

Local development uses a SQLite file (`redendron.db`) and stores uploads in
`public/media`. Neither is in git. Nothing you do locally can touch production
unless you deliberately point a script at it.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run generate:types` | Regenerate `cms/payload-types.ts` after a schema change |
| `npm run seed:prod` | Seed the production database and Blob store (see below) |

---

## Environment

`.env` is not in git. `.env.example` lists the shape.

| Variable | Needed | What it is |
| --- | --- | --- |
| `DATABASE_URI` | always | SQLite path locally; Postgres URL in production. Vercel's `POSTGRES_URL` / `DATABASE_URL` are also accepted. |
| `PAYLOAD_SECRET` | always | Signs sessions and password-reset tokens. **Never change it once real accounts exist** — doing so logs everyone out and invalidates pending resets. Generate with `openssl rand -base64 32`. |
| `NEXT_PUBLIC_SITE_URL` | always | Canonical origin. Used for `sitemap.xml`, `robots.txt` and share cards, so a wrong value here ships wrong URLs to Google. |
| `BLOB_READ_WRITE_TOKEN` | production | Vercel Blob. Without it, uploads go to the local disk — which on Vercel is read-only, so the media library breaks. |
| `BREVO_API_KEY` | production | Sends enquiry notifications and Payload's own account email, and files the enquiry in the CRM. |
| `LEAD_NOTIFY_EMAIL` | production | Where enquiries land. `team@redendron.com`. |
| `LEAD_FROM_EMAIL` | production | The verified Brevo sender enquiries come from. |
| `NEON_DATABASE_URI` | seeding only | Production Postgres, kept under its own name so local development stays on SQLite and pointing at production is always deliberate. |

There are no `SMTP_*` variables. Payload's account email goes over the Brevo
REST API using `BREVO_API_KEY` (`lib/payload-email.ts`), which is one
credential instead of five and behaves better on serverless.

---

## Deploying

The GitHub repo is connected to Vercel, so a push to the production branch
builds and deploys. Setting the environment variables above in
**Settings → Environment Variables** is what makes the build usable — a
deploy with a missing `BLOB_READ_WRITE_TOKEN` or `NEXT_PUBLIC_SITE_URL`
succeeds and is quietly wrong.

Payload creates and migrates its own schema on connect, so there is no
separate migration step.

### Seeding a fresh production database

Run from a machine that has the source media (`sanity-export/assets` and
`incoming/`, both outside git):

```bash
npm run seed:prod
```

It refuses to run without `NEON_DATABASE_URI`, `BLOB_READ_WRITE_TOKEN` and
`PAYLOAD_SECRET`, and every step is idempotent, so re-running it updates
rather than duplicates.

It deliberately does **not** create an admin account against a real database.
The first person to visit `/admin` on a freshly seeded site gets Payload's
create-first-user screen, which works exactly once.

---

## Giving your team access to the CMS

Everyone works in the same admin panel at `/admin`. There are two roles:

| Role | Can do |
| --- | --- |
| **Admin** | Everything, including creating and deleting accounts |
| **Editor** | Create, edit and publish all content and media; edit their own account only |

Editors cannot promote themselves to admin, and cannot create accounts. Give
people **Editor** unless they need to manage the team.

### Adding someone

1. Sign in as an admin, go to **System → Users → Create New**.
2. Fill in their name, their work email, and a role.
3. Set any password — you will not need to share it.
4. Tell them to go to `/admin`, click **Forgot password**, and enter their
   email. They will get a link and set their own password.

That last step matters: it means no password is ever sent over chat or email
by a person, and the one they end up with is one only they know. The reset
email is delivered by Brevo, so if it does not arrive, check the Brevo
transactional log before assuming the account is broken.

### Removing someone

**System → Users**, open them, delete. Their content stays; only the login
goes.

---

## Adding and changing content

| What | Where in the admin |
| --- | --- |
| Case studies | Case Studies |
| Service pages | Services |
| Packages | Packages |
| Journal posts | Posts (with Authors and Categories) |
| Logo strip on the home page | Clients |
| Quotes | Testimonials |
| Enquiries from the form | Leads (read-only in practice — they also go to Brevo and email) |
| Logos, favicon, share image, nav and footer details | Globals → Site Settings |

Content types with a **Publish** button are drafted by default: saving keeps
it private, publishing puts it on the site. Published pages are cached for
five minutes.

### Media

Upload through **Media**, or directly in the field you are filling. Payload
generates the sizes the site needs; upload the largest version you have and
let it do that. Always write the **alt text** — it is what screen readers
read out and what Google indexes.

In production the files go to Vercel Blob, not into this repo, so adding a
picture is never a deploy.

---

## Scripts

| Script | Purpose |
| --- | --- |
| `scripts/import-payload.ts` | Imports the legacy Sanity export and seeds the content the old site never had |
| `scripts/assign-images.ts` | Routes named files from `incoming/` into the right CMS field |
| `scripts/seed-branding.ts` | Puts the site's own logos and favicon into the media library |
| `scripts/seed-services.ts` | Tops up service page FAQs and related packages, additively |
| `scripts/export-sanity.mjs` | Re-exports from the old Sanity dataset |
| `scripts/seed-production.sh` | Runs the above against production, in order |

All of them look entities up by a natural key before writing, so running one
twice is safe.
