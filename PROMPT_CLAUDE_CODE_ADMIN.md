# Prompt Claude Code — Refonte Dashboard Admin Bibli'O Jouets
# À copier-coller tel quel dans Claude Code

---

## Contexte du projet

Tu travailles sur **Bibli'O Jouets** (`https://www.bibliojouets.fr`), une plateforme de location de jouets par abonnement.

**Stack technique :**
- Next.js App Router (`src/app/`) — Server Components par défaut, `"use client"` explicite si besoin
- Prisma ORM + PostgreSQL 16
- NextAuth.js v4 (JWT strategy, `getServerSession(authOptions)`)
- Tailwind CSS (`preflight: false`) + CSS Modules dans `src/styles/*.css`
- Police `Quicksand` via `@fontsource/quicksand`
- Composants boutons réutilisables : `ButtonBlue`, `ButtonGreen`, `ButtonRed`, `ButtonYellow`

**Charte graphique (à respecter impérativement) :**
- Fond principal : `#FFFAF4` (blanc chaud)
- Texte principal : `#2E1D21`
- Palette accents : bleu `#6EC1E4`, rose/corail `#FF8C94`, vert doux `#A8D5A2`, jaune `#FFE08A`
- `border-radius` cartes : `25px` — boutons pill-shape : `border-radius: 50px`
- Ombres : `box-shadow: 0 4px 15px rgba(0,0,0,0.08)`
- Poids typographiques : 400 (corps), 500 (labels), 600 (sous-titres), 700 (titres/CTA)

**Fichiers CSS admin existants à ne pas supprimer :**
- `src/styles/adminOrders.css`
- `src/styles/adminProducts.css`

**Auth pattern dans les Route Handlers :**
```javascript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
const session = await getServerSession(authOptions);
if (!session || session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
}
```

**Middleware existant** (`src/middleware.js`) : protège déjà toutes les routes `/admin/*` → rôle ADMIN requis, redirect `/` sinon. Ne pas modifier le middleware.

---

## Mission globale

Refondre le dashboard administrateur `/admin` en implémentant :
1. Un enum `OrderType` en base de données (migration Prisma)
2. Un layout admin avec sidebar persistante
3. Une page `/admin` avec KPIs
4. Une page `/admin/orders` refondre avec 4 onglets filtrés
5. Un endpoint API `/api/admin/stats` pour alimenter les KPIs
6. La page `/admin/products` existante — **ne pas y toucher**

---

## ÉTAPE 1 — Migration Prisma : ajout du champ `orderType`

### 1.1 Modifier `prisma/schema.prisma`

Ajouter l'enum suivant (après les enums existants `OrderStatus`, `ProductCondition`, `Role`) :

```prisma
enum OrderType {
  RENTAL    // Location mensuelle classique (abonnement Stripe récurrent)
  EXCHANGE  // Boîte Navette (échange de jouets en cours de mois)
  ADOPTION  // Achat définitif one-shot d'un jouet actuellement loué
}
```

Sur le modèle `Orders`, ajouter ce champ **après le champ `status`** :

```prisma
orderType  OrderType  @default(RENTAL)
```

### 1.2 Générer et appliquer la migration

```bash
npx prisma migrate dev --name add_order_type_enum
npx prisma generate
```

> ⚠️ La valeur par défaut `RENTAL` assure que toutes les commandes existantes sont correctement typées sans modification manuelle.

---

## ÉTAPE 2 — Layout admin avec sidebar persistante

### 2.1 Créer `src/app/admin/layout.js`

Ce layout encapsule toutes les pages admin (sauf `/admin/products` qui peut déjà avoir son propre layout — si c'est le cas, ne pas toucher). Server Component.

```javascript
// src/app/admin/layout.js
import AdminSidebar from "@/components/admin/AdminSidebar";
import styles from "@/styles/adminLayout.css";

export const metadata = {
  title: "Administration — Bibli'O Jouets",
};

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminWrapper}>
      <AdminSidebar />
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}
```

### 2.2 Créer `src/styles/adminLayout.css`

```css
.adminWrapper {
  display: flex;
  min-height: 100vh;
  background-color: #FFFAF4;
  font-family: 'Quicksand', sans-serif;
}

.adminMain {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
```

### 2.3 Créer `src/components/admin/AdminSidebar.jsx`

**Client Component** — utilise `usePathname` et `useSearchParams` pour l'état actif.

Structure de la sidebar en 4 groupes :

```
TABLEAU DE BORD
  → Vue d'ensemble          /admin

RACCOURCIS RAPIDES          ← section principale, visuellement mise en avant
  → 📦 Location             /admin/orders?type=RENTAL    [badge rouge si urgences]
  → 🔄 Boîte Navette        /admin/orders?type=EXCHANGE  [badge orange si urgences]
  → 💜 Adoption             /admin/orders?type=ADOPTION  [pas de badge]

LOGISTIQUE
  → Expéditions             /admin/orders?status=PREPARING
  → Retours                 /admin/orders?status=RETURNING

CATALOGUE
  → Gestion Produits        /admin/products

CLIENTS
  → Comptes clients         /admin/clients     [placeholder — page à créer plus tard]
  → Support                 /admin/support     [placeholder — page à créer plus tard]
```

**Comportement des badges urgence :**
- Récupérer via `fetch("/api/admin/stats")` au montage (useEffect)
- Badge rouge affiché si `rentalPreparing > 0` → affiche le nombre
- Badge orange affiché si `exchangePending > 0` → affiche le nombre
- Les badges disparaissent si count = 0

**Code complet de `AdminSidebar.jsx` :**

```jsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/styles/adminSidebar.css";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState({ rentalPreparing: 0, exchangePending: 0 });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.rentalPreparing !== undefined) {
          setCounts({
            rentalPreparing: data.rentalPreparing,
            exchangePending: data.exchangePending,
          });
        }
      })
      .catch(() => {});
  }, []);

  const isActive = (href) => {
    if (href === "/admin" && pathname === "/admin") return true;
    if (href !== "/admin" && pathname.startsWith(href.split("?")[0])) return true;
    return false;
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo / titre */}
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarLogo}>🧸</span>
        <span className={styles.sidebarTitle}>Admin</span>
      </div>

      {/* TABLEAU DE BORD */}
      <nav className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Tableau de bord</p>
        <Link
          href="/admin"
          className={`${styles.navItem} ${pathname === "/admin" ? styles.navItemActive : ""}`}
        >
          <span className={styles.navIcon}>📊</span>
          Vue d'ensemble
        </Link>
      </nav>

      {/* RACCOURCIS RAPIDES */}
      <nav className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Raccourcis rapides</p>

        {/* Location */}
        <Link
          href="/admin/orders?type=RENTAL"
          className={`${styles.navItem} ${styles.navItemRental} ${
            pathname === "/admin/orders" ? styles.navItemActive : ""
          }`}
        >
          <span className={styles.navIcon}>📦</span>
          <span className={styles.navLabel}>Location</span>
          {counts.rentalPreparing > 0 && (
            <span className={`${styles.badge} ${styles.badgeRed}`}>
              {counts.rentalPreparing}
            </span>
          )}
        </Link>

        {/* Boîte Navette */}
        <Link
          href="/admin/orders?type=EXCHANGE"
          className={`${styles.navItem} ${styles.navItemExchange}`}
        >
          <span className={styles.navIcon}>🔄</span>
          <span className={styles.navLabel}>Boîte Navette</span>
          {counts.exchangePending > 0 && (
            <span className={`${styles.badge} ${styles.badgeOrange}`}>
              {counts.exchangePending}
            </span>
          )}
        </Link>

        {/* Adoption */}
        <Link
          href="/admin/orders?type=ADOPTION"
          className={`${styles.navItem} ${styles.navItemAdoption}`}
        >
          <span className={styles.navIcon}>💜</span>
          <span className={styles.navLabel}>Adoption</span>
        </Link>
      </nav>

      {/* LOGISTIQUE */}
      <nav className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Logistique</p>
        <Link href="/admin/orders?status=PREPARING" className={styles.navItem}>
          <span className={styles.navIcon}>🚚</span>
          Expéditions
        </Link>
        <Link href="/admin/orders?status=RETURNING" className={styles.navItem}>
          <span className={styles.navIcon}>↩️</span>
          Retours
        </Link>
      </nav>

      {/* CATALOGUE */}
      <nav className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Catalogue</p>
        <Link
          href="/admin/products"
          className={`${styles.navItem} ${isActive("/admin/products") ? styles.navItemActive : ""}`}
        >
          <span className={styles.navIcon}>🧩</span>
          Gestion Produits
        </Link>
      </nav>

      {/* CLIENTS */}
      <nav className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Clients</p>
        <Link href="/admin/clients" className={`${styles.navItem} ${styles.navItemDisabled}`}>
          <span className={styles.navIcon}>👥</span>
          Comptes clients
          <span className={styles.comingSoon}>bientôt</span>
        </Link>
        <Link href="/admin/support" className={`${styles.navItem} ${styles.navItemDisabled}`}>
          <span className={styles.navIcon}>💬</span>
          Support
          <span className={styles.comingSoon}>bientôt</span>
        </Link>
      </nav>
    </aside>
  );
}
```

### 2.4 Créer `src/styles/adminSidebar.css`

```css
.sidebar {
  width: 220px;
  min-height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid rgba(46, 29, 33, 0.08);
  padding: 1.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebarHeader {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.5rem 1.25rem;
  border-bottom: 1px solid rgba(46, 29, 33, 0.08);
  margin-bottom: 0.5rem;
}

.sidebarLogo {
  font-size: 1.4rem;
}

.sidebarTitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2E1D21;
  letter-spacing: -0.01em;
}

.navGroup {
  margin-bottom: 0.25rem;
}

.navGroupLabel {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #a0888c;
  padding: 0.75rem 0.5rem 0.25rem;
  margin: 0;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2E1D21;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
  cursor: pointer;
  position: relative;
  margin-bottom: 0.15rem;
}

.navItem:hover {
  background-color: rgba(46, 29, 33, 0.05);
}

.navItemActive {
  background-color: rgba(110, 193, 228, 0.15);
  color: #1a7fa8;
  font-weight: 600;
}

/* Accents couleurs des raccourcis */
.navItemRental {
  border-left: 3px solid #A8D5A2;
}

.navItemExchange {
  border-left: 3px solid #FFE08A;
}

.navItemAdoption {
  border-left: 3px solid #c4a8d5;
}

.navItemRental:hover,
.navItemExchange:hover,
.navItemAdoption:hover {
  background-color: rgba(46, 29, 33, 0.04);
}

.navIcon {
  font-size: 1rem;
  flex-shrink: 0;
}

.navLabel {
  flex: 1;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  margin-left: auto;
}

.badgeRed {
  background-color: #e05252;
}

.badgeOrange {
  background-color: #e08a00;
}

/* Items désactivés (placeholder) */
.navItemDisabled {
  opacity: 0.5;
  pointer-events: none;
}

.comingSoon {
  margin-left: auto;
  font-size: 0.6rem;
  background-color: rgba(46, 29, 33, 0.08);
  color: #2E1D21;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
```

---

## ÉTAPE 3 — Endpoint API pour les statistiques admin

### 3.1 Créer `src/app/api/admin/stats/route.js`

Route Handler GET, protégée ADMIN. Retourne les counts pour les badges et les KPIs du dashboard.

```javascript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/core/database/index";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      // Counts pour badges sidebar
      rentalPreparing,
      exchangePending,

      // KPIs abonnements
      totalActiveOrders,
      newOrdersThisMonth,
      cancelledThisMonth,
      exchangesThisMonth,
      adoptionsThisMonth,

      // Logistique urgences
      ordersToShip,
      navettePending,
      returningOrders,

      // Catalogue stock
      availableProducts,
      repairingProducts,
      retiredProducts,

    ] = await Promise.all([
      // Badges urgence
      prisma.orders.count({
        where: { orderType: "RENTAL", status: "PREPARING" },
      }),
      prisma.orders.count({
        where: { orderType: "EXCHANGE", status: { in: ["PREPARING", "SHIPPED"] } },
      }),

      // Abonnements actifs (RENTAL + EXCHANGE en cours)
      prisma.orders.count({
        where: {
          orderType: { in: ["RENTAL", "EXCHANGE"] },
          status: { in: ["PREPARING", "SHIPPED", "ACTIVE"] },
        },
      }),
      // Nouvelles commandes ce mois
      prisma.orders.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      // Résiliations ce mois (CANCELLED)
      prisma.orders.count({
        where: {
          status: "CANCELLED",
          updatedAt: { gte: startOfMonth },
        },
      }),
      // Navettes ce mois
      prisma.orders.count({
        where: {
          orderType: "EXCHANGE",
          createdAt: { gte: startOfMonth },
        },
      }),
      // Adoptions ce mois
      prisma.orders.count({
        where: {
          orderType: "ADOPTION",
          createdAt: { gte: startOfMonth },
        },
      }),

      // Logistique
      prisma.orders.count({
        where: { status: "PREPARING" },
      }),
      prisma.orders.count({
        where: { orderType: "EXCHANGE", status: { in: ["PREPARING", "SHIPPED"] } },
      }),
      prisma.orders.count({
        where: { status: { in: ["RETURNING", "RETURNED"] } },
      }),

      // Catalogue
      prisma.products.count({
        where: {
          stock: { gt: 0 },
          condition: { notIn: ["REPAIRING", "RETIRED"] },
        },
      }),
      prisma.products.count({ where: { condition: "REPAIRING" } }),
      prisma.products.count({ where: { condition: "RETIRED" } }),
    ]);

    // MRR estimé : somme des totalAmount des abonnements actifs ce mois
    const activeOrdersRevenue = await prisma.orders.aggregate({
      where: {
        orderType: "RENTAL",
        status: { in: ["ACTIVE", "SHIPPED", "PREPARING"] },
      },
      _sum: { totalAmount: true },
    });

    // CA Adoptions ce mois
    const adoptionRevenue = await prisma.orders.aggregate({
      where: {
        orderType: "ADOPTION",
        createdAt: { gte: startOfMonth },
        status: { not: "CANCELLED" },
      },
      _sum: { totalAmount: true },
    });

    const totalProducts = await prisma.products.count();
    const rentedProducts = totalProducts > 0
      ? Math.round(((totalProducts - availableProducts) / totalProducts) * 100)
      : 0;

    return NextResponse.json({
      // Badges sidebar
      rentalPreparing,
      exchangePending,

      // KPIs financiers
      mrr: Math.round(activeOrdersRevenue._sum.totalAmount ?? 0),
      adoptionRevenueMois: Math.round(adoptionRevenue._sum.totalAmount ?? 0),

      // Abonnements
      totalActiveOrders,
      newOrdersThisMonth,
      cancelledThisMonth,
      exchangesThisMonth,
      adoptionsThisMonth,

      // Logistique
      ordersToShip,
      navettePending,
      returningOrders,

      // Catalogue
      availableProducts,
      repairingProducts,
      retiredProducts,
      tauxUtilisation: rentedProducts,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

---

## ÉTAPE 4 — Refonte de `/admin/orders` avec 4 onglets

### 4.1 Refondre `src/app/admin/orders/page.js`

**Server Component** — récupère les données de tous les types de commandes en parallèle, puis les passe à un composant client pour les onglets.

```javascript
// src/app/admin/orders/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/core/database/index";
import OrdersTabs from "@/components/admin/OrdersTabs";

export const metadata = { title: "Commandes — Admin Bibli'O Jouets" };

// Forcer le rendu dynamique car on lit la session
export const dynamic = "force-dynamic";

const orderInclude = {
  Users: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  OrderProducts: {
    include: {
      Products: {
        select: { id: true, name: true, images: true },
      },
    },
  },
};

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [rentalOrders, exchangeOrders, returningOrders, adoptionOrders] =
    await Promise.all([
      prisma.orders.findMany({
        where: { orderType: "RENTAL" },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.orders.findMany({
        where: { orderType: "EXCHANGE" },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.orders.findMany({
        where: { status: { in: ["RETURNING", "RETURNED"] } },
        include: orderInclude,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.orders.findMany({
        where: { orderType: "ADOPTION" },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  // Sérialisation des dates pour passage au Client Component
  const serialize = (orders) =>
    orders.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      rentalStartDate: o.rentalStartDate?.toISOString() ?? null,
      resetTokenExpiry: undefined,
      OrderProducts: o.OrderProducts.map((op) => ({
        ...op,
        rentalEndDate: op.rentalEndDate?.toISOString() ?? null,
        nextBillingDate: op.nextBillingDate?.toISOString() ?? null,
      })),
    }));

  return (
    <OrdersTabs
      rentalOrders={serialize(rentalOrders)}
      exchangeOrders={serialize(exchangeOrders)}
      returningOrders={serialize(returningOrders)}
      adoptionOrders={serialize(adoptionOrders)}
    />
  );
}
```

### 4.2 Créer `src/components/admin/OrdersTabs.jsx`

**Client Component** — gère l'onglet actif via `useSearchParams`.

```jsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "@/styles/adminOrders.css";

// Mapping statut → badge couleur
const STATUS_COLORS = {
  PENDING:    { bg: "#FFE08A", text: "#7a5c00" },
  PREPARING:  { bg: "#FFD6A5", text: "#7a3e00" },
  SHIPPED:    { bg: "#A8D5A2", text: "#1e5c1a" },
  ACTIVE:     { bg: "#6EC1E4", text: "#0a4a6e" },
  RETURNING:  { bg: "#FF8C94", text: "#7a0010" },
  RETURNED:   { bg: "#c4a8d5", text: "#3d1a5c" },
  COMPLETED:  { bg: "#e0e0e0", text: "#444" },
  CANCELLED:  { bg: "#f0c0c0", text: "#7a0000" },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] ?? { bg: "#eee", text: "#444" };
  return (
    <span style={{
      background: colors.bg,
      color: colors.text,
      padding: "2px 10px",
      borderRadius: "50px",
      fontSize: "0.75rem",
      fontWeight: 600,
    }}>
      {status}
    </span>
  );
}

function formatOrderId(order) {
  const d = new Date(order.createdAt);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(2);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `CMD${day}${month}${year}${hours}${minutes}-${order.id}`;
}

function OrderRow({ order, type, onStatusUpdate }) {
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [loading, setLoading] = useState(false);

  const productNames = order.OrderProducts.map(
    (op) => op.Products?.name ?? "Jouet"
  ).join(", ");

  const clientName = order.Users
    ? `${order.Users.firstName ?? ""} ${order.Users.lastName ?? ""}`.trim()
    : "Client inconnu";

  const livraison =
    order.mondialRelayPointId === "DOMICILE" || order.mondialRelayPointId === "null" || !order.mondialRelayPointId
      ? "Domicile"
      : `Point Relais ${order.mondialRelayPointId}`;

  async function handleMarkShipped() {
    if (!tracking.trim()) return alert("Renseigne un numéro de suivi.");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: "SHIPPED", trackingNumber: tracking }),
      });
      if (res.ok) onStatusUpdate();
    } catch (e) {
      alert("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkStatus(newStatus) {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: newStatus }),
      });
      if (res.ok) onStatusUpdate();
    } catch (e) {
      alert("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr className={styles.orderRow}>
      <td className={styles.td}>
        <span className={styles.orderId}>{formatOrderId(order)}</span>
      </td>
      <td className={styles.td}>
        <div>{clientName}</div>
        <div className={styles.subText}>{order.Users?.email}</div>
      </td>
      <td className={styles.td}>
        <div>{productNames}</div>
        <div className={styles.subText}>{order.OrderProducts.length} jouet(s)</div>
      </td>
      <td className={styles.td}>{livraison}</td>
      <td className={styles.td}><StatusBadge status={order.status} /></td>
      <td className={styles.td}>
        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
      </td>

      {/* Actions selon le type */}
      <td className={styles.td}>
        {(type === "RENTAL" || type === "EXCHANGE") && order.status === "PREPARING" && (
          <div className={styles.actionGroup}>
            <input
              className={styles.trackingInput}
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="N° suivi..."
            />
            <button
              className={styles.btnGreen}
              onClick={handleMarkShipped}
              disabled={loading}
            >
              {loading ? "..." : "Marquer SHIPPED"}
            </button>
          </div>
        )}
        {order.status === "SHIPPED" && (
          <button className={styles.btnBlue} onClick={() => handleMarkStatus("ACTIVE")} disabled={loading}>
            {loading ? "..." : "Marquer ACTIVE"}
          </button>
        )}
        {order.status === "RETURNED" && (
          <button className={styles.btnRed} onClick={() => handleMarkStatus("COMPLETED")} disabled={loading}>
            {loading ? "..." : "Clôturer"}
          </button>
        )}
        {type === "EXCHANGE" && order.status === "PREPARING" && (
          <div className={styles.actionGroup} style={{ marginTop: "0.5rem" }}>
            {order.returnLabelUrl ? (
              <a href={order.returnLabelUrl} target="_blank" rel="noreferrer" className={styles.btnYellow}>
                Étiquette retour PDF
              </a>
            ) : (
              <span className={styles.subText}>Étiquette retour : non générée</span>
            )}
          </div>
        )}
        {type === "ADOPTION" && (
          <span className={styles.adoptionReadonly}>Aucune action logistique</span>
        )}
      </td>
    </tr>
  );
}

function OrdersTable({ orders, type, onRefresh }) {
  if (orders.length === 0) {
    return <p className={styles.emptyState}>Aucune commande dans cette catégorie.</p>;
  }
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Référence</th>
            <th className={styles.th}>Client</th>
            <th className={styles.th}>Jouets</th>
            <th className={styles.th}>Livraison</th>
            <th className={styles.th}>Statut</th>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              type={type}
              onStatusUpdate={onRefresh}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OrdersTabs({
  rentalOrders,
  exchangeOrders,
  returningOrders,
  adoptionOrders,
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Détermination de l'onglet actif selon query params
  const typeParam = searchParams.get("type");
  const statusParam = searchParams.get("status");

  const getInitialTab = () => {
    if (typeParam === "EXCHANGE") return "EXCHANGE";
    if (typeParam === "ADOPTION") return "ADOPTION";
    if (statusParam === "RETURNING") return "RETURNING";
    return "RENTAL"; // défaut
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [typeParam, statusParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    if (tab === "EXCHANGE") params.set("type", "EXCHANGE");
    else if (tab === "ADOPTION") params.set("type", "ADOPTION");
    else if (tab === "RETURNING") params.set("status", "RETURNING");
    else params.set("type", "RENTAL");
    router.replace(`/admin/orders?${params.toString()}`, { scroll: false });
  };

  // Rafraîchissement des données (simple reload)
  const handleRefresh = () => router.refresh();

  const tabs = [
    { key: "RENTAL",    label: "📦 Location",       count: rentalOrders.length },
    { key: "EXCHANGE",  label: "🔄 Boîte Navette",  count: exchangeOrders.length },
    { key: "RETURNING", label: "↩️ Retours",         count: returningOrders.length },
    { key: "ADOPTION",  label: "💜 Adoptions",       count: adoptionOrders.length },
  ];

  return (
    <div className={styles.ordersPage}>
      <div className={styles.ordersHeader}>
        <h1 className={styles.ordersTitle}>Logistique & Commandes</h1>
      </div>

      {/* Note explicative Adoptions si onglet actif */}
      {activeTab === "ADOPTION" && (
        <div className={styles.adoptionNotice}>
          💜 Aucune action logistique requise pour les adoptions.
          Ces commandes sont des achats définitifs one-shot — elles contribuent au CA hors-abonnement.
        </div>
      )}

      {/* Onglets */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
            <span className={styles.tabCount}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className={styles.tabContent}>
        {activeTab === "RENTAL" && (
          <OrdersTable orders={rentalOrders} type="RENTAL" onRefresh={handleRefresh} />
        )}
        {activeTab === "EXCHANGE" && (
          <OrdersTable orders={exchangeOrders} type="EXCHANGE" onRefresh={handleRefresh} />
        )}
        {activeTab === "RETURNING" && (
          <OrdersTable orders={returningOrders} type="RETURNING" onRefresh={handleRefresh} />
        )}
        {activeTab === "ADOPTION" && (
          <OrdersTable orders={adoptionOrders} type="ADOPTION" onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  );
}
```

### 4.3 Compléter/remplacer `src/styles/adminOrders.css`

Ajouter ces classes au fichier existant (conserver ce qui existe si compatible, remplacer les classes conflictuelles) :

```css
/* ── Page wrapper ── */
.ordersPage {
  font-family: 'Quicksand', sans-serif;
  color: #2E1D21;
}

.ordersHeader {
  margin-bottom: 1.5rem;
}

.ordersTitle {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2E1D21;
  margin: 0;
}

/* ── Notice adoption ── */
.adoptionNotice {
  background-color: rgba(196, 168, 213, 0.2);
  border: 1px solid rgba(196, 168, 213, 0.5);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #3d1a5c;
  margin-bottom: 1rem;
}

/* ── Onglets ── */
.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid rgba(46, 29, 33, 0.08);
  margin-bottom: 1.5rem;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.1rem;
  border: none;
  background: none;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #a0888c;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  border-radius: 8px 8px 0 0;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.tab:hover {
  color: #2E1D21;
  background-color: rgba(46, 29, 33, 0.03);
}

.tabActive {
  color: #2E1D21;
  border-bottom-color: #6EC1E4;
  background-color: rgba(110, 193, 228, 0.08);
}

.tabCount {
  background-color: rgba(46, 29, 33, 0.08);
  color: #2E1D21;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
}

/* ── Table ── */
.tableWrapper {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(46, 29, 33, 0.08);
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
}

.th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #a0888c;
  background-color: #FAFAFA;
  border-bottom: 1px solid rgba(46, 29, 33, 0.08);
}

.orderRow:nth-child(even) {
  background-color: #FAFAFA;
}

.orderRow:hover {
  background-color: rgba(110, 193, 228, 0.06);
}

.td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  vertical-align: top;
  border-bottom: 1px solid rgba(46, 29, 33, 0.05);
}

.orderId {
  font-weight: 700;
  font-size: 0.8rem;
  font-family: monospace;
  color: #2E1D21;
}

.subText {
  font-size: 0.75rem;
  color: #a0888c;
  margin-top: 2px;
}

/* ── Actions ── */
.actionGroup {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.trackingInput {
  padding: 0.35rem 0.6rem;
  border: 1px solid rgba(46, 29, 33, 0.2);
  border-radius: 8px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.8rem;
  width: 100%;
  outline: none;
}

.trackingInput:focus {
  border-color: #6EC1E4;
  box-shadow: 0 0 0 2px rgba(110, 193, 228, 0.2);
}

.btnGreen {
  padding: 0.35rem 0.75rem;
  background-color: #A8D5A2;
  color: #1e5c1a;
  border: none;
  border-radius: 50px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btnGreen:hover { opacity: 0.85; }
.btnGreen:disabled { opacity: 0.5; cursor: not-allowed; }

.btnBlue {
  padding: 0.35rem 0.75rem;
  background-color: #6EC1E4;
  color: #0a4a6e;
  border: none;
  border-radius: 50px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btnBlue:hover { opacity: 0.85; }
.btnBlue:disabled { opacity: 0.5; cursor: not-allowed; }

.btnRed {
  padding: 0.35rem 0.75rem;
  background-color: #FF8C94;
  color: #7a0010;
  border: none;
  border-radius: 50px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btnRed:hover { opacity: 0.85; }
.btnRed:disabled { opacity: 0.5; cursor: not-allowed; }

.btnYellow {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background-color: #FFE08A;
  color: #7a5c00;
  border: none;
  border-radius: 50px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.adoptionReadonly {
  font-size: 0.75rem;
  color: #a0888c;
  font-style: italic;
}

.emptyState {
  text-align: center;
  padding: 3rem;
  color: #a0888c;
  font-size: 0.95rem;
}

.tabContent {
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## ÉTAPE 5 — Refonte de la page `/admin` (Dashboard KPIs)

### 5.1 Refondre `src/app/admin/page.js`

Server Component qui récupère les stats et les affiche.

```javascript
// src/app/admin/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/adminDashboard.css";

export const metadata = { title: "Dashboard — Admin Bibli'O Jouets" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  // Récupération des stats via l'API interne
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  let stats = {};
  try {
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Cookie: `next-auth.session-token=${session?.user?.id}` },
      cache: "no-store",
    });
    // Si l'appel fetch interne échoue (cookie complex), appel direct Prisma
    if (!res.ok) throw new Error("fetch failed");
    stats = await res.json();
  } catch {
    // Fallback : import direct du service (évite double appel réseau)
    const prisma = (await import("@/lib/core/database/index")).default;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      rentalPreparing, exchangePending, totalActiveOrders,
      newOrdersThisMonth, cancelledThisMonth, exchangesThisMonth,
      adoptionsThisMonth, ordersToShip, navettePending, returningOrders,
      availableProducts, repairingProducts, retiredProducts, totalProducts,
      activeRevenue, adoptionRevenue,
    ] = await Promise.all([
      prisma.orders.count({ where: { orderType: "RENTAL", status: "PREPARING" } }),
      prisma.orders.count({ where: { orderType: "EXCHANGE", status: { in: ["PREPARING", "SHIPPED"] } } }),
      prisma.orders.count({ where: { orderType: { in: ["RENTAL", "EXCHANGE"] }, status: { in: ["PREPARING", "SHIPPED", "ACTIVE"] } } }),
      prisma.orders.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.orders.count({ where: { status: "CANCELLED", updatedAt: { gte: startOfMonth } } }),
      prisma.orders.count({ where: { orderType: "EXCHANGE", createdAt: { gte: startOfMonth } } }),
      prisma.orders.count({ where: { orderType: "ADOPTION", createdAt: { gte: startOfMonth } } }),
      prisma.orders.count({ where: { status: "PREPARING" } }),
      prisma.orders.count({ where: { orderType: "EXCHANGE", status: { in: ["PREPARING", "SHIPPED"] } } }),
      prisma.orders.count({ where: { status: { in: ["RETURNING", "RETURNED"] } } }),
      prisma.products.count({ where: { stock: { gt: 0 }, condition: { notIn: ["REPAIRING", "RETIRED"] } } }),
      prisma.products.count({ where: { condition: "REPAIRING" } }),
      prisma.products.count({ where: { condition: "RETIRED" } }),
      prisma.products.count(),
      prisma.orders.aggregate({ where: { orderType: "RENTAL", status: { in: ["ACTIVE", "SHIPPED", "PREPARING"] } }, _sum: { totalAmount: true } }),
      prisma.orders.aggregate({ where: { orderType: "ADOPTION", createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } }, _sum: { totalAmount: true } }),
    ]);

    stats = {
      rentalPreparing, exchangePending, totalActiveOrders,
      newOrdersThisMonth, cancelledThisMonth, exchangesThisMonth,
      adoptionsThisMonth, ordersToShip, navettePending, returningOrders,
      availableProducts, repairingProducts, retiredProducts,
      tauxUtilisation: totalProducts > 0 ? Math.round(((totalProducts - availableProducts) / totalProducts) * 100) : 0,
      mrr: Math.round(activeRevenue._sum.totalAmount ?? 0),
      adoptionRevenueMois: Math.round(adoptionRevenue._sum.totalAmount ?? 0),
    };
  }

  const totalRevenu = (stats.mrr ?? 0) + (stats.adoptionRevenueMois ?? 0);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Vue d'ensemble</h1>
        <p className={styles.dashboardSubtitle}>
          {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* ── Revenus ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Revenus</h2>
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiTeal}`}>
            <p className={styles.kpiLabel}>MRR (abonnements)</p>
            <p className={styles.kpiValue}>{stats.mrr ?? 0} €</p>
            <p className={styles.kpiSub}>Revenus récurrents actifs</p>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiPurple}`}>
            <p className={styles.kpiLabel}>CA Adoptions (mois)</p>
            <p className={styles.kpiValue}>{stats.adoptionRevenueMois ?? 0} €</p>
            <p className={styles.kpiSub}>{stats.adoptionsThisMonth ?? 0} jouets adoptés</p>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiYellow}`}>
            <p className={styles.kpiLabel}>Revenu total</p>
            <p className={styles.kpiValue}>{totalRevenu} €</p>
            <p className={styles.kpiSub}>MRR + one-shot ce mois</p>
          </div>
        </div>
      </section>

      {/* ── Abonnements ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Abonnements & activité</h2>
        <div className={styles.kpiGridSmall}>
          {[
            { label: "Actifs", value: stats.totalActiveOrders ?? 0, color: "blue" },
            { label: "Nouveaux ce mois", value: `+${stats.newOrdersThisMonth ?? 0}`, color: "green" },
            { label: "Résiliations", value: stats.cancelledThisMonth ?? 0, color: "red" },
            { label: "Navettes ce mois", value: stats.exchangesThisMonth ?? 0, color: "yellow" },
            { label: "Adoptions ce mois", value: stats.adoptionsThisMonth ?? 0, color: "purple" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${styles.kpiSmall} ${styles[`kpi${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}>
              <p className={styles.kpiSmallLabel}>{label}</p>
              <p className={styles.kpiSmallValue}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Logistique urgences ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Logistique — actions requises</h2>
        <div className={styles.urgenceGrid}>
          <Link href="/admin/orders?status=PREPARING" className={`${styles.urgenceCard} ${stats.ordersToShip > 0 ? styles.urgenceRed : styles.urgenceNeutral}`}>
            <p className={styles.urgenceValue}>{stats.ordersToShip ?? 0}</p>
            <p className={styles.urgenceLabel}>Commandes à expédier</p>
          </Link>
          <Link href="/admin/orders?type=EXCHANGE" className={`${styles.urgenceCard} ${stats.navettePending > 0 ? styles.urgenceOrange : styles.urgenceNeutral}`}>
            <p className={styles.urgenceValue}>{stats.navettePending ?? 0}</p>
            <p className={styles.urgenceLabel}>Navettes en attente</p>
          </Link>
          <Link href="/admin/orders?status=RETURNING" className={styles.urgenceCard}>
            <p className={styles.urgenceValue}>{stats.returningOrders ?? 0}</p>
            <p className={styles.urgenceLabel}>Retours en cours</p>
          </Link>
        </div>
      </section>

      {/* ── Catalogue ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Santé du catalogue</h2>
        <div className={styles.kpiGridSmall}>
          {[
            { label: "Disponibles", value: stats.availableProducts ?? 0, color: "green" },
            { label: "En nettoyage", value: stats.repairingProducts ?? 0, color: "yellow" },
            { label: "Hors catalogue", value: stats.retiredProducts ?? 0, color: "red" },
            { label: "Taux d'utilisation", value: `${stats.tauxUtilisation ?? 0}%`, color: "blue" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${styles.kpiSmall} ${styles[`kpi${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}>
              <p className={styles.kpiSmallLabel}>{label}</p>
              <p className={styles.kpiSmallValue}>{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

### 5.2 Créer `src/styles/adminDashboard.css`

```css
.dashboard {
  font-family: 'Quicksand', sans-serif;
  color: #2E1D21;
  max-width: 1100px;
}

.dashboardHeader {
  margin-bottom: 2rem;
}

.dashboardTitle {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2E1D21;
  margin: 0 0 0.25rem;
}

.dashboardSubtitle {
  font-size: 0.9rem;
  color: #a0888c;
  margin: 0;
  text-transform: capitalize;
}

.section {
  margin-bottom: 2.5rem;
}

.sectionTitle {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #a0888c;
  margin: 0 0 1rem;
}

/* ── KPI Cards grandes ── */
.kpiGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.kpiCard {
  border-radius: 20px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
}

.kpiLabel {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.5rem;
  opacity: 0.8;
}

.kpiValue {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.kpiSub {
  font-size: 0.75rem;
  margin: 0;
  opacity: 0.7;
}

/* Couleurs KPI grandes */
.kpiTeal   { background: rgba(110, 193, 228, 0.18); color: #0a4a6e; }
.kpiPurple { background: rgba(196, 168, 213, 0.25); color: #3d1a5c; }
.kpiYellow { background: rgba(255, 224, 138, 0.35); color: #7a5c00; }

/* ── KPI Cards petites ── */
.kpiGridSmall {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
}

.kpiSmall {
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.kpiSmallLabel {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.4rem;
  opacity: 0.75;
}

.kpiSmallValue {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

/* Couleurs KPI petites */
.kpiBlue   { background: rgba(110, 193, 228, 0.15); color: #0a4a6e; }
.kpiGreen  { background: rgba(168, 213, 162, 0.25); color: #1e5c1a; }
.kpiRed    { background: rgba(255, 140, 148, 0.2);  color: #7a0010; }
.kpiYellow { background: rgba(255, 224, 138, 0.3);  color: #7a5c00; }
.kpiPurple { background: rgba(196, 168, 213, 0.2);  color: #3d1a5c; }

/* ── Urgences logistique ── */
.urgenceGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.urgenceCard {
  border-radius: 20px;
  padding: 1.25rem;
  text-align: center;
  text-decoration: none;
  display: block;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.urgenceCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.urgenceValue {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.urgenceLabel {
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0;
  opacity: 0.85;
}

.urgenceRed     { background: rgba(255, 140, 148, 0.25); color: #7a0010; }
.urgenceOrange  { background: rgba(255, 224, 138, 0.35); color: #7a5c00; }
.urgenceNeutral { background: rgba(168, 213, 162, 0.2);  color: #1e5c1a; }
```

---

## ÉTAPE 6 — Vérifications finales

### 6.1 Middleware — aucune modification requise

Le middleware existant dans `src/middleware.js` protège déjà `/admin/*` → rôle ADMIN requis. Ne pas y toucher.

### 6.2 Ajouter `/api/admin/stats` à la configuration middleware si nécessaire

Si le middleware filtre explicitement les routes API admin, ajouter `/api/admin/stats` dans la liste des routes protégées (rôle ADMIN). La vérification est déjà dans le Route Handler lui-même.

### 6.3 Vérifier que le layout admin ne double pas le Header/Footer global

Si `src/app/layout.js` (layout racine) inclut le `<Header>` et le `<Footer>` du site public, le `src/app/admin/layout.js` héritera de ce wrapper. Options :
- **Option A** (recommandée si le header public est présent) : utiliser un `<div>` en plein écran dans `adminLayout.css` avec `position: fixed` ou overflow pour masquer le header public, ou conditionner l'affichage du header selon le pathname.
- **Option B** : créer un groupe de routes `(admin)` pour isoler le layout : renommer `src/app/admin/` en `src/app/(admin)/admin/` et y placer le layout. Attention : cela change les URLs uniquement si mal configuré — vérifier.
- **Option C** : dans le layout racine, conditionner l'affichage du Header via `usePathname()` (nécessite un Client Wrapper).

> Choisis l'option la plus compatible avec l'architecture existante. Si le layout racine n'inclut pas de Header (ex: header est dans chaque page individuelle), le layout admin fonctionne directement sans conflit.

### 6.4 Test de l'ensemble

```bash
# 1. Appliquer la migration
npx prisma migrate dev --name add_order_type_enum

# 2. Lancer le serveur de dev
npm run dev

# 3. Vérifier les routes
# → /admin                      KPIs dashboard
# → /admin/orders               Onglets par défaut (RENTAL)
# → /admin/orders?type=EXCHANGE Onglet Boîte Navette pré-sélectionné
# → /admin/orders?type=ADOPTION Onglet Adoptions pré-sélectionné
# → /admin/products             Inchangé (existant)
```

---

## Récapitulatif des fichiers à créer / modifier

| Action | Fichier |
|--------|---------|
| **MODIFIER** | `prisma/schema.prisma` — ajout enum `OrderType` + champ `orderType` |
| **CRÉER** | `src/app/admin/layout.js` |
| **CRÉER** | `src/styles/adminLayout.css` |
| **CRÉER** | `src/components/admin/AdminSidebar.jsx` |
| **CRÉER** | `src/styles/adminSidebar.css` |
| **CRÉER** | `src/app/api/admin/stats/route.js` |
| **REFONDRE** | `src/app/admin/orders/page.js` |
| **CRÉER** | `src/components/admin/OrdersTabs.jsx` |
| **COMPLÉTER** | `src/styles/adminOrders.css` |
| **REFONDRE** | `src/app/admin/page.js` |
| **CRÉER** | `src/styles/adminDashboard.css` |
| **NE PAS TOUCHER** | `src/app/admin/products/` (existant, fonctionnel) |
| **NE PAS TOUCHER** | `src/middleware.js` |
| **NE PAS TOUCHER** | `src/styles/adminProducts.css` |

---

*Prompt préparé pour Claude Code — Projet Bibli'O Jouets — Avril 2026*
