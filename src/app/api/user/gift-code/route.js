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

    const giftCode = await prisma.giftCode.findFirst({
      where: { code: code, isUsed: false }
    });

    if (!giftCode) {
      return NextResponse.json({ error: "Code invalide ou déjà utilisé." }, { status: 404 });
    }

    const userIdInt = parseInt(session.user.id, 10);
    const amountToAddInCents = giftCode.amount * 100; 

    // On récupère l'utilisateur
    const user = await prisma.users.findUnique({
      where: { id: userIdInt }
    });

    // 1. Transaction Prisma
    await prisma.$transaction([
      prisma.users.update({
        where: { id: userIdInt },
        data: { 
          giftCredit: { increment: amountToAddInCents } 
        }
      }),
      prisma.giftCode.update({
        where: { id: giftCode.id },
        data: { 
          isUsed: true, 
          usedBy: userIdInt, 
          usedAt: new Date() 
        }
      })
    ]);

    // 2. Application sur l'Abonnement Actif (Si existant)
    try {
      // Chercher une commande active avec un abonnement Stripe
      const activeOrder = await prisma.orders.findFirst({
         where: { 
             userId: userIdInt, 
             status: 'ACTIVE',
             stripeSubscriptionId: { not: null }
         }
      });

      if (activeOrder && activeOrder.stripeSubscriptionId) {
         // Créer un coupon à usage unique pour ce montant
         const coupon = await stripe.coupons.create({
            amount_off: amountToAddInCents,
            currency: 'eur',
            duration: 'once',
            name: `Carte Cadeau ${code}`,
         });

         // Appliquer ce coupon au prochain cycle de l'abonnement
         await stripe.subscriptions.update(activeOrder.stripeSubscriptionId, {
            discounts: [{ coupon: coupon.id }]
         });
         
         console.log(`[GiftCode] Coupon de ${giftCode.amount}€ appliqué sur l'abonnement ${activeOrder.stripeSubscriptionId}`);
      }
    } catch (stripeErr) {
      console.error("[GiftCode] Erreur lors de l'application du coupon sur l'abonnement Stripe:", stripeErr);
      // On logue l'erreur mais on ne bloque pas l'UI car Prisma est déjà à jour
    }

    return NextResponse.json({ success: true, message: "Cagnotte créditée avec succès !" });

  } catch (error) {
    console.error("Erreur GiftCode:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}