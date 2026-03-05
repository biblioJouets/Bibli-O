/* src/app/api/webhooks/stripe/route.js */
import { NextResponse } from "next/server";
import { headers } from "next/headers"; 
import Stripe from "stripe";
import prisma from "@/lib/core/database";
import { createOrder } from "@/lib/modules/orders/order.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const headersList = await headers(); 
  const sig = headersList.get("stripe-signature");

  let event;
  
  // 1. VÉRIFICATION DE SÉCURITÉ ET CONSTRUCTION DE L'ÉVÉNEMENT
  try {
    if (!endpointSecret) throw new Error("Webhook secret manquant dans .env");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error(` Webhook Signature Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 2. ROUTAGE DES ÉVÉNEMENTS STRIPE

  // --- SCÉNARIO A : Paiement mensuel d'un abonnement (Prolongation) ---
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object;

    let stripeSubId = invoice.subscription || 
      invoice.parent?.subscription_details?.subscription ||
      invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription;


    console.log(` [Debug Webhook] Facture payée reçue. ID Abonnement Stripe: ${stripeSubId}`);
    
    if (stripeSubId) {
      const order = await prisma.orders.findFirst({
        where: { stripeSubscriptionId: stripeSubId },
        include: { OrderProducts: true }
      });
      
      console.log(` [Debug Webhook] Commande trouvée en BDD ? ${order ? 'OUI (ID: ' + order.id + ')' : 'NON'}`);
      
      if (order) {
        const productsToRenew = order.OrderProducts.filter(p => 
          p.renewalIntention === 'PROLONGATION' || 
          p.renewalIntention === 'PROLONGATION_TACITE' ||
          p.renewalIntention === 'PAIEMENT_ECHOUE'
        );

        for (const product of productsToRenew) {
          const newBillingDate = new Date(product.nextBillingDate || new Date());
          newBillingDate.setDate(newBillingDate.getDate() + 30);

          const newRentalEnd = new Date(product.rentalEndDate || new Date());
          newRentalEnd.setDate(newRentalEnd.getDate() + 30);

          await prisma.orderProducts.update({
            where: {
              OrderId_ProductId: { OrderId: product.OrderId, ProductId: product.ProductId }
            },
            data: {
              nextBillingDate: newBillingDate,
              rentalEndDate: newRentalEnd,
              renewalIntention: null
            }
          });
        }
        
        console.log(` [Webhook] Abonnement prolongé pour ${productsToRenew.length} jouet(s) de la commande ${order.id}`);
      }
    }
  }

  // --- SCÉNARIO B : Nouvelle commande finalisée ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log(" Webhook reçu pour session:", session.id);

    const { 
      userId, cartId, cartSnapshot, shippingName, shippingAddress, 
      shippingCity, shippingZip, mondialRelayPointId, shippingPhone 
    } = session.metadata;

    try {
      if (!cartSnapshot) throw new Error("Métadonnée 'cartSnapshot' manquante.");
      
      const userIdInt = parseInt(userId);
      const cartIdInt = cartId ? parseInt(cartId) : null;

      const snapshotItems = JSON.parse(cartSnapshot); 
      const ids = snapshotItems.map(item => item.id);

      const dbProducts = await prisma.products.findMany({
        where: { id: { in: ids } }
      });

      const virtualCartItems = snapshotItems.map(snapItem => {
        const productInfo = dbProducts.find(p => p.id === snapItem.id);
        if (!productInfo) return null;
        return { productId: snapItem.id, quantity: snapItem.q, product: productInfo };
      }).filter(item => item !== null);

      if (virtualCartItems.length === 0) throw new Error("Panier vide après vérification BDD");

      const virtualCartData = { items: virtualCartItems };
      const totalAmount = session.amount_total / 100;
      
      const shippingData = {
        shippingName, shippingAddress, shippingZip, shippingCity, shippingPhone,
        mondialRelayPointId: mondialRelayPointId && mondialRelayPointId !== "null" ? mondialRelayPointId : null
      };
      
      console.log(" Création de la commande...");
      const newOrder = await createOrder(userIdInt, virtualCartData, totalAmount, shippingData);
      console.log(" Commande créée ! ID:", newOrder.id);
      
      if (cartIdInt) {
        console.log(" Suppression du panier ID:", cartIdInt);
        await prisma.cartItem.deleteMany({ where: { cartId: cartIdInt } });
      } else {
        console.error(" Pas de cartId reçu, IMPOSSIBLE DE VIDER LE PANIER.");
      }

    } catch (error) {
      console.error(" Erreur Webhook:", error);
      return NextResponse.json({ error: "Erreur traitement commande" }, { status: 500 });
    }
  }

  // --- SCÉNARIO C : Échec du paiement de la prolongation ---
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    
    // 1. Recherche intelligente de l'abonnement
    const stripeSubId = 
      invoice.subscription || 
      invoice.parent?.subscription_details?.subscription ||
      invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription;


    console.log(` [Debug Échec] Facture impayée reçue. ID Abonnement : ${stripeSubId}`);

    if (stripeSubId) {
      const order = await prisma.orders.findFirst({
        where: { stripeSubscriptionId: stripeSubId },
        include: { OrderProducts: true }
      });

      console.log(` [Debug Échec] Commande trouvée en BDD ? ${order ? 'OUI (ID: ' + order.id + ')' : 'NON'}`);

      if (order) {
        const productsToRenew = order.OrderProducts.filter(p => 
          p.renewalIntention === 'PROLONGATION' || 
          p.renewalIntention === 'PROLONGATION_TACITE'
        );

        for (const product of productsToRenew) {
          await prisma.orderProducts.update({
            where: {
              OrderId_ProductId: { OrderId: product.OrderId, ProductId: product.ProductId }
            },
            data: { renewalIntention: 'PAIEMENT_ECHOUE' }
          });
        }
        
        console.log(` [Webhook] Échec de paiement enregistré pour ${productsToRenew.length} jouet(s) de la commande ${order.id}`);
      }
    }
  }

  return NextResponse.json({ received: true });
}