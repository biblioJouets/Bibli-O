create action for deplo to vps


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Setup Environment
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Update `.env.local` with your local database credentials.

### Installation
```bash
npm install
npx prisma generate
npx prisma db push  # Sync schema to database
npm run dev
```

### Security Notes
- **Never commit `.env` or `.env.local`** — they contain sensitive credentials
- `.env` files are ignored by `.gitignore` (see `.env.example` for template)
- Run `npm audit` regularly to check for vulnerabilities
- Security headers are configured in `next.config.mjs` (CSP, X-Frame-Options, HSTS, etc.)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
