FROM node:20-alpine AS base

# Installer les dépendances
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Builder l'application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables factices pour le build
ENV DATABASE_URL="postgresql://fake:fake@localhost:5432/fake"
ENV MAILJET_API_KEY="fake_key"
ENV MAILJET_API_SECRET="fake_secret"
ENV MAILJET_SENDER_EMAIL="fake@email.com"
ENV MAILJET_SENDER_NAME="Fake"
ENV MAILJET_CONTACT_LIST_ID="123456"
ENV ADMIN_RECEIVER_EMAIL="fake@email.com"
ENV NEXT_PUBLIC_HCAPTCHA_SITE_KEY="2e085516-cc5c-4ac8-847c-6ed2360a8150"
ENV HCAPTCHA_SECRET_KEY="fake_secret"
ENV NEXT_PUBLIC_API_URL="https://bibliojouets.fr"

RUN npx prisma generate
RUN npm run build

# Image de production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Créer le dossier cache avec les bonnes permissions
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
CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]
