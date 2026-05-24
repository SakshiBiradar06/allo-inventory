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




# Allo Inventory – Take-Home Exercise

A Next.js inventory reservation system for multi-warehouse retail brands.

## What it does
When a customer clicks "Reserve", the item is held for 10 minutes while they complete payment.
- Payment succeeds → reservation confirmed, stock permanently decremented
- Payment fails / timer expires → reservation released, stock returned



## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Prisma 7 + Supabase (hosted Postgres)
- Tailwind CSS
- Zod for validation

## How to run locally

### 1. Clone the repo
git clone https://github.com/SakshiBiradar06/allo-inventory.git
cd allo-inventory

### 2. Install dependencies
npm install

### 3. Set up environment variables
Create a `.env` file:
DATABASE_URL="your-supabase-url"
DIRECT_URL="your-supabase-direct-url"

### 4. Run migrations
npx prisma migrate dev

### 5. Seed the database
npx ts-node prisma/seed.ts

### 6. Start the dev server
npm run dev

Open http://localhost:3000

## How expiry works in production
A Vercel Cron Job runs every minute hitting `/api/cron/expire`.
It finds all reservations where `status = pending` and `expiresAt < now`,
releases the stock back by decrementing the reserved count,
and marks those reservations as `released`.

Cron config in `vercel.json`:
```json
{
  "crons": [{ "path": "/api/cron/expire", "schedule": "* * * * *" }]
}
```

## How concurrency is handled
The reservation endpoint uses a Postgres `SELECT FOR UPDATE` inside a transaction.
This row-level lock ensures that if two requests come in simultaneously for the last unit,
only one will succeed — the other gets a 409 Not Enough Stock response.

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/products | List products with stock per warehouse |
| GET | /api/warehouses | List all warehouses |
| POST | /api/reservations | Create reservation (409 if no stock) |
| POST | /api/reservations/:id/confirm | Confirm payment (410 if expired) |
| POST | /api/reservations/:id/release | Cancel reservation |
| GET | /api/cron/expire | Release expired reservations |

## Trade-offs & things I'd do differently

1. **Redis locking** – I used Postgres SELECT FOR UPDATE for concurrency.
   With more time I'd add Redis distributed locks for better performance at scale.

2. **Idempotency** – Not implemented. Would use Redis to store request keys
   and return cached responses for duplicate requests.

3. **Auth** – No user authentication. In production each reservation
   would be tied to a user account.

4. **Tests** – No automated tests. Would add Jest unit tests for the
   reservation logic and concurrency scenarios.

5. **Real payment integration** – Confirm button simulates payment.
   Would integrate Razorpay or Stripe in production.
