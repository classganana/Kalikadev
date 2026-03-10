# Kalikadev — Premium Ecommerce

High-performance ecommerce platform for lithium batteries, with future support for apparel.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
- **UI:** shadcn/ui
- **Database:** MongoDB + Mongoose
- **Auth:** NextAuth (email/password) — to be implemented

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and set:
   - `MONGODB_URI` — MongoDB connection string
   - `NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER` — Admin WhatsApp number for checkout (e.g. 919876543210)

3. **Run development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
/app
  /(store)     — Customer-facing pages (home, products)
  /admin       — Admin dashboard placeholder
  /api         — API routes

/modules       — Domain logic (products, battery, orders, auth)
/components    — UI components (ui, store, admin)
/lib           — Utilities, DB connection, SEO config
/models        — Mongoose models (to be added)
```

## Architecture Notes

- **Server components by default** — Minimize client-side JavaScript
- **Modular design** — Domain logic isolated in `/modules`
- **Mongoose connection singleton** — Reuses connection across requests (`lib/db`)
- **SEO** — Centralized metadata in `lib/seo.ts`

## Seeding Products

```bash
npm run db:seed
```

Populates MongoDB with 6 battery products and their specifications. Requires `MONGODB_URI` in `.env.local`.

## Routes

| Path    | Description              |
|---------|--------------------------|
| `/`     | Home (store)             |
| `/batteries` | Battery products list |
| `/batteries/[slug]` | Product detail |
| `/cart` | Cart |
| `/checkout` | Checkout (WhatsApp order) |
| `/admin` | Admin dashboard |
| `/admin/login` | Admin login |
| `/admin/products` | Product list |
| `/admin/products/new` | Add product |
| `/admin/products/[slug]/edit` | Edit product |
| `/api/products` | GET all products |
| `/api/products/[slug]` | GET product by slug |
| `/api/health` | Health check endpoint |
# Kalikadev
