import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/core/database';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { orderId, productId } = await req.json();

    // 1. Vérification de sécurité et récupération de la commande
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { 
        Users: true,
        OrderProducts: { where: { ProductId: productId } } // On cible ce jouet
      }
    });

    if (!order || order.Users?.email !== session.user.email) {
      return NextResponse.json({ error: "Action interdite" }, { status: 403 });
    }

    const orderProduct = order.OrderProducts[0];
    if (!orderProduct) {
      return NextResponse.json({ error: "Jouet introuvable" }, { status: 404 });
    }

    // --- 2. LOGIQUE STRIPE (La diminution de la facture) ---
    if (order.stripeSubscriptionId) {
      // On récupère les lignes de facturation de cet abonnement
      const subscriptionItems = await stripe.subscriptionItems.list({
        subscription: order.stripeSubscriptionId,
      });

      let itemUpdated = false;

      // On boucle sur les lignes pour enlever 1 unité (1 jouet)
      for (const item of subscriptionItems.data) {
        if (!itemUpdated) {
          if (item.quantity > 1) {
            // Le client louait plusieurs jouets regroupés : on baisse la quantité
            await stripe.subscriptionItems.update(item.id, { quantity: item.quantity - 1 });
            itemUpdated = true;
            console.log(`✅ [Stripe] Quantité réduite de 1 pour l'abonnement ${order.stripeSubscriptionId}`);
          } 
          else if (item.quantity === 1) {
            // C'est une ligne avec 1 seul jouet
            if (subscriptionItems.data.length === 1) {
              // C'était le tout dernier jouet de la commande : On résilie tout l'abonnement !
              await stripe.subscriptions.cancel(order.stripeSubscriptionId);
              console.log(`✅ [Stripe] Dernier jouet rendu, abonnement ${order.stripeSubscriptionId} totalement résilié.`);
            } else {
              // Il y a d'autres jouets sur d'autres lignes, on supprime juste celle-ci
              await stripe.subscriptionItems.del(item.id);
              console.log(`✅ [Stripe] Ligne de facturation supprimée pour le jouet.`);
            }
            itemUpdated = true;
          }
        }
      }
    }

    // --- 3. LOGIQUE BASE DE DONNÉES (Arrêt de l'horloge) ---
    await prisma.orderProducts.update({
      where: {
        OrderId_ProductId: { OrderId: orderId, ProductId: productId }
      },
      data: {
        renewalIntention: 'RETOUR_DEMANDE', // Indique que le process logistique commence
        nextBillingDate: null, // TRÈS IMPORTANT : On efface la date pour que le CRON ignore ce jouet !
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Retour validé. La facturation pour ce jouet est arrêtée." 
    }, { status: 200 });

  } catch (error) {
    console.error("Erreur API Retour Jouet:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}