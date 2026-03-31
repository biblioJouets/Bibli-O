OC.md
+1877
# Documentation Technique de Référence — Bibli'O Jouets
 
> **Version :** 1.0 — Mars 2026
> **Auteur :** Lead Developer Fullstack & Architecte Logiciel
> **Projet :** Bibli'O Jouets — Plateforme de location de jouets par abonnement
> **URL Production :** https://www.bibliojouets.fr
 
---
 
## Sommaire
 
1. [Architecture Globale](#1-architecture-globale)
   - 1.1 [Choix du App Router Next.js](#11-choix-du-app-router-nextjs)
   - 1.2 [Structure des dossiers](#12-structure-des-dossiers)
   - 1.3 [Flux de données Client ↔ Serveur](#13-flux-de-données-client--serveur)
   - 1.4 [Pattern Service Layer](#14-pattern-service-layer)
   - 1.5 [Stack technique complète](#15-stack-technique-complète)
 
2. [Modèle de Données (Prisma)](#2-modèle-de-données-prisma)
   - 2.1 [Vue d'ensemble des entités](#21-vue-densemble-des-entités)
   - 2.2 [Détail des modèles](#22-détail-des-modèles)
   - 2.3 [Enums](#23-enums)
   - 2.4 [Cycle de vie d'une location](#24-cycle-de-vie-dune-location)
   - 2.5 [Gestion du stock](#25-gestion-du-stock)
 
3. [Système d'Authentification (NextAuth)](#3-système-dauthentification-nextauth)
   - 3.1 [Configuration du provider](#31-configuration-du-provider)
   - 3.2 [Stratégie JWT et callbacks](#32-stratégie-jwt-et-callbacks)
   - 3.3 [Gestion des cookies](#33-gestion-des-cookies)
   - 3.4 [Protection des routes — Middleware](#34-protection-des-routes--middleware)
   - 3.5 [Flux de réinitialisation de mot de passe](#35-flux-de-réinitialisation-de-mot-de-passe)
   - 3.6 [Rate limiting](#36-rate-limiting)
 
4. [Logique de Paiement (Stripe)](#4-logique-de-paiement-stripe)
   - 4.1 [Architecture d'abonnement récurrent](#41-architecture-dabonnement-récurrent)
   - 4.2 [Grille tarifaire dynamique](#42-grille-tarifaire-dynamique)
   - 4.3 [Tunnel de souscription](#43-tunnel-de-souscription)
   - 4.4 [Gestion des codes promo](#44-gestion-des-codes-promo)
   - 4.5 [Webhooks Stripe](#45-webhooks-stripe)
   - 4.6 [Portail client Stripe](#46-portail-client-stripe)
   - 4.7 [Synchronisation DB ↔ Stripe](#47-synchronisation-db--stripe)
 
5. [Gestion du Catalogue et des Stocks](#5-gestion-du-catalogue-et-des-stocks)
   - 5.1 [Structure d'un produit](#51-structure-dun-produit)
   - 5.2 [Protocole d'hygiène — États du produit](#52-protocole-dhygiène--états-du-produit)
   - 5.3 [Disponibilité et filtres catalogue](#53-disponibilité-et-filtres-catalogue)
   - 5.4 [Administration produits](#54-administration-produits)
 
6. [Logistique et Livraison](#6-logistique-et-livraison)
   - 6.1 [Deux modes de livraison](#61-deux-modes-de-livraison)
   - 6.2 [Zones éligibles à la livraison domicile](#62-zones-éligibles-à-la-livraison-domicile)
   - 6.3 [Champs logistiques de la commande](#63-champs-logistiques-de-la-commande)
   - 6.4 [Flux de retour](#64-flux-de-retour)
   - 6.5 [Prolongation de location](#65-prolongation-de-location)
 
7. [Design System & UI](#7-design-system--ui)
   - 7.1 [Palette de couleurs](#71-palette-de-couleurs)
   - 7.2 [Typographie](#72-typographie)
   - 7.3 [Formes organiques et principes visuels](#73-formes-organiques-et-principes-visuels)
   - 7.4 [Composants UI réutilisables](#74-composants-ui-réutilisables)
   - 7.5 [Architecture CSS — Tailwind + Modules](#75-architecture-css--tailwind--modules)
 
8. [APIs — Référence Complète](#8-apis--référence-complète)
   - 8.1 [Tableau des endpoints](#81-tableau-des-endpoints)
   - 8.2 [Validation des données — Zod](#82-validation-des-données--zod)
   - 8.3 [Headers de sécurité HTTP](#83-headers-de-sécurité-http)
   - 8.4 [CORS](#84-cors)
   - 8.5 [hCaptcha](#85-hcaptcha)
 
9. [Emails Transactionnels (Brevo)](#9-emails-transactionnels-brevo)
   - 9.1 [Templates et identifiants](#91-templates-et-identifiants)
   - 9.2 [Format de l'ID de commande](#92-format-de-lid-de-commande)
   - 9.3 [Variables d'environnement Brevo](#93-variables-denvironnement-brevo)
 
10. [Déploiement & DevOps](#10-déploiement--devops)
    - 10.1 [Dockerfile multi-stage](#101-dockerfile-multi-stage)
    - 10.2 [Docker Compose](#102-docker-compose)
    - 10.3 [Variables d'environnement complètes](#103-variables-denvironnement-complètes)
    - 10.4 [Commandes de déploiement](#104-commandes-de-déploiement)
    - 10.5 [Processus de mise à jour sur VPS OVH](#105-processus-de-mise-à-jour-sur-vps-ovh)
 
11. [Tests](#11-tests)
    - 11.1 [Infrastructure de test](#111-infrastructure-de-test)
    - 11.2 [Tests existants](#112-tests-existants)
 
12. [Évolutions Futures](#12-évolutions-futures)
 
---
 
## 1. Architecture Globale
 
### 1.1 Choix du App Router Next.js
 
L'application est construite sur **Next.js 16+ avec l'App Router**, choisi pour les raisons suivantes :
 
| Critère | Choix | Justification |
|---------|-------|---------------|
| **Rendu** | App Router (RSC) | Server Components par défaut → moins de JS envoyé au client, meilleur SEO |
| **Routing** | Basé sur le système de fichiers | Zéro configuration, co-location layouts/pages |
| **API** | Route Handlers (`route.js`) | Remplacement natif d'Express pour les endpoints REST |
| **Performance** | `output: 'standalone'` | Image Docker réduite, démarrage rapide en production |
| **SEO** | `robots.js` + `sitemap.js` | Génération programmatique des fichiers de crawl |
 
**Pourquoi ne pas utiliser Pages Router ?**
Le App Router offre une meilleure gestion du streaming, une granularité fine sur le rendu (static vs dynamic), et facilite la migration vers React Server Components — essentiel pour la scalabilité future.
 
---
 
### 1.2 Structure des dossiers
 
```
bibliojouets/
├── src/
│   ├── app/                        # App Router Next.js
│   │   ├── api/                    # Route Handlers (endpoints REST)
│   │   │   ├── auth/[...nextauth]/ # NextAuth (login, logout, session)
│   │   │   ├── auth/forgot-password/
│   │   │   ├── auth/reset-password/
│   │   │   ├── cart/               # Gestion du panier
│   │   │   ├── checkout/           # Création session Stripe
│   │   │   ├── contact/            # Formulaire de contact
│   │   │   ├── cron/check-renewals/ # Cron job renouvellements
│   │   │   ├── items/[itemId]/action/
│   │   │   ├── newsletter/         # Inscription newsletter
│   │   │   ├── orders/             # Gestion commandes
│   │   │   ├── products/           # CRUD catalogue
│   │   │   ├── reviews/            # Avis produits
│   │   │   ├── stripe/             # Portail client Stripe
│   │   │   ├── upload/             # Upload fichiers (admin)
│   │   │   ├── users/              # Gestion utilisateurs
│   │   │   ├── verify-promo/       # Vérification codes promo
│   │   │   └── webhooks/stripe/    # Événements Stripe entrants
│   │   │
│   │   ├── admin/                  # Back-office (protégé ADMIN)
│   │   │   ├── page.js             # Dashboard
│   │   │   ├── orders/page.js      # Gestion des commandes
│   │   │   └── products/page.js    # Gestion des produits
│   │   │
│   │   ├── bibliotheque/           # Catalogue public
│   │   │   ├── page.js             # Liste des jouets
│   │   │   └── [id]/page.js        # Fiche produit
│   │   │
│   │   ├── abonnements/page.js     # Présentation des formules
│   │   ├── connexion/page.js       # Page de login
│   │   ├── inscription/page.js     # Page d'inscription
│   │   ├── panier/page.js          # Panier (auth requis)
│   │   ├── paiement/page.js        # Tunnel de paiement
│   │   ├── confirmation-commande/  # Post-checkout
│   │   ├── mon-compte/page.js      # Espace client (auth requis)
│   │   ├── mot-de-passe-oublie/
│   │   ├── reset-password/[token]/
│   │   ├── contact/page.js
│   │   ├── a-propos/page.js
│   │   ├── layout.js               # Layout racine (providers, metadata)
│   │   ├── page.js                 # Page d'accueil
│   │   ├── globals.css             # Styles globaux
│   │   ├── robots.js               # Règles SEO robots
│   │   └── sitemap.js              # Sitemap dynamique
│   │
│   ├── components/                 # Composants React réutilisables
│   │   ├── account/                # Composants espace client
│   │   └── *.jsx                   # Composants globaux
│   │
│   ├── context/
│   │   └── CartContext.jsx         # State management panier (Context API)
│   │
│   ├── lib/
│   │   ├── core/                   # Services d'infrastructure
│   │   │   ├── brevo/client.js     # Client email Brevo
│   │   │   ├── database/index.js   # Singleton Prisma Client
│   │   │   ├── middleware/         # Error handler, logger
│   │   │   ├── security/           # Rate limiting, hCaptcha
│   │   │   └── utils/              # Helpers (pricing, logger)
│   │   │
│   │   └── modules/                # Business logic par domaine
│   │       ├── cart/               # Service panier
│   │       ├── contact/            # Service contact
│   │       ├── newsletter/         # Service newsletter
│   │       ├── orders/             # Service commandes (logique centrale)
│   │       ├── products/           # Service catalogue
│   │       └── users/              # Service utilisateurs
│   │
│   ├── middleware.js               # Middleware Next.js (auth, CORS)
│   └── styles/                     # CSS modules (40+ fichiers)
│
├── prisma/
│   ├── schema.prisma               # Schéma base de données
│   └── migrations/                 # Historique des migrations
│
├── public/
│   ├── assets/                     # Images, icônes statiques
│   └── uploads/                    # Uploads utilisateurs (volume Docker)
│
├── Dockerfile                      # Build de production
├── docker-compose.yml              # Orchestration production
├── docker-compose.override.yml     # Surcharge développement
├── next.config.mjs                 # Configuration Next.js
├── tailwind.config.js              # Configuration Tailwind CSS
├── jest.config.js                  # Configuration tests
└── package.json
```
 
---
 
### 1.3 Flux de données Client ↔ Serveur
 
```
┌──────────────────────────────────────────────────────────────────┐
│                         NAVIGATEUR                                │
│                                                                  │
│   React Client Components  ←→  CartContext (state global)       │
│          ↕ fetch/axios                                           │
│   React Server Components  (lecture BDD directe côté serveur)   │
└─────────────────────┬────────────────────────────────────────────┘
                      │ HTTP / HTTPS
┌─────────────────────▼────────────────────────────────────────────┐
│                    NEXT.JS MIDDLEWARE                             │
│   (Auth check, CORS, redirect /connexion si non authentifié)     │
└─────────────────────┬────────────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────────────┐
│                   ROUTE HANDLERS (/api/*)                         │
│                                                                  │
│   Validation Zod → Controller → Service → Prisma Client          │
└─────────────────────┬────────────────────────────────────────────┘
                      │ Prisma ORM (SQL)
┌─────────────────────▼────────────────────────────────────────────┐
│                   POSTGRESQL 16                                   │
│                   (conteneur Docker)                             │
└──────────────────────────────────────────────────────────────────┘
 
Services tiers appelés par les Route Handlers :
  ├── Stripe API      (paiements, abonnements, webhooks entrants)
  ├── Brevo API       (emails transactionnels)
  └── Mondial Relay   (widget sélection point relais, côté client)
```
 
**React Server Components (RSC) vs Client Components :**
 
| Type | Usage dans ce projet | Marqueur |
|------|---------------------|----------|
| Server Component | Lecture BDD, pages statiques/dynamiques | Par défaut dans `/app` |
| Client Component | Panier (état), formulaires interactifs, sliders | `"use client"` en tête de fichier |
 
---
 
### 1.4 Pattern Service Layer
 
L'architecture métier suit un pattern **Controller → Service → Repository (Prisma)** :
 
```
Route Handler (src/app/api/*)
    └── Controller (src/lib/modules/[domaine]/*.controller.js)
            └── Service (src/lib/modules/[domaine]/*.service.js)
                    └── Prisma Client (src/lib/core/database/index.js)
```
 
**Avantages :**
- **Testabilité** : les services sont des fonctions pures testables sans HTTP
- **Réutilisabilité** : un service peut être appelé depuis plusieurs routes (ex: `createOrder` est appelé depuis le webhook Stripe)
- **Séparation des responsabilités** : la route gère l'entrée HTTP, le service gère la logique métier
 
**Exemple concret — création de commande :**
```
POST /api/webhooks/stripe (checkout.session.completed)
    → webhook route.js
        → createOrder() [order.service.js]
            → prisma.$transaction() [stock check + order create + stock decrement]
            → sendOrderConfirmation() [brevo/client.js]
```
 
---
 
### 1.5 Stack technique complète
 
| Catégorie | Technologie | Version | Rôle |
|-----------|-------------|---------|------|
| **Framework** | Next.js | ^16.1.1 | SSR, App Router, Route Handlers |
| **UI** | React | ^19.2.3 | Composants client |
| **Styling** | Tailwind CSS | ^3.4.1 | Classes utilitaires |
| **Styling** | CSS Modules | — | Styles composant-spécifiques |
| **Base de données** | PostgreSQL | 16 | Stockage persistant |
| **ORM** | Prisma | ^5.19.0 | Accès DB typé, migrations |
| **Auth** | NextAuth.js | ^4.24.7 | Sessions JWT, providers |
| **Paiement** | Stripe | ^20.1.0 (SDK backend) | Abonnements récurrents |
| **Paiement** | @stripe/stripe-js | ^8.6.0 (SDK frontend) | Redirect Stripe Checkout |
| **Email** | Brevo (@getbrevo/brevo) | ^3.0.1 | Emails transactionnels |
| **Validation** | Zod | ^3.22.4 | Validation des payloads API |
| **Sécurité** | bcryptjs | ^2.4.3 | Hachage mots de passe |
| **Sécurité** | hCaptcha (@hcaptcha/react-hcaptcha) | ^1.10.0 | Anti-bot inscription/contact |
| **Sanitisation** | isomorphic-dompurify | ^2.19.0 | Nettoyage HTML entrant |
| **Icônes** | Font Awesome | ^6.5.1 | Icônes SVG |
| **Icônes** | Lucide React | ^0.420.0 | Icônes SVG alternatif |
| **Police** | Quicksand (@fontsource) | ^5.0.0 | Typographie principale |
| **Cookie** | react-cookie-consent | ^9.0.0 | Bandeau RGPD |
| **SEO** | next-sitemap | ^4.2.3 | Génération sitemap |
| **Livraison** | Mondial Relay (widget) | — | Sélection point relais |
| **Tests** | Jest | ^29.7.0 | Runner de tests |
| **Tests** | @testing-library/react | ^16.0.0 | Tests composants |
| **Conteneur** | Docker | — | Environnement isolé |
| **Infra** | VPS OVH + Nginx Proxy Manager | — | Reverse proxy HTTPS |
 
---
 
## 2. Modèle de Données (Prisma)
 
### 2.1 Vue d'ensemble des entités
 
```
Users ──────── Orders ──────── OrderProducts ──── Products
  │              │                                    │
  ├── Cart        ├── (stripeSubscriptionId)           ├── Reviews
  │    └── CartItem                                   └── CartItem
  ├── Address
  ├── Reviews
  └── PromoCodeUsage
 
ContactMessage          (entité autonome)
newsletter_subscribers  (entité autonome)
```
 
### 2.2 Détail des modèles
 
#### `Users`
```prisma
model Users {
  id               Int       @id @default(autoincrement())
  firstName        String?   @db.VarChar(255)
  lastName         String?   @db.VarChar(255)
  email            String    @unique @db.VarChar(255)
  password         String    @db.VarChar(255)       // Hash bcrypt
  phone            String?   @db.VarChar(20)
  role             Role      @default(USER)          // USER | ADMIN
  resetToken       String?   @unique @db.VarChar(255)
  resetTokenExpiry DateTime? @db.Timestamptz(6)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  // Relations
  Orders           Orders[]
  Addresses        Address[]
  reviews          Reviews[]
  promoCodeUsages  PromoCodeUsage[]
  cart             Cart?
}
```
 
**Points clés :**
- `password` : jamais exposé en API (service `getById` doit l'exclure)
- `role` : utilisé par le middleware pour autoriser l'accès admin
- `resetToken` + `resetTokenExpiry` : utilisés pour le flux mot de passe oublié, tokens invalidés à usage unique
 
---
 
#### `Orders`
```prisma
model Orders {
  id                   Int          @id @default(autoincrement())
  totalAmount          Float
  status               OrderStatus  @default(PENDING)
  hasExchangedThisMonth Boolean     @default(false)  // Jeton d'échange mensuel
  // Logistique aller
  trackingNumber       String?      // Numéro de suivi expédition
  trackingUrl          String?      // URL de suivi direct
  mondialRelayPointId  String?      // ID point relais (ex: "FR-12345") ou "DOMICILE"
  shippingName         String?
  shippingAddress      String?
  shippingZip          String?
  shippingCity         String?
  shippingPhone        String?
  // Logistique retour & location
  returnTrackingNumber String?      // Suivi retour client
  returnLabelUrl       String?      // URL PDF étiquette retour (espace client)
  rentalStartDate      DateTime?    // Début réel (à la réception du colis)
  stripeSubscriptionId String?      // Lien avec l'abonnement Stripe
  userId               Int?
  Users                Users?       @relation(...)
  OrderProducts        OrderProducts[]
}
```
 
**Points clés :**
- `stripeSubscriptionId` est la clé de jointure entre les webhooks Stripe et les commandes
- `hasExchangedThisMonth` implémente la logique de limitation d'échange mensuel (1 échange/mois max)
- `rentalStartDate` est distinct de `createdAt` : la location commence à la réception physique, pas à la commande
 
---
 
#### `OrderProducts` (table de jointure enrichie)
```prisma
model OrderProducts {
  OrderId          Int
  ProductId        Int
  quantity         Int       @default(1)
  rentalEndDate    DateTime? // Date butoir de retour
  nextBillingDate  DateTime? // Date anniversaire (prochain prélèvement)
  renewalIntention String?   // "PROLONGATION" | "RESILIATION" | "PAIEMENT_ECHOUE" | null
  @@id([OrderId, ProductId]) // Clé primaire composite
}
```
 
**Points clés :**
- Ce modèle est le cœur de la logique d'abonnement : `nextBillingDate` est mis à jour à chaque `invoice.paid`
- `renewalIntention` pilote le comportement du webhook (quels produits renouveler)
- `null` = reconduction tacite (comportement par défaut)
 
---
 
#### `Products`
```prisma
model Products {
  id          Int              @id @default(autoincrement())
  reference   String           @unique @db.VarChar(50)  // SKU interne
  name        String           @db.VarChar(255)
  description String?
  price       Float                                     // Prix mensuel de location
  stock       Int              @default(0)
  highlights  String[]                                  // Points forts (tableau)
  brand       String?
  ageRange    String?                                   // Ex: "0-12 mois", "3-5 ans"
  category    String?                                   // Ex: "Éveil", "Construction"
  material    String?
  tags        String[]
  images      String[]                                  // Chemins vers /uploads/
  manualUrl   String?                                   // URL notice PDF
  weight      Float?           // kg
  length      Float?           // cm
  width       Float?           // cm
  height      Float?           // cm
  pieceCount  Int?
  condition   ProductCondition @default(NEW)            // État physique
  isFeatured  Boolean          @default(false)          // Mise en avant homepage
  rating      Float            @default(0)
}
```
 
---
 
#### Autres modèles
 
| Modèle | Rôle |
|--------|------|
| `Cart` | Un seul panier par utilisateur (`userId @unique`) |
| `CartItem` | Article dans le panier, lié à `Cart` et `Products` |
| `Address` | Adresse de livraison sauvegardée, supports `isDefault` |
| `Reviews` | Avis produit, auteur optionnel (abonnés anonymes) |
| `PromoCodeUsage` | Traçabilité de l'utilisation de codes promo (anti-double usage) |
| `ContactMessage` | Historique des messages du formulaire de contact |
| `newsletter_subscribers` | Emails inscrits à la newsletter |
 
---
 
### 2.3 Enums
 
#### `OrderStatus`
 
```
PENDING     → Commande créée, en attente de traitement
PREPARING   → En cours de préparation (état à la création via webhook)
SHIPPED     → Colis expédié (numéro de suivi renseigné)
ACTIVE      → Reçu par le client (location en cours)
RETURNING   → Client a renvoyé le colis
RETURNED    → Colis réceptionné par Bibli'O
COMPLETED   → Vérifié et clôturé
CANCELLED   → Annulé
```
 
**Transitions typiques :**
```
PENDING → PREPARING → SHIPPED → ACTIVE → RETURNING → RETURNED → COMPLETED
                                  ↑
                          (webhook invoice.paid → renouvellement)
```
 
#### `ProductCondition`
 
```
NEW        → Neuf, jamais loué
GOOD       → Bon état général, quelques traces d'usure légères
FAIR       → Usure visible, toutes pièces présentes et fonctionnelles
REPAIRING  → En maintenance / nettoyage approfondi (indisponible temporairement)
RETIRED    → Retiré du catalogue (irréparable, perdu, obsolète)
```
 
> **Protocole hygiène :** après chaque retour, le jouet est mis en `REPAIRING` pendant le protocole de nettoyage. Il repasse en `GOOD` ou `FAIR` à la fin du contrôle. S'il ne passe pas le contrôle, il passe en `RETIRED`.
 
---
 
### 2.4 Cycle de vie d'une location
 
```
1. Souscription (checkout.session.completed webhook)
   → Order créé avec status: PREPARING
   → OrderProducts créés avec:
     - rentalEndDate = now + 30 jours
     - nextBillingDate = now + 30 jours
     - renewalIntention = null (tacite)
 
2. Expédition (admin)
   → Order.status = SHIPPED
   → Order.trackingNumber renseigné
 
3. Réception client (admin ou automatique)
   → Order.status = ACTIVE
   → Order.rentalStartDate = date réception
 
4. Renouvellement mensuel (invoice.paid webhook)
   → OrderProducts.rentalEndDate += 30 jours
   → OrderProducts.nextBillingDate += 30 jours
   → OrderProducts.renewalIntention = null (reset)
   → Email de confirmation envoyé (template Brevo #13)
 
5. Retour
   → Order.status = RETURNING
   → Order.returnLabelUrl renseigné (URL PDF)
   → Email avec étiquette envoyé au client
 
6. Réception retour
   → Order.status = RETURNED
   → Jouets passent en condition REPAIRING
 
7. Clôture
   → Order.status = COMPLETED
   → Jouets repassent en GOOD ou FAIR selon contrôle
```
 
---
 
### 2.5 Gestion du stock
 
La disponibilité est gérée par le champ `Products.stock` (entier). La décrémentation est **atomique** via une transaction Prisma :
 
```javascript
// src/lib/modules/orders/order.service.js
const result = await prisma.$transaction(async (tx) => {
  // 1. Vérification stock AVANT création
  for (const item of cartData.items) {
    const product = await tx.products.findUnique({ where: { id: item.productId } });
    if (!product || product.stock < item.quantity) {
      throw new Error(`Stock insuffisant pour : ${product?.name}`);
    }
  }
  // 2. Création commande
  const newOrder = await tx.orders.create({ ... });
  // 3. Décrémentation atomique
  for (const item of cartData.items) {
    await tx.products.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } }
    });
  }
  return { newOrder, user };
});
```
 
> **Évolution future :** implémenter une réservation temporaire de stock (ex: 15 min) lors de l'ajout au panier pour éviter la rupture concurrente sur les produits en stock limité.
 
---
 
## 3. Système d'Authentification (NextAuth)
 
### 3.1 Configuration du provider
 
**Fichier :** `src/app/api/auth/[...nextauth]/route.js`
 
NextAuth est configuré avec un unique **CredentialsProvider** (email + mot de passe) :
 
```javascript
CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Mot de passe", type: "password" }
  },
  async authorize(credentials, req) {
    // 1. Rate limiting (5 tentatives/minute par email)
    const rateLimit = checkRateLimit(credentials.email, 5);
    if (!rateLimit.allowed) throw new Error("Trop de tentatives. Réessayez dans 1 minute.");
 
    // 2. Lookup utilisateur
    const user = await prisma.users.findUnique({ where: { email: credentials.email } });
    if (!user) return null;
 
    // 3. Vérification bcrypt
    const isValid = await compare(credentials.password, user.password);
    if (!isValid) return null;
 
    // 4. Retourne l'objet utilisateur (id, name, email, role)
    return { id: user.id.toString(), name: user.firstName, email: user.email, role: user.role };
  }
})
```
 
**Pourquoi CredentialsProvider uniquement ?**
L'application cible des familles françaises — pas de compte Google/Apple requis. Cette approche simplifie l'UX et évite les dépendances OAuth externes, tout en conservant une sécurité robuste via bcrypt.
 
---
 
### 3.2 Stratégie JWT et callbacks
 
```javascript
session: { strategy: "jwt" },
 
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role;  // Ajout du rôle au token JWT
      token.id   = user.id;    // Ajout de l'ID utilisateur
    }
    return token;
  },
  async session({ session, token }) {
    if (session?.user) {
      session.user.role = token.role;  // Expose le rôle dans la session
      session.user.id   = token.id;    // Expose l'ID dans la session
    }
    return session;
  }
}
```
 
**Accès à la session côté serveur :**
```javascript
// Dans un Route Handler
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
 
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
 
// Accès au rôle
if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });
 
// Accès à l'ID
const userId = parseInt(session.user.id);
```
 
---
 
### 3.3 Gestion des cookies
 
La configuration des cookies s'adapte automatiquement à l'environnement (HTTP local vs HTTPS production) :
 
```javascript
const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https");
 
cookies: {
  sessionToken: {
    name: useSecureCookies
      ? "__Secure-next-auth.session-token"   // HTTPS production
      : "next-auth.session-token",            // HTTP développement
    options: {
      httpOnly: true,      // Non accessible en JavaScript (protection XSS)
      sameSite: "lax",     // Protection CSRF
      path: "/",
      secure: useSecureCookies,
    },
  },
}
```
 
> **Pourquoi cette configuration explicite ?** En environnement Docker local (HTTP), Next.js essaie parfois d'utiliser les cookies `__Secure-*` qui nécessitent HTTPS. Cette surcharge explicite évite les bugs de session en développement.
 
---
 
### 3.4 Protection des routes — Middleware
 
**Fichier :** `src/middleware.js`
 
Le middleware Next.js intercepte **toutes les requêtes** et applique plusieurs couches de protection :
 
```javascript
export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const path = request.nextUrl.pathname;
 
  // Route admin (pages) → rôle ADMIN requis
  if (path.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }
 
  // API admin (GET all orders, PUT/POST/DELETE products)
  const isAdminApi = (path.startsWith("/api/orders") && method === "GET" && !path.includes("/user/"))
                  || (path.startsWith("/api/products") && ["POST", "PUT", "DELETE"].includes(method));
  if (isAdminApi && token?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé : Admin requis" }, { status: 403 });
  }
 
  // Routes utilisateur → authentification requise
  if ((path.startsWith("/mon-compte") || path.startsWith("/panier")) && !token) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("callbackUrl", path);  // Redirect post-login
    return NextResponse.redirect(url);
  }
 
  // Upload → ADMIN uniquement
  if (path.startsWith("/api/upload") && token?.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }
}
```
 
**Résumé des protections :**
 
| Route | Protection |
|-------|------------|
| `/admin/*` | Rôle ADMIN — redirect `/` sinon |
| `/api/upload` | Rôle ADMIN — 401 sinon |
| `GET /api/orders` (liste globale) | Rôle ADMIN — 403 sinon |
| `POST/PUT/DELETE /api/products` | Rôle ADMIN — 403 sinon |
| `/mon-compte`, `/panier` | Authentifié — redirect `/connexion` sinon |
 
---
 
### 3.5 Flux de réinitialisation de mot de passe
 
```
1. Utilisateur soumet son email → POST /api/auth/forgot-password
2. Si email trouvé en DB :
   - Génération d'un token unique + expiry (+1h)
   - Sauvegarde dans Users.resetToken et Users.resetTokenExpiry
   - Envoi email Brevo avec lien : /reset-password/[token]
3. Utilisateur clique le lien → page /reset-password/[token]
4. Soumission du nouveau mot de passe → POST /api/auth/reset-password
   - Vérification token valide + non expiré
   - Hash bcrypt du nouveau mot de passe
   - Mise à jour Users.password
   - Invalidation du token (resetToken = null, resetTokenExpiry = null)
```
 
---
 
### 3.6 Rate limiting
 
**Fichier :** `src/lib/core/security/rateLimit.js`
 
Implémentation par **fenêtre glissante** en mémoire (Map in-process) :
 
```javascript
const WINDOW_MS = 60 * 1000;  // Fenêtre de 1 minute
 
export function checkRateLimit(identifier, maxRequests = 5) {
  const now = Date.now();
  const data = requests.get(identifier);
 
  if (!data || now - data.windowStart > WINDOW_MS) {
    // Nouvelle fenêtre
    requests.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetIn: WINDOW_MS };
  }
 
  if (data.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: WINDOW_MS - (now - data.windowStart) };
  }
 
  data.count++;
  return { allowed: true, remaining: maxRequests - data.count, ... };
}
```
 
**Identifiant utilisé :** email de connexion (pas l'IP) — permet une protection ciblée par compte.
 
> **Limitation connue :** ce rate limiter est in-process, donc non partagé entre plusieurs instances Node.js. En cas de scaling horizontal, passer à Redis (ex: `@upstash/ratelimit`).
 
---
 
## 4. Logique de Paiement (Stripe)
 
### 4.1 Architecture d'abonnement récurrent
 
L'application utilise le mode **Subscription Stripe** avec **Stripe Checkout** (page de paiement hébergée par Stripe). Chaque abonnement correspond à une commande active (1 Order = 1 Stripe Subscription).
 
```
Client                  Next.js                  Stripe                  Webhook
  │                        │                        │                        │
  │ POST /api/checkout      │                        │                        │
  │──────────────────────→ │                        │                        │
  │                        │ stripe.checkout.sessions.create()               │
  │                        │──────────────────────→ │                        │
  │                        │ ← { url: stripe_url }  │                        │
  │ ← { url }              │                        │                        │
  │                        │                        │                        │
  │ redirect → Stripe Checkout                      │                        │
  │──────────────────────────────────────────────→ │                        │
  │ ← success_url (/confirmation-commande)          │                        │
  │                        │                        │                        │
  │                        │               checkout.session.completed        │
  │                        │──────────────────────────────────────────────→ │
  │                        │                        │  createOrder() + email │
```
 
---
 
### 4.2 Grille tarifaire dynamique
 
Les prix sont définis dans le dashboard Stripe et référencés par variables d'environnement :
 
**Fichier :** `src/lib/core/utils/subscription.js`
 
| Jouets | Prix/mois | Variable d'env |
|--------|-----------|----------------|
| 1 | 20 € | `STRIPE_PRICE_1_TOY` |
| 2 | 25 € | `STRIPE_PRICE_2_TOYS` |
| 3 | 35 € | `STRIPE_PRICE_3_TOYS` |
| 4 | 38 € | `STRIPE_PRICE_4_TOYS` |
| 5 | 45 € | `STRIPE_PRICE_5_TOYS` |
| 6 | 51 € | `STRIPE_PRICE_6_TOYS` |
| 7 | 56 € | `STRIPE_PRICE_7_TOYS` |
| 8 | 60 € | `STRIPE_PRICE_8_TOYS` |
| 9 | 63 € | `STRIPE_PRICE_9_TOYS` |
| 10+ | Sur devis | Contact `/contact` |
 
```javascript
// Correspondance dans /api/checkout/route.js
const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
const pricingMap = {
  1: process.env.STRIPE_PRICE_1_TOY,
  // ...
  9: process.env.STRIPE_PRICE_9_TOYS
};
const priceId = pricingMap[count];
line_items = [{ price: priceId, quantity: 1 }];
```
 
---
 
### 4.3 Tunnel de souscription
 
**Étape 1 — Sélection des jouets** (`/bibliotheque` → `/panier`)
- L'utilisateur ajoute des jouets au panier (CartContext + API `/api/cart`)
- Quantité totale calculée côté client
 
**Étape 2 — Choix livraison + paiement** (`/paiement`)
- Sélection mode livraison (Point Relais via widget Mondial Relay ou Domicile)
- Renseignement des informations de livraison
- Saisie optionnelle d'un code promo
 
**Étape 3 — Création session Stripe** (`POST /api/checkout`)
```javascript
const stripeSession = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items: [{ price: priceId, quantity: 1 }],
  mode: "subscription",
  customer_email: session.user.email,
  discounts: stripeDiscount,           // Code promo Stripe (si UGC)
  allow_promotion_codes: true,          // Permet la saisie de code sur la page Stripe
  success_url: `${baseUrl}/confirmation-commande?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/paiement`,
  metadata: {
    userId, cartSnapshot, cartId,
    shippingName, shippingAddress, shippingCity, shippingZip, shippingPhone,
    mondialRelayPointId, applied_promo
  }
});
```
 
**Étape 4 — Paiement Stripe** (page externe Stripe)
 
**Étape 5 — Webhook `checkout.session.completed`** → création commande en DB + email
 
**Étape 6 — Confirmation** (`/confirmation-commande?session_id=...`)
 
---
 
### 4.4 Gestion des codes promo
 
Deux systèmes distincts coexistent :
 
#### Code interne `BIBLIOMOISOFFERT`
- **Mécanisme :** 1er mois payant, 2ème mois offert (BOGO — Buy One Get One)
- **Implémentation :**
  1. Vérification d'unicité en DB (`PromoCodeUsage`) avant checkout
  2. Si OK → metadata `applied_promo: "BIBLIOMOISOFFERT"` dans la session Stripe
  3. Dans le webhook `checkout.session.completed` :
     - Enregistrement en `PromoCodeUsage` (anti-double via contrainte unique `userId+promoCode`)
     - Application d'un coupon Stripe sur l'abonnement (`stripe.subscriptions.update`)
  4. Gestion des retries Stripe : si `P2002` (doublon Prisma) avec même `subscriptionId` → c'est un retry, on ignore silencieusement
 
#### Codes UGC dynamiques (influenceurs, partenariats)
- Gérés entièrement dans le **dashboard Stripe**
- Vérification à la volée via `stripe.promotionCodes.list({ code, active: true })`
- Si valide → `stripeDiscount = [{ promotion_code: promoCodes.data[0].id }]`
 
---
 
### 4.5 Webhooks Stripe
 
**Fichier :** `src/app/api/webhooks/stripe/route.js`
 
**Sécurité — vérification de signature :**
```javascript
event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
// body = req.text() (raw, non parsé) — obligatoire pour la vérification
```
 
**3 événements gérés :**
 
| Événement Stripe | Scénario | Actions |
|-----------------|----------|---------|
| `checkout.session.completed` | Nouvelle souscription | Créer Order, vider panier, activer promo BOGO si applicable, envoyer emails |
| `invoice.paid` | Renouvellement mensuel réussi | MAJ `rentalEndDate` et `nextBillingDate` +30j, reset `renewalIntention`, email template #13 |
| `invoice.payment_failed` | Échec de prélèvement | Set `renewalIntention = PAIEMENT_ECHOUE`, email d'alerte template #14 |
 
**Logique `invoice.paid` en détail :**
```javascript
// Seuls les produits avec intention de prolongation sont renouvelés
const productsToRenew = order.OrderProducts.filter(p =>
  p.renewalIntention === 'PROLONGATION' ||
  p.renewalIntention === 'PROLONGATION_TACITE' ||
  p.renewalIntention === 'PAIEMENT_ECHOUE'  // Retry après échec
);
 
for (const product of productsToRenew) {
  const newBillingDate = new Date(product.nextBillingDate);
  newBillingDate.setDate(newBillingDate.getDate() + 30);
  const newRentalEnd = new Date(product.rentalEndDate);
  newRentalEnd.setDate(newRentalEnd.getDate() + 30);
 
  await prisma.orderProducts.update({
    where: { OrderId_ProductId: { OrderId: product.OrderId, ProductId: product.ProductId } },
    data: { nextBillingDate: newBillingDate, rentalEndDate: newRentalEnd, renewalIntention: null }
  });
}
```
 
---
 
### 4.6 Portail client Stripe
 
**Route :** `POST /api/stripe/create-portal-session`
 
Permet au client de gérer son abonnement directement sur l'interface Stripe (changer carte, annuler, voir factures) sans développement côté application.
 
---
 
### 4.7 Synchronisation DB ↔ Stripe
 
| Élément DB | Élément Stripe | Synchronisation |
|------------|----------------|----------------|
| `Orders.stripeSubscriptionId` | `Subscription.id` | Stocké lors du `checkout.session.completed` |
| `OrderProducts.nextBillingDate` | Date facture Stripe | Mis à jour à chaque `invoice.paid` |
| `PromoCodeUsage` | Coupon Stripe | Créé lors du `checkout.session.completed` |
 
---
 
## 5. Gestion du Catalogue et des Stocks
 
### 5.1 Structure d'un produit
 
Un `Product` contient toutes les informations nécessaires à l'affichage catalogue, à la logistique, et à l'administration :
 
**Données de vente :**
- `reference` (SKU unique), `name`, `description`, `price`, `highlights[]`
- `brand`, `ageRange`, `category` (filtres catalogue)
- `isFeatured` (mise en avant homepage)
- `rating` (note moyenne calculée à partir des `Reviews`)
 
**Médias :**
- `images[]` : tableau de chemins relatifs vers `/public/uploads/`
- `manualUrl` : lien vers la notice PDF (Google Drive ou uploads)
 
**Physique :**
- `weight`, `length`, `width`, `height`, `pieceCount` (dimensions pour logistique)
- `material`, `tags[]`
 
**Stock & état :**
- `stock` : nombre d'exemplaires disponibles à la location
- `condition` : état physique (NEW → RETIRED)
 
---
 
### 5.2 Protocole d'hygiène — États du produit
 
L'état `condition` reflète l'état physique et sanitaire du jouet après chaque rotation :
 
```
RÉCEPTION RETOUR CLIENT
        │
        ▼
   [Inspection visuelle + nettoyage]
        │
    ┌───┴───────┐
    │           │
    ▼           ▼
Toutes pièces  Pièces manquantes
OK ?           ou dommages graves
    │                  │
    ▼                  ▼
  GOOD / FAIR       REPAIRING
(remis en location)    │
                       ▼
              [Réparation possible ?]
                   │         │
                  OUI        NON
                   │          │
                   ▼          ▼
                 GOOD       RETIRED
              (si neuf)
```
 
**Règle de disponibilité :** un jouet n'est disponible à la location que si `stock > 0` ET `condition NOT IN [REPAIRING, RETIRED]`.
 
---
 
### 5.3 Disponibilité et filtres catalogue
 
**API :** `GET /api/products`
 
Filtres disponibles (query params) :
```
/api/products?category=Construction&ageRange=3-5+ans&isFeatured=true
```
 
**Service :** `src/lib/modules/products/product.service.js`
```javascript
export const getAll = async (filters = {}) => {
  return prisma.products.findMany({
    where: {
      ...(filters.category   && { category: filters.category }),
      ...(filters.ageRange   && { ageRange: filters.ageRange }),
      ...(filters.isFeatured && { isFeatured: true }),
    },
    include: { reviews: true }
  });
};
```
 
---
 
### 5.4 Administration produits
 
**Accès :** `/admin/products` (rôle ADMIN requis)
 
| Action | Endpoint | Description |
|--------|----------|-------------|
| Lister | `GET /api/products` | Liste complète avec filtres |
| Créer | `POST /api/products` | Avec upload d'images |
| Modifier | `PUT /api/products/[id]` | Mise à jour partielle |
| Supprimer | `DELETE /api/products/[id]` | Soft delete ou réel |
| Upload image | `POST /api/upload` | Stockage dans `/public/uploads/` |
 
Les images uploadées sont stockées dans `public/uploads/` monté en volume Docker (persistance entre redéploiements).
 
---
 
## 6. Logistique et Livraison
 
### 6.1 Deux modes de livraison
 
| Mode | Description | Implémentation |
|------|-------------|----------------|
| **Point Relais** | Réseau Mondial Relay | Widget JS client → `mondialRelayPointId = "FR-XXXXX"` |
| **Domicile** | Zones restreintes uniquement | `mondialRelayPointId = "DOMICILE"` |
 
Le champ `mondialRelayPointId` fait office de discriminant entre les deux modes :
- Valeur `"DOMICILE"` → livraison à domicile
- Valeur `null` ou `"null"` → domicile (cas legacy)
- Toute autre valeur → ID point Mondial Relay
 
---
 
### 6.2 Zones éligibles à la livraison domicile
 
La livraison domicile est **géo-restreinte** (Saussan et alentours). La validation se fait dans `/api/checkout/route.js` :
 
```javascript
const AUTHORIZED_ZONES = {
  "34690": ["FABREGUES", "FABRÈGUES"],
  "34570": ["PIGNAN", "SAUSSAN"]
};
 
if (shippingData.mondialRelayPointId === "DOMICILE") {
  const zip = shippingData.shippingZip?.trim();
  const city = shippingData.shippingCity?.toUpperCase().trim();
  const allowedCities = AUTHORIZED_ZONES[zip] || [];
  const isAllowed = allowedCities.some(allowed => city?.includes(allowed));
 
  if (!isAllowed) {
    return NextResponse.json({ error: "Adresse non éligible à la livraison domicile." }, { status: 400 });
  }
}
```
 
> **Évolution future :** externaliser `AUTHORIZED_ZONES` en variable d'environnement ou en base de données pour permettre l'ajout de zones sans redéploiement.
 
---
 
### 6.3 Champs logistiques de la commande
 
| Champ | Sens | Exemple |
|-------|------|---------|
| `mondialRelayPointId` | ID du point relais ou "DOMICILE" | `"FR-12345"` |
| `shippingName` | Nom du destinataire | `"Marie Dupont"` |
| `shippingAddress` | Adresse de livraison | `"12 rue des Lilas"` |
| `shippingZip` | Code postal | `"34570"` |
| `shippingCity` | Ville | `"Saussan"` |
| `shippingPhone` | Téléphone (requis Mondial Relay) | `"0612345678"` |
| `trackingNumber` | Numéro de suivi aller | `"1Z999AA10123456784"` |
| `trackingUrl` | Lien de suivi direct | `"https://..."` |
| `returnTrackingNumber` | Numéro de suivi retour | `"..."` |
| `returnLabelUrl` | URL PDF étiquette retour | `"https://.../label.pdf"` |
| `rentalStartDate` | Date de début de location réelle | `2024-01-15T00:00:00Z` |
 
---
 
### 6.4 Flux de retour
 
```
1. Client demande un retour → POST /api/orders/return-item
   → Order.status = RETURNING
   → Génération/récupération étiquette retour
   → Order.returnLabelUrl renseigné
   → Email avec étiquette envoyé (sendReturnLabel via Brevo template)
 
2. Réception du colis → Admin met à jour
   → Order.status = RETURNED
   → Jouets passent en condition REPAIRING (protocole nettoyage)
 
3. Contrôle qualité → Admin met à jour
   → Order.status = COMPLETED
   → Products.condition = GOOD | FAIR | RETIRED
   → Products.stock += quantity (remise en stock si GOOD/FAIR)
```
 
---
 
### 6.5 Prolongation de location
 
**Route :** `POST /api/orders/prolong-item`
 
Le client peut signaler son intention de prolonger depuis son espace compte :
```
renewalIntention = "PROLONGATION"
```
 
La valeur `null` représente une **reconduction tacite** (comportement par défaut).
 
Le webhook `invoice.paid` filtre sur `renewalIntention IN [PROLONGATION, PROLONGATION_TACITE, PAIEMENT_ECHOUE]` pour décider quels produits renouveler.
 
---
 
## 7. Design System & UI
 
### 7.1 Palette de couleurs
 
| Nom | Hexadécimal | Usage |
|-----|-------------|-------|
| **Bleu principal** | `#6EC1E4` | CTA secondaires, accents, icônes |
| **Rose/Corail** | `#FF8C94` | CTA principaux, highlights, thème meta |
| **Vert doux** | `#A8D5A2` | Confirmations, états positifs |
| **Jaune pastel** | `#FFE08A` | Alertes douces, badges |
| **Blanc cassé** | `#FAFAFA` | Fonds de cartes |
| **Gris texte** | `#4A4A4A` | Corps de texte |
 
> La palette pastel renforce les valeurs de la marque : douceur, nature, enfance. À ne pas substituer par des teintes saturées.
 
---
 
### 7.2 Typographie
 
**Police :** `Quicksand` (Google Fonts via `@fontsource/quicksand`)
 
```css
/* src/app/layout.js */
import { Quicksand } from "@fontsource/quicksand";
 
/* Variable CSS exposée */
--font-quicksand: 'Quicksand', sans-serif;
```
 
| Graisses disponibles | Usage recommandé |
|---------------------|-----------------|
| 300 (Light) | Corps long, descriptions |
| 400 (Regular) | Corps standard |
| 500 (Medium) | Labels, boutons secondaires |
| 600 (SemiBold) | Titres H3, sous-titres |
| 700 (Bold) | Titres H1/H2, CTA |
 
---
 
### 7.3 Formes organiques et principes visuels
 
Le design system est basé sur des formes **"organiques"** qui évoquent les jouets et la nature :
 
- **Border-radius des cartes :** `25px` (règle stricte — aucune carte à angle droit)
- **Boutons pill-shape :** `border-radius: 50px` (forme pilule complète)
- **Blobs décoratifs :** formes SVG irrégulières en arrière-plan des sections
- **Ombres :** `box-shadow: 0 4px 15px rgba(0,0,0,0.08)` (légères, non agressives)
 
---
 
### 7.4 Composants UI réutilisables
 
#### Boutons
 
| Composant | Couleur | Usage |
|-----------|---------|-------|
| `<ButtonBlue />` | `#6EC1E4` | Actions secondaires, navigation |
| `<ButtonGreen />` | `#A8D5A2` | Validation, confirmation |
| `<ButtonRed />` | `#FF6B6B` | Suppression, annulation |
| `<ButtonYellow />` | `#FFE08A` | Alertes, mise en avant douce |
| `<ButtonDuo />` | Deux couleurs | Paires de choix (ex: Oui/Non) |
 
**Exemple d'usage :**
```jsx
import ButtonBlue from "@/components/ButtonBlue";
 
<ButtonBlue onClick={handleClick}>
  Voir la bibliothèque
</ButtonBlue>
```
 
#### Cartes produit
 
```jsx
// src/components/productCard.jsx
// Props : product { id, name, price, images[], ageRange, condition }
// Style : border-radius 25px, shadow douce, hover scale
<ProductCard product={product} />
```
 
#### Cartes d'abonnement
 
```jsx
// src/components/CardsPlan.jsx — carte individuelle
// src/components/CardsPlans.jsx — grille de plans
<CardsPlan name="Box 3 Jouets" price="35€" features={[...]} />
```
 
#### Autres composants clés
 
| Composant | Fichier | Rôle |
|-----------|---------|------|
| `Header` | `Header.jsx` | Navigation, lien connexion/compte |
| `Footer` | `Footer.jsx` | Liens légaux, réseaux sociaux |
| `Banner` | `Banner.jsx` | Section héro de la homepage |
| `PromoBanner` | `PromoBanner.jsx` | Bandeau promotionnel configurable |
| `FAQ` | `FAQ.jsx` | Accordéon de questions/réponses |
| `Protocol` | `protocol.jsx` | Étapes du service (comment ça marche) |
| `SubChoice` | `SubChoice.jsx` | Sélecteur de plan interactif |
| `Newsletter` | `Newsletter.jsx` | Formulaire d'inscription newsletter |
| `CookieBanner` | `CookieBanner.jsx` | Consentement cookies RGPD |
| `SessionProviderClient` | `SessionProviderClient.jsx` | Wrapper NextAuth SessionProvider |
| `GoogleReviews` | `GoogleReviews.jsx` | Carousel avis Google Places |
 
---
 
### 7.5 Architecture CSS — Tailwind + Modules
 
**Double approche CSS :**
 
```javascript
// tailwind.config.js
module.exports = {
  corePlugins: { preflight: false },  // Désactive le reset CSS de Tailwind
  content: ["./src/app/**/*.{js,jsx}", "./src/components/**/*.{js,jsx}"],
}
```
 
> **Pourquoi `preflight: false` ?** Le projet utilise du CSS natif pour le design system (formes organiques, animations blob). Le reset de Tailwind entrerait en conflit avec ces styles manuels. Cette configuration permet la coexistence harmonieuse des deux approches.
 
**Règle d'usage :**
- **Tailwind** → layout rapide (flex, grid, spacing, responsive breakpoints)
- **CSS Modules** (`src/styles/*.css`) → styles complexes, animations, design system propre à chaque composant/page
 
**Fichiers CSS disponibles (40+ fichiers) :**
```
src/styles/
├── Banner.css          ├── homepage.css
├── Button.css          ├── monCompte.css
├── CardsPlan.css       ├── orders.css
├── abonnements.css     ├── paiement.css
├── adminOrders.css     ├── panier.css
├── adminProducts.css   ├── productDetail.css
├── bibliotheque.css    ├── protocol.css
├── contactPage.css     ├── subChoice.css
├── header.css          └── ...
```
 
---
 
## 8. APIs — Référence Complète
 
### 8.1 Tableau des endpoints
 
#### Authentification
 
| Méthode | Path | Auth | Description |
|---------|------|------|-------------|
| `GET/POST` | `/api/auth/[...nextauth]` | — | Handler NextAuth (login, logout, session) |
| `POST` | `/api/auth/forgot-password` | — | Initier réinitialisation MDP |
| `POST` | `/api/auth/reset-password` | — | Réinitialiser MDP avec token |
 
#### Utilisateurs
 
| Méthode | Path | Auth | Description |
|---------|------|------|-------------|
| `POST` | `/api/users` | — | Inscription (+ Zod + rate limit + hCaptcha) |
| `GET` | `/api/users` | ADMIN | Désactivé (403) |
| `GET` | `/api/users/[id]` | USER/ADMIN | Profil utilisateur |
| `PUT` | `/api/users/[id]` | USER/ADMIN | Mise à jour profil |
| `POST` | `/api/users/[id]/addresses` | USER | Ajout adresse |
| `GET` | `/api/users/[id]/addresses` | USER | Liste adresses |
 
#### Produits (Catalogue)
 
| Méthode | Path | Auth | Description |
|---------|------|------|-------------|
| `GET` | `/api/products` | — | Liste produits (filtres: category, ageRange, isFeatured) |
| `POST` | `/api/products` | ADMIN | Créer produit |
| `GET` | `/api/products/[id]` | — | Détail produit + avis |
| `PUT` | `/api/products/[id]` | ADMIN | Modifier produit |
| `DELETE` | `/api/products/[id]` | ADMIN | Supprimer produit |
 
#### Panier
 
| Méthode | Path | Auth | Description |
|---------|------|------|-------------|
| `GET` | `/api/cart` | USER | Récupérer le panier |
| `POST` | `/api/cart` | USER | Ajouter un jouet |
| `PUT` | `/api/cart` | USER | Modifier quantité |
| `DELETE` | `/api/cart?itemId=X` | USER | Retirer un jouet |
 
#### Commandes
 
| Méthode | Path | Auth | Description |
|---------|------|------|-------------|
| `GET` | `/api/orders` | ADMIN | Lister toutes les commandes |
| `PATCH` | `/api/orders` | ADMIN | Mettre à jour statut |
| `GET` | `/api/orders/user/[id]` | USER | Commandes d'un utilisateur |
| `POST` | `/api/orders/prolong-item` | USER | Demander prolongation |
| `POST` | `/api/orders/return-item` | USER | Demander retour |
 
#### Paiement & Stripe
 
| Méthode | Path | Auth | Description |
|---------|------|------|-------------|
| `POST` | `/api/checkout` | USER | Créer session Stripe Checkout |
| `POST` | `/api/stripe/create-portal-session` | USER | Portail client Stripe |
| `POST` | `/api/webhooks/stripe` | — (sig) | Recevoir événements Stripe |
| `POST` | `/api/verify-promo` | USER | Vérifier code promo |
 
#### Divers
 
| Méthode | Path | Auth | Description |
|---------|------|------|-------------|
| `POST` | `/api/contact` | — | Formulaire de contact |
| `POST` | `/api/newsletter` | — | Inscription newsletter |
| `POST` | `/api/reviews` | USER | Soumettre un avis |
| `POST` | `/api/upload` | ADMIN | Upload image/fichier |
| `GET` | `/api/cron/check-renewals` | — (secret) | Cron de vérification renouvellements |
 
---
 
### 8.2 Validation des données — Zod
 
Exemple de schéma de validation pour l'inscription utilisateur :
 
```javascript
import { z } from "zod";
 
const RegisterSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName:  z.string().min(2).max(50),
  email:     z.string().email(),
  password:  z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  phone:     z.string().optional(),
});
 
// Dans le Route Handler
const validation = RegisterSchema.safeParse(body);
if (!validation.success) {
  return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
}
```
 
---
 
### 8.3 Headers de sécurité HTTP
 
Configurés dans `next.config.mjs`, appliqués à toutes les routes `/(.*)`  :
 
| Header | Valeur | Protection |
|--------|--------|------------|
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Fuite d'URL |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | APIs dangereuses |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS (2 ans) |
| `Content-Security-Policy` | Whitelist Stripe, hCaptcha, Mondial Relay | XSS |
 
**CSP détaillée :**
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval'
  https://js.stripe.com https://hcaptcha.com https://*.hcaptcha.com
  https://ajax.googleapis.com https://widget.mondialrelay.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ...;
img-src 'self' data: https: ...;
frame-src https://js.stripe.com https://hooks.stripe.com https://hcaptcha.com ...;
connect-src 'self' https://api.stripe.com https://hcaptcha.com ...;
```
 
> **Note :** `unsafe-eval` est conservé pour la compatibilité avec Stripe.js et Next.js en développement. À restreindre progressivement en production si possible.
 
---
 
### 8.4 CORS
 
Configuré dans `src/middleware.js` :
 
```javascript
const allowedOrigins = [
  "https://www.bibliojouets.fr",
  "https://bibliojouets.fr",
  "https://bibliojouets.com",
  "https://www.bibliojouets.com",
  // + "http://localhost:3000" en développement
];
 
if (origin && allowedOrigins.includes(origin)) {
  response.headers.set("Access-Control-Allow-Origin", origin);
}
response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
```
 
---
 
### 8.5 hCaptcha
 
Intégration dans les formulaires sensibles (inscription, contact) :
 
```jsx
import HCaptcha from "@hcaptcha/react-hcaptcha";
 
<HCaptcha
  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
  onVerify={(token) => setCaptchaToken(token)}
/>
```
 
Vérification côté serveur via `src/lib/core/security/verifyCaptcha.js` :
```javascript
const response = await fetch("https://hcaptcha.com/siteverify", {
  method: "POST",
  body: new URLSearchParams({
    secret: process.env.HCAPTCHA_SECRET_KEY,
    response: captchaToken
  })
});
```
 
---
 
## 9. Emails Transactionnels (Brevo)
 
### 9.1 Templates et identifiants
 
Tous les emails sont envoyés via l'API Brevo (anciennement Sendinblue) avec des templates préconfigurés dans le dashboard Brevo :
 
| Template ID | Événement déclencheur | Paramètres principaux |
|-------------|----------------------|----------------------|
| `8` | Confirmation nouvelle commande | `PRENOM`, `COMMANDE_ID`, `TOTAL`, `DATE_DEBUT`, `LIVRAISON_MODE`, `LIVRAISON_ADRESSE`, `PRODUCTS[]` |
| `8` | Notification admin nouvelle commande | Mêmes paramètres |
| `8` | Envoi étiquette de retour | `PRENOM`, `COMMANDE_ID` + pièce jointe PDF |
| `13` | Renouvellement mensuel réussi | `prenom`, `jouet`, `nouvelleDate`, `lienFacture` |
| `14` | Échec de paiement mensuel | `prenom`, `jouet`, `lienCompte` |
| — | Reset mot de passe | Token dans lien |
 
**Envoi via `src/lib/core/brevo/client.js` :**
```javascript
import { sendBrevoTemplate } from "@/lib/core/brevo/client";
 
await sendBrevoTemplate(
  userEmail,        // Destinataire
  templateId,       // ID template Brevo
  emailParams,      // Variables du template
  attachmentUrl     // URL pièce jointe (optionnel)
);
```
 
---
 
### 9.2 Format de l'ID de commande
 
Pour les emails clients, un ID lisible est généré (distinct de l'ID technique Prisma) :
 
```javascript
// Format : CMD + JJ + MM + AA + HH + mm + - + ID_technique
// Exemple : CMD1101261722-42
 
const now = new Date();
const customOrderId = `CMD${day}${month}${year}${hours}${minutes}-${orderInfo.id}`;
```
 
Ce format permet :
- Une référence humainement lisible pour le support client
- La déduction de la date/heure approximative de commande
- L'unicité garantie par le suffixe `-${id}`
 
---
 
### 9.3 Variables d'environnement Brevo
 
```env
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=noreply@bibliojouets.fr
BREVO_SENDER_NAME=Bibli'o Jouets
```
 
---
 
## 10. Déploiement & DevOps
 
### 10.1 Dockerfile multi-stage
 
Le build Docker utilise 3 stages pour optimiser la taille de l'image finale :
 
```dockerfile
# ── Stage 1 : deps ─────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci  # Installation reproductible (lockfile strict)
 
# ── Stage 2 : builder ──────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
 
# Variables NEXT_PUBLIC_* passées en ARG (nécessaires au build time)
ARG NEXT_PUBLIC_HCAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_URL
 
# Variables sensibles fictives uniquement pour le build Next.js
# Les vraies valeurs sont injectées au runtime via .env
ENV DATABASE_URL="postgresql://fake:fake@localhost:5432/fake"
ENV STRIPE_SECRET_KEY="sk_test_fake_build_key"
# ...
 
RUN npx prisma generate  # Génère le Prisma Client
RUN npm run build        # Build Next.js standalone
 
# ── Stage 3 : runner (image finale) ────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
 
RUN apk add --no-cache openssl  # Requis par Prisma sur Alpine
 
# Utilisateur non-root (sécurité)
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs
 
# Copie uniquement ce qui est nécessaire au runtime
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma           ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules     ./node_modules
 
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
 
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
```
 
**Pourquoi `output: 'standalone'` dans `next.config.mjs` ?**
Next.js génère un serveur Node.js minimal avec uniquement les dépendances nécessaires — réduit l'image Docker de ~300 MB à ~100 MB.
 
---
 
### 10.2 Docker Compose
 
**Production — `docker-compose.yml` :**
```yaml
services:
  app:
    build:
      context: .
      args:
        NEXT_PUBLIC_HCAPTCHA_SITE_KEY: ${NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
        NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID: ${NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID}
        NEXT_PUBLIC_URL: ${NEXT_PUBLIC_URL}
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
    container_name: biblio-app
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"    # Exposé uniquement en localhost (Nginx Proxy Manager en frontal)
    env_file: .env
    volumes:
      - ./public/uploads:/app/public/uploads  # Persistance des uploads
    depends_on:
      db:
        condition: service_healthy
    networks:
      - biblio-network
      - nginx-proxy-manager_default  # Réseau externe partagé avec le reverse proxy
 
  db:
    image: postgres:16-alpine
    container_name: biblio-db
    restart: unless-stopped
    env_file: .env
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Volume nommé (persistance DB)
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lucas -d biblio_jouets"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - biblio-network
 
volumes:
  postgres_data:
 
networks:
  biblio-network:
    driver: bridge
  nginx-proxy-manager_default:
    external: true  # Réseau créé par Nginx Proxy Manager
```
 
**Développement — `docker-compose.override.yml` :**
```yaml
services:
  db:
    ports:
      - "5432:5432"  # Expose PostgreSQL pour accès local (TablePlus, Prisma Studio)
```
 
**Architecture réseau :**
```
Internet → Nginx Proxy Manager (SSL termination) → biblio-app:3000
                                                         ↕
                                                    biblio-db:5432
```
 
---
 
### 10.3 Variables d'environnement complètes
 
Toutes les variables sont à placer dans un fichier `.env` à la racine du projet :
 
#### Base de données
```env
DATABASE_URL=postgresql://lucas:password@db:5432/biblio_jouets
POSTGRES_USER=lucas
POSTGRES_PASSWORD=password
POSTGRES_DB=biblio_jouets
```
 
#### NextAuth
```env
NEXTAUTH_SECRET=une-chaine-aleatoire-longue-et-securisee
NEXTAUTH_URL=https://www.bibliojouets.fr
# En développement : NEXTAUTH_URL=http://localhost:3000
```
 
#### Stripe (backend — secret)
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BOGO_COUPON_ID=COUPON_ID_STRIPE  # ID du coupon "2ème mois offert"
 
STRIPE_PRICE_1_TOY=price_...
STRIPE_PRICE_2_TOYS=price_...
STRIPE_PRICE_3_TOYS=price_...
STRIPE_PRICE_4_TOYS=price_...
STRIPE_PRICE_5_TOYS=price_...
STRIPE_PRICE_6_TOYS=price_...
STRIPE_PRICE_7_TOYS=price_...
STRIPE_PRICE_8_TOYS=price_...
STRIPE_PRICE_9_TOYS=price_...
```
 
#### Stripe (frontend — public)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```
 
#### Brevo (email)
```env
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=noreply@bibliojouets.fr
BREVO_SENDER_NAME=Bibli'o Jouets
```
 
#### hCaptcha
```env
HCAPTCHA_SECRET_KEY=secret_key_hcaptcha
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=site_key_hcaptcha
```
 
#### Mondial Relay
```env
NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID=votre_brand_id
```
 
#### Application
```env
NEXT_PUBLIC_URL=https://www.bibliojouets.fr
NEXT_PUBLIC_API_URL=https://bibliojouets.fr
NODE_ENV=production
```
 
#### Google Places (avis)
```env
GOOGLE_PLACES_API_KEY=AIzaSy...
NEXT_PUBLIC_GOOGLE_PLACE_ID=ChIJ...
```
 
---
 
### 10.4 Commandes de déploiement
 
#### Build local (test)
```bash
# Avec les variables NEXT_PUBLIC_* en ARG
docker-compose build \
  --build-arg NEXT_PUBLIC_HCAPTCHA_SITE_KEY=xxx \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx \
  --build-arg NEXT_PUBLIC_URL=https://www.bibliojouets.fr \
  --build-arg NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID=xxx
```
 
#### Démarrage production
```bash
docker-compose up -d
```
 
#### Migrations base de données
```bash
# En production (depuis le container ou en local avec DATABASE_URL pointant vers prod)
npx prisma migrate deploy
 
# Vérifier l'état des migrations
npx prisma migrate status
```
 
#### Développement local
```bash
npm install
cp .env.example .env   # Remplir les variables
npx prisma db push     # Synchroniser le schéma sans migration
npm run dev
```
 
---
 
### 10.5 Processus de mise à jour sur VPS OVH
 
```bash
# 1. Se connecter au VPS
ssh user@vps-ovh
 
# 2. Aller dans le répertoire du projet
cd /opt/bibliojouets  # ou votre chemin
 
# 3. Récupérer les dernières modifications
git pull origin main
 
# 4. Rebuild et redéploiement (avec downtime minimal)
docker-compose build --no-cache \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$(grep NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY .env | cut -d= -f2) \
  --build-arg NEXT_PUBLIC_URL=$(grep NEXT_PUBLIC_URL .env | cut -d= -f2) \
  --build-arg NEXT_PUBLIC_HCAPTCHA_SITE_KEY=$(grep NEXT_PUBLIC_HCAPTCHA_SITE_KEY .env | cut -d= -f2) \
  --build-arg NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID=$(grep NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID .env | cut -d= -f2)
 
# 5. Appliquer les migrations DB (si nouvelle migration)
docker-compose run --rm app npx prisma migrate deploy
 
# 6. Redémarrer les containers
docker-compose up -d --force-recreate app
 
# 7. Vérifier les logs
docker-compose logs -f app
```
 
> **Bonnes pratiques :**
> - Toujours tester le build localement avant de déployer en production
> - Sauvegarder la DB avant toute migration : `docker exec biblio-db pg_dump -U lucas biblio_jouets > backup_$(date +%Y%m%d).sql`
> - Le health check Docker (`wget http://localhost:3000/`) garantit que le container ne reçoit pas de trafic avant d'être prêt
 
---
 
## 11. Tests
 
### 11.1 Infrastructure de test
 
**Configuration :** `jest.config.js`
```javascript
module.exports = {
  testEnvironment: "jsdom",        // Simule le DOM du navigateur
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1" // Résout les alias @/ vers src/
  },
  setupFilesAfterEach: ["<rootDir>/jest.setup.js"]
};
```
 
**Setup :** `jest.setup.js`
```javascript
import "@testing-library/jest-dom";  // Matchers DOM (toBeInTheDocument, etc.)
```
 
**Commandes :**
```bash
npm test          # Exécute tous les tests
npm run test:watch  # Mode surveillance (développement)
```
 
**Librairies :**
- `jest` v29 : runner et assertions
- `@testing-library/react` v16 : tests composants
- `@testing-library/jest-dom` v6 : matchers HTML
- `jest-environment-jsdom` : émulation DOM
 
---
 
### 11.2 Tests existants
 
| Fichier | Type | Ce qui est testé |
|---------|------|-----------------|
| `src/components/__tests__/Header.test.jsx` | Composant | Rendu, navigation, état connecté/déconnecté |
| `src/components/__tests__/ProductCard.test.jsx` | Composant | Affichage nom, prix, image, lien produit |
| `src/app/panier/__tests__/PanierPage.test.jsx` | Page | Rendu panier vide/rempli, interactions |
| `src/app/api/users/[id]/__tests__/route.test.js` | API | Réponses GET/PUT, codes d'erreur |
| `src/lib/modules/cart/__tests__/cart.service.test.js` | Service | Logique panier (ajout, suppression, quantité) |
| `src/lib/core/utils/__tests__/subscription.test.js` | Utilitaire | `getSuggestedPlan()` pour 0 à 10+ jouets |
 
---
 
## 12. Évolutions Futures
 
### Pourquoi ces choix techniques (justifications pour l'évolutivité)
 
| Choix | Pourquoi | Évolution naturelle |
|-------|----------|---------------------|
| **App Router** | RSC natifs, streaming, layouts imbriqués | Internationalisation (i18n) native avec `next-intl` |
| **Service Layer** | Business logic isolée du transport HTTP | Extraction en microservices si besoin de scaling |
| **JWT stateless** | Pas de session serveur à maintenir | Ajouter refresh tokens pour sessions longues durée |
| **Standalone output** | Image Docker légère et auto-suffisante | Deploy sur Kubernetes sans changement de build |
| **Prisma** | Migrations versionnées, type-safety | Ajout de nouveaux modèles sans risque régressif |
| **Stripe Subscriptions** | Gestion des renouvellements déléguée | Ajout de plans annuels, upgrades/downgrades de plan |
 
### Pistes d'évolution identifiées
 
**Court terme (backlog prioritaire) :**
- [ ] **Échange de jouets** : implémenter la logique `hasExchangedThisMonth` (le champ existe, la UI est à construire)
- [ ] **Réservation de stock temporaire** : bloquer le stock 15 min lors de l'ajout au panier
- [ ] **Tableau de bord analytics** : commandes/mois, jouets les plus loués, taux de résiliation
- [ ] **Système de notation** : calcul et mise à jour automatique de `Products.rating`
 
**Moyen terme :**
- [ ] **Notifications push** : alertes retour à faire, prochain prélèvement
- [ ] **Multi-langue** (i18n) : Next.js App Router supporte nativement `next-intl`
- [ ] **Gestion retours avancée** : QR code sur colis, scan à la réception automatique
- [ ] **Programme de fidélité** : jouets exclusifs après N mois d'abonnement
 
**Long terme / Scalabilité :**
- [ ] **Rate limiter distribué** : remplacer le rate limiter in-memory par Redis (`@upstash/ratelimit`) pour le scaling horizontal
- [ ] **CDN pour les uploads** : migrer les images vers un bucket S3/Cloudflare R2
- [ ] **Webhooks sortants** : notifier des systèmes tiers (CRM, ERP) des événements commandes
- [ ] **API publique** : exposer une API REST documentée (Swagger/OpenAPI) pour d'éventuels partenariats
 
---
 
*Documentation générée le 29 mars 2026 — À maintenir à jour à chaque évolution majeure de la stack ou de la logique métier.*