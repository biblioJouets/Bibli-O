import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/core/database";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const giftCodeSchema = z.object({
  code: z.string().min(1, "Le code est requis").trim(),
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = giftCodeSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: "Format de code invalide." }, { status: 400 });
    }

    const { code } = parsedData.data;

    // 1. Vérification du code
    const giftCode = await prisma.giftCode.findFirst({
      where: { code: code, isUsed: false }
    });

    if (!giftCode) {
      return NextResponse.json({ error: "Code invalide ou déjà utilisé." }, { status: 404 });
    }

    const userIdInt = parseInt(session.user.id, 10);
    const amountToAddInCents = giftCode.amount * 100; 

    // 2. Mise à jour de Prisma (Source de vérité)
    await prisma.$transaction([
      prisma.users.update({
        where: { id: userIdInt },
        data: { giftCredit: { increment: amountToAddInCents } }
      }),
      prisma.giftCode.update({
        where: { id: giftCode.id },
        data: { isUsed: true, usedBy: userIdInt, usedAt: new Date() }
      })
    ]);

    // 3. Si le client a DÉJÀ un abonnement actif, on attache un coupon pour le prochain cycle
    try {
      const activeOrder = await prisma.orders.findFirst({
        where: {
          userId: userIdInt,
          status: 'ACTIVE',
          stripeSubscriptionId: { not: null }
        }
      });

      if (activeOrder?.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(activeOrder.stripeSubscriptionId);
        const subPrice = subscription.items.data[0].price.unit_amount;
        const discountToApply = Math.min(amountToAddInCents, subPrice);

        if (discountToApply > 0) {
          const coupon = await stripe.coupons.create({
            amount_off: discountToApply,
            currency: 'eur',
            duration: 'once',
            max_redemptions: 1,
            name: `Carte Cadeau ${code}`,
            applies_to: { products: [subscription.items.data[0].price.product] }
          });

          await stripe.subscriptions.update(activeOrder.stripeSubscriptionId, {
            discounts: [{ coupon: coupon.id }]
          });
          console.log(`[GiftCode] Coupon de ${discountToApply / 100}€ attaché à l'abonnement existant.`);
        }
      }
    } catch (stripeErr) {
      console.error("[GiftCode] Erreur lors de l'application du coupon sur l'abonnement:", stripeErr);
    }

    return NextResponse.json({ success: true, message: "Cagnotte créditée avec succès !" });

  } catch (error) {
    console.error("Erreur GiftCode:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}