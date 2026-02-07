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

  try {
    if (!endpointSecret) throw new Error("Webhook secret manquant dans .env");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook Signature Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // On écoute checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("🔔 Webhook reçu pour session:", session.id);

    const { 
      userId, 
      cartId, // <-- C'est ici qu'on le récupère
      cartSnapshot, 
      shippingName, 
      shippingAddress, 
      shippingCity, 
      shippingZip, 
      mondialRelayPointId, 
      shippingPhone 
    } = session.metadata;

    try {
      if (!cartSnapshot) {
        throw new Error("Métadonnée 'cartSnapshot' manquante.");
      }
      
      const userIdInt = parseInt(userId);
      const cartIdInt = cartId ? parseInt(cartId) : null;

      // 1. Récupération du Snapshot
      const snapshotItems = JSON.parse(cartSnapshot); 
      const ids = snapshotItems.map(item => item.id);

      // 2. Vérification des produits en BDD
      const dbProducts = await prisma.products.findMany({
        where: { id: { in: ids } }
      });

      // 3. Reconstruction du panier virtuel
      const virtualCartItems = snapshotItems.map(snapItem => {
        const productInfo = dbProducts.find(p => p.id === snapItem.id);
        if (!productInfo) return null;
        return {
          productId: snapItem.id,
          quantity: snapItem.q,
          product: productInfo 
        };
      }).filter(item => item !== null);

      if (virtualCartItems.length === 0) {
        throw new Error("Panier vide après vérification BDD");
      }

      const virtualCartData = { items: virtualCartItems };
      const totalAmount = session.amount_total / 100;
      
      const shippingData = {
        shippingName, shippingAddress, shippingZip, shippingCity, shippingPhone,
        mondialRelayPointId: mondialRelayPointId && mondialRelayPointId !== "null" ? mondialRelayPointId : null
      };

      // 4. CRÉATION DE LA COMMANDE
      console.log("🔄 Création de la commande...");
      const newOrder = await createOrder(userIdInt, virtualCartData, totalAmount, shippingData);
      console.log("✅ Commande créée ! ID:", newOrder.id);
      
      // 5. VIDER LE PANIER (C'est ici que ça se joue !)
      if (cartIdInt) {
        console.log("🗑️ Suppression du panier ID:", cartIdInt);
        await prisma.cartItem.deleteMany({ where: { cartId: cartIdInt } });
      } else {
        console.error("⚠️ Pas de cartId reçu, IMPOSSIBLE DE VIDER LE PANIER.");
      }

    } catch (error) {
      console.error("❌ Erreur Webhook:", error);
      return NextResponse.json({ error: "Erreur traitement commande" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}