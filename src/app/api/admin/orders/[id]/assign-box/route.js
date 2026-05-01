// src/app/api/admin/orders/[id]/assign-box/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/core/database";

export async function POST(req, { params: rawParams }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await rawParams;
  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "ID commande invalide" }, { status: 400 });
  }

  const body = await req.json();
  const { productIds } = body; // tableau de 4 IDs entiers

  if (!Array.isArray(productIds) || productIds.length !== 4) {
    return NextResponse.json({ error: "Vous devez sélectionner exactement 4 jouets." }, { status: 400 });
  }
  const ids = productIds.map(Number);
  if (ids.some(isNaN)) {
    return NextResponse.json({ error: "IDs de produits invalides." }, { status: 400 });
  }

  // Vérifier que la commande existe et contient bien BOX-MYSTERE
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      OrderProducts: { include: { Products: { select: { id: true, reference: true } } } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  const phantomEntry = order.OrderProducts.find(
    (op) => op.Products?.reference === "BOX-MYSTERE"
  );
  if (!phantomEntry) {
    return NextResponse.json({ error: "Cette commande ne contient pas de Box Mystère à assigner." }, { status: 400 });
  }

  // Vérifier stock des 4 jouets sélectionnés
  const products = await prisma.products.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, stock: true, reference: true },
  });

  if (products.length !== 4) {
    return NextResponse.json({ error: "Un ou plusieurs produits sont introuvables." }, { status: 400 });
  }

  const outOfStock = products.filter((p) => p.stock <= 0);
  if (outOfStock.length > 0) {
    return NextResponse.json({
      error: `Stock insuffisant pour : ${outOfStock.map((p) => p.name).join(", ")}`,
    }, { status: 400 });
  }

  // Calculer les dates (même logique que createOrder)
  const nextBillingDate = new Date(order.createdAt);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  const rentalEndDate = nextBillingDate;

  await prisma.$transaction(async (tx) => {
    // 1. Supprimer le produit fantôme de la commande
    await tx.orderProducts.delete({
      where: {
        OrderId_ProductId: {
          OrderId: orderId,
          ProductId: phantomEntry.ProductId,
        },
      },
    });

    // 2. Ajouter les 4 vrais jouets (createMany ne supporte pas les clés composites — on boucle)
    for (const productId of ids) {
      await tx.orderProducts.create({
        data: {
          OrderId: orderId,
          ProductId: productId,
          quantity: 1,
          nextBillingDate,
          rentalEndDate,
        },
      });
    }

    // 3. Décrémenter le stock de chaque jouet
    await tx.products.updateMany({
      where: { id: { in: ids } },
      data: { stock: { decrement: 1 } },
    });
  });

  return NextResponse.json({ success: true });
}
