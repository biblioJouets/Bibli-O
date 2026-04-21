//src/app/api/stripe/create-portal-session/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/core/database';

// On initialise Stripe avec ta clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const subscriptionId = searchParams.get('subscriptionId');

    let stripeSubscriptionId;

    if (subscriptionId) {
      // Chemin direct : subscriptionId fourni (depuis facturation/abonnement)
      stripeSubscriptionId = subscriptionId;
    } else if (orderId) {
      // Chemin legacy : résoudre via orderId
      const order = await prisma.orders.findUnique({ where: { id: parseInt(orderId) } });
      if (!order?.stripeSubscriptionId) {
        return NextResponse.json({ error: "Commande ou abonnement introuvable" }, { status: 404 });
      }
      stripeSubscriptionId = order.stripeSubscriptionId;
    } else {
      return NextResponse.json({ error: "orderId ou subscriptionId requis" }, { status: 400 });
    }

    // On interroge Stripe pour récupérer le vrai "Customer ID" lié à cet abonnement
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    
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