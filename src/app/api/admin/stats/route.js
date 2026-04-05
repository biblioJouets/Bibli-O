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
