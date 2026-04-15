import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/core/database";

const bodySchema = z.object({
  products: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        status: z.enum(["SAIN", "CASSE"]),
      })
    )
    .min(1),
});

export async function POST(req, props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const params = await props.params;
  const orderId = parseInt(params.id);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "ID de commande invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Corps invalide", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { products } = parsed.data;

  // Vérifier que la commande existe et est bien en RETURNING
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: { OrderProducts: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (!["RETURNING", "RETURNED"].includes(order.status)) {
    return NextResponse.json(
      { error: "L'audit n'est possible que sur une commande en statut RETURNING ou RETURNED." },
      { status: 400 }
    );
  }

  // Vérifier que tous les productId fournis appartiennent à cette commande
  const orderProductIds = order.OrderProducts.map((op) => op.ProductId);
  const unknownIds = products.filter((p) => !orderProductIds.includes(p.productId));
  if (unknownIds.length > 0) {
    return NextResponse.json(
      { error: `Produits non liés à cette commande : ${unknownIds.map((p) => p.productId).join(", ")}` },
      { status: 400 }
    );
  }

  const sains  = products.filter((p) => p.status === "SAIN");
  const casses = products.filter((p) => p.status === "CASSE");

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Jouets SAINS → réintégrer au stock
      for (const item of sains) {
        await tx.products.update({
          where: { id: item.productId },
          data: { stock: { increment: 1 } },
        });
      }

      // 2. Jouets CASSÉS → passer en condition DAMAGED, ne pas incrémenter le stock
      for (const item of casses) {
        await tx.products.update({
          where: { id: item.productId },
          data: { condition: "DAMAGED" },
        });
      }

      // 3. Passer la commande en RETURNED (réceptionnée et auditée)
      await tx.orders.update({
        where: { id: orderId },
        data: { status: "RETURNED" },
      });

      // 4. Réinitialiser renewalIntention des OrderProducts (retour clôturé)
      await tx.orderProducts.updateMany({
        where: { OrderId: orderId },
        data: { renewalIntention: null },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: `Audit terminé : ${sains.length} jouet(s) réintégré(s) au stock, ${casses.length} jouet(s) marqué(s) DAMAGED.`,
        sains: sains.map((p) => p.productId),
        casses: casses.map((p) => p.productId),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Audit] Erreur transaction:", error);
    return NextResponse.json({ error: "Erreur serveur lors de l'audit." }, { status: 500 });
  }
}
