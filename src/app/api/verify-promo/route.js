import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/core/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkRateLimit, getRateLimitKey } from "@/lib/core/security/rateLimit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  // Rate limit : 10 tentatives par minute par IP
  const rl = checkRateLimit(getRateLimitKey(req), 10);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });
  }

  // Authentification requise pour éviter l'énumération anonyme
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

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
      const existingUsage = await prisma.promoCodeUsage.findUnique({
        where: { userId_promoCode: { userId: parseInt(session.user.id, 10), promoCode: cleanCode } },
      });
      if (existingUsage) {
        return NextResponse.json({ valid: false, message: "Vous avez déjà profité de cette offre de bienvenue !" });
      }
      return NextResponse.json({ valid: true, message: "🎁 Super ! 1er mois payé, 2ème mois à 0€ !" });
    }

    // 2. Cas UGC : Interrogation de Stripe en temps réel
    // On recherche d'abord sans filtre "active" pour distinguer "inexistant" de "expiré/désactivé"
    const allMatches = await stripe.promotionCodes.list({
        code: cleanCode,
        limit: 1
    });

    if (allMatches.data.length === 0) {
        return NextResponse.json({ valid: false, message: "Ce code promo n'existe pas." });
    }

    const promo = allMatches.data[0];

    if (!promo.active) {
        return NextResponse.json({ valid: false, message: "Ce code promo est expiré ou a été désactivé." });
    }

    // Vérifie l'épuisement global (nombre max de rédemptions atteint)
    if (promo.max_redemptions !== null && promo.times_redeemed >= promo.max_redemptions) {
        return NextResponse.json({ valid: false, message: "Ce code promo a déjà été entièrement utilisé." });
    }

    // Vérifie que le code n'a pas déjà été consommé par cet utilisateur
    const existingUsage = await prisma.promoCodeUsage.findUnique({
        where: { userId_promoCode: { userId: parseInt(session.user.id, 10), promoCode: cleanCode } },
    });
    if (existingUsage) {
        return NextResponse.json({ valid: false, message: "Vous avez déjà utilisé ce code promo." });
    }

    // Construit un message décrivant la réduction
    const coupon = promo.coupon;
    let discountLabel = "Réduction appliquée";
    if (coupon?.percent_off) {
        discountLabel = `-${coupon.percent_off}% appliqué`;
    } else if (coupon?.amount_off) {
        discountLabel = `-${(coupon.amount_off / 100).toFixed(2)}€ appliqué`;
    }

    return NextResponse.json({ valid: true, message: `🎁 Code valide ! ${discountLabel}` });

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}