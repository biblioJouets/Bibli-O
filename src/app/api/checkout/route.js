// src/app/api/checkout/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import prisma from "@/lib/core/database";
import { checkRateLimit, getRateLimitKey } from "@/lib/core/security/rateLimit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const rl = checkRateLimit(`checkout:${getRateLimitKey(req)}`, 5);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

    const body = await req.json();
    const { cartItems, shippingData, promoCode, childAge, childGender } = body;
    
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return NextResponse.json({ error: "Panier invalide" }, { status: 400 });
    }

    // Vérifier qu'il n'y a pas de quantités négatives ou décimales
    const hasInvalidItems = cartItems.some(item => 
        !Number.isInteger(item.quantity) || item.quantity <= 0
    );

    if (hasInvalidItems) {
        return NextResponse.json({ error: "Quantités invalides détectées." }, { status: 400 });
    }
    
    // Snapshot enrichi du panier pour le transmettre de manière transparente au Webhook
    const cartSnapshot = cartItems.map(item => ({ 
      id: item.productId, 
      q: item.quantity,
      intent: item.intent || 'RENTAL' // 'RENTAL' par défaut si non précisé
    }));

    // Validation de l'adresse pour livraison domicile
    const AUTHORIZED_ZONES = {
        "34690": ["FABREGUES", "FABRÈGUES"],
        "34570": ["PIGNAN", "SAUSSAN"]
    };

    if (shippingData.mondialRelayPointId === "DOMICILE") {
        const zip = shippingData.shippingZip?.trim();
        const city = shippingData.shippingCity?.toUpperCase().trim();
        const allowedCities = AUTHORIZED_ZONES[zip] || [];
        const isAllowed = allowedCities.some(allowed => city?.includes(allowed));

        if (!isAllowed) {
             return NextResponse.json({ error: "Adresse non éligible à la livraison domicile." }, { status: 400 });
        }
    }

    // --- DÉTECTION BOX MYSTÈRE ---
    const isBoxMystere = cartItems.some(
      item => item.reference === 'BOX-MYSTERE' || item.product?.reference === 'BOX-MYSTERE'
    );

    // --- CODE PROMO ---
    let appliedPromo = null;
    let stripeDiscount = undefined;

    if (promoCode) {
        const cleanCode = promoCode.trim().toUpperCase();

        if (cleanCode === 'BOXMAI24' && !isBoxMystere) {
            return NextResponse.json({
                error: "Ce code est strictement réservé à la Box Mystère de Mai.",
            }, { status: 400 });
        }

        if (cleanCode === 'BIBLIOMOISOFFERT') {
            const userIdInt = parseInt(session.user.id, 10);
            const existingUsage = await prisma.promoCodeUsage.findUnique({
                where: { userId_promoCode: { userId: userIdInt, promoCode: cleanCode } },
            });

            if (existingUsage) {
                return NextResponse.json({ error: "Vous avez déjà profité de cette offre de bienvenue !" }, { status: 403 });
            }
            appliedPromo = cleanCode;

        } else {
            try {
                const promoCodes = await stripe.promotionCodes.list({
                    code: cleanCode,
                    active: true,
                    limit: 1
                });

                if (promoCodes.data.length > 0) {
                    stripeDiscount = [{ promotion_code: promoCodes.data[0].id }];
                    appliedPromo = cleanCode;
                } else {
                    return NextResponse.json({ error: `Le code ${cleanCode} est invalide ou expiré.` }, { status: 400 });
                }
            } catch (err) {
                return NextResponse.json({ error: "Erreur lors de la vérification du code." }, { status: 500 });
            }
        }
    }

    const pricingMap = {
        1: process.env.STRIPE_PRICE_1_TOY,
        2: process.env.STRIPE_PRICE_2_TOYS,
        3: process.env.STRIPE_PRICE_3_TOYS,
        4: process.env.STRIPE_PRICE_4_TOYS,
        5: process.env.STRIPE_PRICE_5_TOYS,
        6: process.env.STRIPE_PRICE_6_TOYS,
        7: process.env.STRIPE_PRICE_7_TOYS,
        8: process.env.STRIPE_PRICE_8_TOYS,
        9: process.env.STRIPE_PRICE_9_TOYS
    };

    // --- 1. SÉCURISATION DES PRIX VIA LA BDD ---
    const productIds = cartItems.map(item => item.productId).filter(Boolean);
    const dbProducts = await prisma.products.findMany({
      where: { id: { in: productIds } }
    });

    // --- 2. SÉPARATION DES ARTICLES SELON L'INTENTION ---
    const rentalItems = cartItems.filter(item => item.intent !== 'PURCHASE');
    const purchaseItems = cartItems.filter(item => item.intent === 'PURCHASE');

    // Le décompte de l'abonnement s'appuie uniquement sur les locations
    const rentalCount = rentalItems.reduce((acc, item) => acc + item.quantity, 0);

    let line_items = [];
    let priceId;

    // --- 3. TRAITEMENT DU BLOC LOCATION (ABONNEMENT) ---
    if (rentalCount > 0) {
        if (isBoxMystere) {
            console.log('[Checkout] 📦 Box Mystère détectée');
            priceId = process.env.STRIPE_PRICE_4_TOYS;
            const couponId = process.env.STRIPE_COUPON_BOX_MAI;

            if (!priceId || !couponId) {
                return NextResponse.json({ error: "Configuration Stripe manquante pour la Box Mystère." }, { status: 500 });
            }

            line_items.push({ price: priceId, quantity: 1 });
            stripeDiscount = [{ coupon: couponId }];
            appliedPromo = 'BOXMAI24';
        } else {
            priceId = pricingMap[rentalCount];
            if (priceId) {
                line_items.push({ price: priceId, quantity: 1 });
            } else if (rentalCount > 9) {
                return NextResponse.json({ error: "Pour plus de 9 jouets en location, veuillez nous contacter." }, { status: 400 });
            } else {
                return NextResponse.json({ error: "Votre panier de location est invalide." }, { status: 400 });
            }
        }
    } else if (purchaseItems.length === 0) {
        return NextResponse.json({ error: "Votre panier est vide." }, { status: 400 });
    }

    // --- 4. TRAITEMENT DU BLOC ACHAT IMMÉDIAT (PRIX BIBLIO) ---
    for (const item of purchaseItems) {
        const dbProduct = dbProducts.find(p => p.id === item.productId);
        if (!dbProduct) continue;

        // Choix sécurisé du prix : priorité absolue à la valeur issue de la BDD
        const finalPrice = dbProduct.biblioPrice || dbProduct.price;

        line_items.push({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: `Achat définitif — ${dbProduct.name}`,
                    images: dbProduct.images?.length ? [`${baseUrl}${dbProduct.images[0]}`] : [],
                },
                unit_amount: Math.round(finalPrice * 100),
            },
            quantity: item.quantity,
        });
    }

    // --- 5. SÉLECTION DYNAMIQUE DU MODE DE LA SESSION ---
    // S'il n'y a que de l'achat définitif, on bascule en mode 'payment'
    const stripeMode = rentalCount > 0 ? "subscription" : "payment";

    // Récupération optionnelle du stripeCustomerId pour appliquer les crédits cadeaux
    const dbUser = await prisma.users.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { stripeCustomerId: true },
    });

    console.log(`[Checkout] Session Stripe configurée en mode ${stripeMode}`);
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: stripeMode,
      ...(dbUser?.stripeCustomerId
        ? { customer: dbUser.stripeCustomerId }
        : { customer_email: session.user.email }),
      discounts: stripeDiscount,
      allow_promotion_codes: stripeDiscount ? undefined : true,
    
      custom_text: appliedPromo === 'BIBLIOMOISOFFERT' ? {
        submit: {
          message: "🎁 **Code BIBLIOMOISOFFERT validé !** Réglez votre 1er mois aujourd'hui, votre 2ème mois sera automatiquement à 0,00 €."
        }
      } : appliedPromo === 'BOXMAI24' ? {
        submit: {
          message: "📦 **Box Mystère de Mai** — Offre spéciale applied_promo !"
        }
      } : undefined,
    
      success_url: `${baseUrl}/confirmation-commande?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/paiement`,
      
      metadata: {
        userId: session.user.id,
        applied_promo: (appliedPromo === 'BIBLIOMOISOFFERT' || appliedPromo === 'BOXMAI24') ? appliedPromo : "",
        cartSnapshot: JSON.stringify(cartSnapshot),
        cartId: body.cartId || "",
        shippingName: shippingData.shippingName || "",
        shippingAddress: shippingData.shippingAddress || "",
        shippingCity: shippingData.shippingCity || "",
        shippingZip: shippingData.shippingZip || "",
        shippingPhone: shippingData.shippingPhone || "",
        mondialRelayPointId: shippingData.mondialRelayPointId ? String(shippingData.mondialRelayPointId) : "",
        isBoxMystere: isBoxMystere ? "true" : "",
        childAge: isBoxMystere ? (childAge || "") : "",
        childGender: isBoxMystere ? (childGender || "") : "",
      },
      billing_address_collection: 'required',
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error('[Checkout] ❌ Erreur:', error?.type || error?.name || 'unknown', '|', error?.message);
    if (error?.raw) console.error('[Checkout] Stripe raw error:', JSON.stringify(error.raw));
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}