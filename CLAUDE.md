# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Generate Prisma client + build production bundle
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run Jest in watch mode
npm run db:push      # Sync Prisma schema to database (dev only)
```

Running a single test file:
```bash
npx jest src/components/__tests__/MyComponent.test.jsx
```

Docker:
```bash
docker-compose up -d            # Start containers in background
docker-compose up -d --build    # Rebuild images and start containers
docker-compose down             # Stop containers
```

## Architecture

**Bibliojouets** is a French toy rental/subscription platform (toy library). Users subscribe to plans, rent toys, and manage returns via Mondial Relay shipping.

### Tech Stack

- **Framework**: Next.js (App Router) with React 19
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth v4 (credentials + JWT sessions, role-based: `USER` / `ADMIN`)
- **Payments**: Stripe (one-time checkout + recurring subscriptions)
- **Shipping**: Mondial Relay API (pickup point selection, tracking)
- **Email**: Mailjet (transactional) + Brevo (newsletter)
- **Validation**: Zod schemas on API routes
- **Security**: hCaptcha on forms, bcryptjs passwords, rate limiting on login (5 req/min), CORS, CSP headers in `next.config.mjs`
- **Styling**: Tailwind CSS (preflight disabled — uses custom resets)

### Directory Layout

```
src/
├── app/
│   ├── api/           # API routes (App Router route handlers)
│   └── [routes]/      # Pages (French slugs: /bibliotheque, /panier, /mon-compte, /admin)
├── components/
│   └── account/       # User account sub-components (orders, profile, etc.)
├── lib/
│   ├── core/          # Shared infrastructure
│   │   ├── database/  # Prisma client singleton
│   │   ├── security/  # rateLimit.js, verifyCaptcha.js
│   │   ├── mailjet/   # Email client
│   │   ├── brevo/     # Newsletter client
│   │   └── middleware/ # errorHandler.js, logger.js
│   └── modules/       # Feature modules (cart, orders, products, users, contact, newsletter)
│       └── [feature]/
│           ├── [feature].service.js     # Business logic
│           ├── [feature].controller.js  # Request handling
│           └── [feature].model.js       # Data access (Prisma queries)
├── context/
│   └── CartContext.jsx  # Global cart state (React Context)
└── middleware.js        # Next.js middleware — CORS, auth guards for /admin, /mon-compte, /panier
```

### Key Data Models (Prisma)

- **Users** — email/password auth, role (`USER`/`ADMIN`), password reset tokens
- **Orders** — rental orders with Stripe subscription ID, Mondial Relay tracking, rental dates, status (`PENDING` → `SHIPPED` → `ACTIVE` → `RETURNING` → `RETURNED` → `COMPLETED`)
- **Products** — toy catalog with condition (`NEW`, `GOOD`, `FAIR`, `REPAIRING`, `RETIRED`), age range, category, brand
- **Cart / CartItem** — persistent cart tied to user session
- **Reviews** — anonymous or authenticated product reviews
- **PromoCodeUsage** — one promo code use per user
- **Address** — user delivery addresses

### API Route Conventions

Routes live in `src/app/api/`. They import controllers from `src/lib/modules/` which call services which call models (Prisma). Zod validates request bodies before passing to controllers. Rate limiting is applied at the route level via `src/lib/core/security/rateLimit.js`.

Admin-only routes check `session.user.role === 'ADMIN'`. The middleware in `src/middleware.js` enforces this at the edge before the route handler runs.

### Environment Variables

See `.env.example` for required variables. Key ones:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `MAILJET_API_KEY`, `MAILJET_API_SECRET`
- `HCAPTCHA_SECRET`

### Deployment

Docker-based deployment. `npm run build` runs `prisma generate` first. See `Dockerfile` and `.github/workflows/deploy.yml` for the CI/CD pipeline.
