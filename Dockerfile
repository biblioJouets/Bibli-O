FROM node:20-alpine AS base

# Étape deps
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Étape builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables factices pour build (Prisma / Next.js)
ENV DATABASE_URL="postgresql://fake:fake@localhost:5432/fake"
ENV NEXT_PUBLIC_API_URL="https://bibliojouets.fr"
ENV MAILJET_API_KEY="fake_key"
ENV MAILJET_API_SECRET="fake_secret"
ENV MAILJET_SENDER_EMAIL="fake@email.com"
ENV MAILJET_CONTACT_LIST_ID="123456"
ENV NEXT_PUBLIC_HCAPTCHA_SITE_KEY="fake_hcaptcha_key"
ENV HCAPTCHA_SECRET_KEY="fake_hcaptcha_secret"

RUN npx prisma generate
RUN npm run build

# Étape runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /app/.next/cache
RUN chown -R nextjs:nodejs /app/.next

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
