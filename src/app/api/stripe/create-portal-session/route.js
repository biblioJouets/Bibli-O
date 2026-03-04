//src/app/api/stripe/create-portal-session/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/core/database';

// On initialise Stripe avec ta clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  try {
    // 1. On récupère l'ID de la commande envoyé par le bouton
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    // 2. On cherche la commande dans ta base de données Prisma
    const order = await prisma.orders.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!order || !order.stripeSubscriptionId) {
      return NextResponse.json({ error: "Commande ou abonnement introuvable" }, { status: 404 });
    }

    // 3. On interroge Stripe pour récupérer le vrai "Customer ID" lié à cet abonnement
    const subscription = await stripe.subscriptions.retrieve(order.stripeSubscriptionId);
    
    if (!subscription || !subscription.customer) {
      return NextResponse.json({ error: "Client Stripe introuvable" }, { status: 404 });
    }

    // 4. On prépare l'URL de retour (pour quand le client cliquera sur "Retour à la boutique" sur Stripe)
    // En local, ça sera localhost:3000/mon-compte. En production, ça prendra ta vraie URL.
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mon-compte`;

    // 5. On demande à Stripe de créer l'accès sécurisé au portail
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.customer,
      return_url: returnUrl,
    });

    // 6. On redirige instantanément le client vers ce portail !
    return NextResponse.redirect(portalSession.url);

  } catch (error) {
    console.error("❌ Erreur création portail Stripe:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}