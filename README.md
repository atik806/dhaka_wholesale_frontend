# Dhaka Wholesale — Storefront

Customer-facing e-commerce storefront for [Dhaka Wholesale](https://github.com), built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and Supabase. It connects to the [Dhaka Wholesale API](../Dhaka_wholesale-backend).

## Tech Stack

- **Next.js 16** — App Router, RSC, ISR for fast catalog pages
- **React 19** with server/client component boundaries
- **Tailwind CSS v4** — utility-first styling with a custom design system (dark/light themes)
- **Zustand** — client state for cart, wishlist, and auth
- **SWR** — data fetching, caching, and revalidation
- **Framer Motion** — UI animations
- **Recharts** — admin dashboard revenue charts
- **Supabase** — auth (PKCE), database, and Realtime for live admin data

## Features

| Area | Highlights |
| --- | --- |
| **Storefront** | Hero carousel, featured categories, trending products, promo banners, customer reviews, newsletter |
| **Catalog** | Live search with suggestions, multi-category filters, price & rating filters, sorting, pagination |
| **Product pages** | Gallery, size/color variants, stock status, reviews, related products |
| **Shopping** | Cart drawer, wishlist, guest + logged-in checkout, delivery-zone shipping, COD |
| **Account** | Orders, address, and profile management |
| **Admin panel** | Dashboard (revenue trend, stats, recent orders, low stock), products, orders, users, reviews, contact, bug reports, site settings |
| **Polish** | Dark/light theme, responsive layouts, skip-to-content, loading & error states, sitemap + robots |

## Getting Started

### Prerequisites

- Node.js 18+
- The backend API running locally or deployed (see [backend README](../Dhaka_wholesale-backend/README.md))

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
```

## Project Structure

```
app/
├── page.tsx                    # Home page (ISR)
├── shop/                       # Catalog + category pages
├── product/[slug]/             # Product detail
├── cart/ checkout/ account/    # Shopping & account flows
├── admin/                      # Admin panel (login-protected)
└── layout.tsx                  # Root layout, fonts, metadata

src/
├── components/                 # UI, layout, home, product, checkout, admin
├── lib/                        # API clients, types, utils, constants
├── hooks/                      # Data hooks + realtime invalidation
├── providers/                  # Theme, toast, auth
└── store/                      # Zustand stores (cart, auth, wishlist)
```

## Deployment

Deploy to Vercel:

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project settings. If the API is deployed separately, add your frontend domain to the backend's `CORS_ORIGIN`.

## Related

- API: [Dhaka_wholesale-backend](../Dhaka_wholesale-backend)
