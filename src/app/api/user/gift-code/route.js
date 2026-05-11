import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import Stripe from "stripe";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/core/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const bodySchema = z.object({
  code: z
    .string({ required_error: "Le code est requis.", invalid_type_error: "Le code doit être une chaîne de caractères." })
    .min(1, "Le code est requis.")
    .max(32, "Le code est trop long.")
    .regex(/^[A-Z0-9\-]+$/, "Format de code invalide."),
});

export async function POST(request) {
  try {
    // 1. Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Vous devez être connecté." },
        { status: 401 }
      );
    }
    const userId = parseInt(session.user.id);

    // 2. Validation
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Corps de la requête invalide." },
        { status: 400 }
      );
    }
    const validation = bodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    const { code } = validation.data;

    // 3. Vérification du code en base
    const giftCode = await prisma.giftCode.findUnique({ where: { code } });

    if (!giftCode) {
      return NextResponse.json(
        { success: false, message: "Ce code est invalide." },
        { status: 400 }
      );
    }
    if (giftCode.isUsed) {
      return NextResponse.json(
        { success: false, message: "Ce code a déjà été utilisé." },
        { status: 400 }
      );
    }

    // 4. Récupération ou création du stripeCustomerId
    let user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, stripeCustomerId: true },
    });

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
        metadata: { userId: String(userId) },
      });
      stripeCustomerId = customer.id;

      await prisma.users.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // 5. Crédit du solde Stripe (montant négatif = crédit client)
    const amountInCents = Math.round(giftCode.amount * 100);
    await stripe.customers.createBalanceTransaction(stripeCustomerId, {
      amount: -amountInCents,
      currency: "eur",
      description: `Activation Carte Cadeau — code ${code}`,
    });

    // 6. Marquage du code comme utilisé
    await prisma.giftCode.update({
      where: { id: giftCode.id },
      data: {
        isUsed: true,
        usedBy: userId,
        usedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `🎉 Carte cadeau activée ! ${giftCode.amount.toFixed(2)} € ont été crédités sur ton compte.`,
    });
  } catch (error) {
    console.error("[gift-code] Erreur:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
