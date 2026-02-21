# LASU Engineering 2001 Alumni Platform (MVP)

Secure, role-based alumni platform for membership approvals, directory, department hubs, events/RSVPs, announcements, media, and Stripe-backed payments.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth (credentials/email+password)
- Stripe Checkout + webhook

## MVP Coverage

### Public pages

- `/` Home
- `/about`
- `/register`
- `/login`
- `/contact`
- `/verify-email`

### Protected member pages

- `/dashboard`
- `/profile`
- `/directory`, `/directory/[id]`
- `/departments`, `/departments/[slug]`
- `/events`, `/events/[id]`
- `/payments`
- `/announcements`
- `/media`
- `/pending-approval`

### Admin panel

- `/admin` (summary + basic analytics)
- `/admin/members` (approve/reject)
- `/admin/users` (role assignment, super-admin only)
- `/admin/events`
- `/admin/announcements`
- `/admin/payments`
- `/admin/audit`

## Environment Setup

1. Copy local template:

```bash
cp .env.example .env
```

2. Set required values in `.env`:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `SUPER_ADMIN_PASSWORD`

3. Optional integrations:

- SMTP: `SMTP_URL`, `MAIL_FROM`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (and optionally `STRIPE_PUBLIC_KEY`)

## Local Development

1. Start PostgreSQL:

```bash
docker compose up -d db
```

2. Install dependencies and prepare DB:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

3. Run app:

```bash
npm run dev
```

App: `http://localhost:3000`

## Stripe Webhook (Local)

If Stripe is configured, forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Set returned signing secret as `STRIPE_WEBHOOK_SECRET`.

## Docker Deployment

### Option A: App + DB with Compose

1. Copy Docker env template:

```bash
cp .env.docker.example .env
```

2. Update secrets in `.env` (`NEXTAUTH_SECRET`, `SUPER_ADMIN_PASSWORD`, Stripe keys as needed).
   Use `DOCKER_DATABASE_URL` to override the default container DB URL when needed.

3. Build/start:

```bash
docker compose up --build -d
```

App runs on `http://localhost:3000`.

On startup, the container runs `prisma migrate deploy` and seeds the 3 departments plus the initial Super Admin (idempotent).

### Option B: Build image directly

```bash
docker build -t lasu-eng-2001-platform .
docker run --rm -p 3000:3000 --env-file .env lasu-eng-2001-platform
```

## Useful Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:migrate:deploy`
- `npm run db:seed`

## Basic Checks

```bash
npm run lint
npm run typecheck
npm run build
```
