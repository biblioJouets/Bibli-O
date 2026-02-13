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

ARG NEXT_PUBLIC_HCAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_URL

ENV NEXT_PUBLIC_HCAPTCHA_SITE_KEY=$NEXT_PUBLIC_HCAPTCHA_SITE_KEY

# Variables factices pour le build
ENV NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID=$NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV DATABASE_URL="postgresql://fake:fake@localhost:5432/fake"
ENV NEXT_PUBLIC_API_URL="https://bibliojouets.fr"
ENV MAILJET_API_KEY="fake_key"
ENV MAILJET_API_SECRET="fake_secret"
ENV MAILJET_SENDER_EMAIL="fake@email.com"
ENV MAILJET_CONTACT_LIST_ID="123456"
ENV HCAPTCHA_SECRET_KEY="fake_hcaptcha_secret"
ENV STRIPE_SECRET_KEY="sk_test_fake_build_key"

RUN npx prisma generate
RUN npm run build

# Étape runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Ajout indispensable pour Prisma
RUN apk add --no-cache openssl

# Création de l'utilisateur sécurisé
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Préparation du cache
RUN mkdir -p /app/.next/cache
RUN chown -R nextjs:nodejs /app/.next

# COPIE DES FICHIERS AVEC LES BONNES PERMISSIONS
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# PASSAGE EN MODE NON-ROOT (Sécurité Maximale)
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]


# Vérifie toutes les 30s si la page d'accueil répond
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1