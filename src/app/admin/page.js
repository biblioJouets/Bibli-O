import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/adminDashboard.module.css";

export const metadata = { title: "Dashboard — Admin Bibli'O Jouets" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  let stats = {};
  try {
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
  } catch (error) {
    console.error("[AdminDashboard] Erreur chargement stats:", error);
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
            { label: "Actifs", value: stats.totalActiveOrders ?? 0, color: "Blue" },
            { label: "Nouveaux ce mois", value: `+${stats.newOrdersThisMonth ?? 0}`, color: "Green" },
            { label: "Résiliations", value: stats.cancelledThisMonth ?? 0, color: "Red" },
            { label: "Navettes ce mois", value: stats.exchangesThisMonth ?? 0, color: "Yellow" },
            { label: "Adoptions ce mois", value: stats.adoptionsThisMonth ?? 0, color: "Purple" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${styles.kpiSmall} ${styles[`kpi${color}`]}`}>
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
          <Link href="/admin/orders?status=PREPARING" className={`${styles.urgenceCard} ${(stats.ordersToShip ?? 0) > 0 ? styles.urgenceRed : styles.urgenceNeutral}`}>
            <p className={styles.urgenceValue}>{stats.ordersToShip ?? 0}</p>
            <p className={styles.urgenceLabel}>Commandes à expédier</p>
          </Link>
          <Link href="/admin/orders?type=EXCHANGE" className={`${styles.urgenceCard} ${(stats.navettePending ?? 0) > 0 ? styles.urgenceOrange : styles.urgenceNeutral}`}>
            <p className={styles.urgenceValue}>{stats.navettePending ?? 0}</p>
            <p className={styles.urgenceLabel}>Navettes en attente</p>
          </Link>
          <Link href="/admin/orders?status=RETURNING" className={`${styles.urgenceCard} ${styles.urgenceNeutral}`}>
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
            { label: "Disponibles", value: stats.availableProducts ?? 0, color: "Green" },
            { label: "En nettoyage", value: stats.repairingProducts ?? 0, color: "Yellow" },
            { label: "Hors catalogue", value: stats.retiredProducts ?? 0, color: "Red" },
            { label: "Taux d'utilisation", value: `${stats.tauxUtilisation ?? 0}%`, color: "Blue" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${styles.kpiSmall} ${styles[`kpi${color}`]}`}>
              <p className={styles.kpiSmallLabel}>{label}</p>
              <p className={styles.kpiSmallValue}>{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
