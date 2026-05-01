import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/core/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { promoCode, cartItems } = body;

    if (!promoCode) return NextResponse.json({ error: "Code manquant" }, { status: 400 });

    const cleanCode = promoCode.trim().toUpperCase();

    // Blocage BOXMAI24 : réservé exclusivement à la Box Mystère
    if (cleanCode === 'BOXMAI24') {
      const hasBox = Array.isArray(cartItems) && cartItems.some(
        item => item.reference === 'BOX-MYSTERE' || item.product?.reference === 'BOX-MYSTERE'
      );
      if (!hasBox) {
        return NextResponse.json({
          valid: false,
          message: "Ce code est strictement réservé à la Box Mystère de Mai.",
        });
      }
      return NextResponse.json({ valid: true, message: "📦 Code Box Mystère validé ! Réduction de 13,10 € appliquée." });
    }

    // 1. Cas spécifique : L'offre 1 mois acheté = 1 mois offert
    if (cleanCode === 'BIBLIOMOISOFFERT') {
      const session = await getServerSession(authOptions);
      if (session?.user) {
         const existingUsage = await prisma.promoCodeUsage.findUnique({
            where: { userId_promoCode: { userId: parseInt(session.user.id, 10), promoCode: cleanCode } },
         });
         if (existingUsage) {
             return NextResponse.json({ valid: false, message: "Vous avez déjà profité de cette offre de bienvenue !" });
         }
      }
      return NextResponse.json({ valid: true, message: "🎁 Super ! 1er mois payé, 2ème mois à 0€ !" });
    }

    // 2. Cas UGC : Interrogation de Stripe en temps réel
    const promoCodes = await stripe.promotionCodes.list({
        code: cleanCode,
        active: true, // Vérifie que le code n'est pas expiré ou désactivé
        limit: 1
    });

    if (promoCodes.data.length > 0) {
        return NextResponse.json({ valid: true, message: "🎁 Code enregistré ! La réduction s'appliquera au paiement." });
    } else {
        return NextResponse.json({ valid: false, message: "Code inexistant ou expiré." });
    }

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}