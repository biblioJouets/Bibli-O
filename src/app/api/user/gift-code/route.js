//src/app/api/user/gift-code/route.js
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

    // 2. Vérification et création du client Stripe (Crucial)
    let user = await prisma.users.findUnique({ where: { id: userIdInt } });
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      // Le client n'a jamais commandé, on lui crée une coquille vide dans Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        metadata: { userId: userIdInt.toString() }
      });
      stripeCustomerId = customer.id;

      // On sauvegarde cet ID dans Prisma
      await prisma.users.update({
        where: { id: userIdInt },
        data: { stripeCustomerId: stripeCustomerId }
      });
      console.log(`[GiftCode] Nouveau client Stripe créé : ${stripeCustomerId}`);
    }

    // 3. Application du crédit sur le Customer Balance de Stripe
    // Dans Stripe, un crédit en faveur du client est NÉGATIF
    try {
      await stripe.customers.createBalanceTransaction(stripeCustomerId, {
        amount: -amountToAddInCents,
        currency: 'eur',
        description: `Carte cadeau ajoutée (${code})`
      });
      console.log(`[GiftCode] Solde Stripe crédité de ${amountToAddInCents / 100}€ pour ${stripeCustomerId}`);
    } catch (stripeErr) {
      console.error("[GiftCode] Erreur lors du crédit Stripe:", stripeErr);
      return NextResponse.json({ error: "Erreur de communication avec le processeur de paiement." }, { status: 500 });
    }

    // 4. Synchronisation visuelle dans Prisma
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

    return NextResponse.json({ success: true, message: "Cagnotte créditée avec succès !" });

  } catch (error) {
    console.error("Erreur GiftCode:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}