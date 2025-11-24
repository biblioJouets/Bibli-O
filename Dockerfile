FROM node:20-alpine AS base

# Étape deps : installer les dépendances
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Étape builder : builder l'application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copier le fichier .env.production pour le build
COPY .env.production .env

# Générer le build
RUN npx prisma generate
RUN npm run build

# Étape runner : image production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Créer un utilisateur non root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Créer le dossier cache avec les bonnes permissions
RUN mkdir -p /app/.next/cache
RUN chown -R nextjs:nodejs /app/.next

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copier le fichier .env.production dans l'image finale
COPY .env.production .env

USER nextjs
EXPOSE 3000
ENV PORT=3000

# Lancer l'application standalone
CMD ["node", "server.js"]
