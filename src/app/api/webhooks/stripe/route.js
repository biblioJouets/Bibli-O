import { NextResponse } from "next/server";
import { headers } from "next/headers"; 
import Stripe from "stripe";
import prisma from "@/lib/core/database";
import { createOrder } from "@/lib/modules/orders/order.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();

  // --- COMPATIBILITÉ NEXT.JS 15/16 ---
  const headersList = await headers(); 
  const sig = headersList.get("stripe-signature");
  // -----------------------------------

  let event;

  try {
    if (!endpointSecret) throw new Error("Webhook secret manquant");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️  Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // GESTION DE L'ÉVÉNEMENT
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // 1. Extraction des métadonnées (envoyées depuis checkout/route.js)
    const { 
        userId, 
        shippingName, 
        shippingAddress, 
        shippingCity, 
        shippingZip, 
        mondialRelayPointId, 
        shippingPhone
    } = session.metadata;

    console.log(`💰 Paiement validé pour le User ID: ${userId}`);

    try {
      // 2. Récupérer le panier
      const userCart = await prisma.cart.findUnique({
        where: { userId: parseInt(userId) },
        include: { items: { include: { product: true } } }
      });

      if (!userCart || userCart.items.length === 0) {
        console.error("❌ Panier vide ou introuvable pour ce paiement.");
        return NextResponse.json({ received: true });
      }

      // 3. Préparer les données pour la commande
      const totalAmount = session.amount_total / 100;
      
      const shippingData = {
        shippingName,
        shippingAddress,
        shippingZip,
        shippingCity,
        shippingPhone,
        mondialRelayPointId: mondialRelayPointId && mondialRelayPointId !== "null" ? mondialRelayPointId : null
      };

      // 4. Créer la commande via le service (C'est lui qui enregistre en BDD)
      const newOrder = await createOrder(parseInt(userId), userCart, totalAmount, shippingData);
      
      console.log(`✅ Commande #${newOrder.id} créée avec succès ! MR ID: ${shippingData.mondialRelayPointId}`);

      // 5. Vider le panier
      await prisma.cartItem.deleteMany({
        where: { cartId: userCart.id }
      });
      console.log("🗑️ Panier vidé.");

    } catch (error) {
      console.error("❌ Erreur CRITIQUE lors de la création de commande:", error);
      return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}