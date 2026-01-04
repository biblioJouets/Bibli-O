import { NextResponse } from "next/server";
import { headers } from "next/headers"; // Import standard
import Stripe from "stripe";
import prisma from "@/lib/core/database";
import { createOrder } from "@/lib/modules/orders/order.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();

  // --- CORRECTION NEXT.JS 16 ---
  // headers() est maintenant une promesse, il faut mettre 'await'
  const headersList = await headers(); 
  const sig = headersList.get("stripe-signature");
  // -----------------------------

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
    const { userId, shippingName, shippingAddress, shippingCity, shippingZip, mondialRelayPointId } = session.metadata;

    console.log(`💰 Paiement validé pour le User ID: ${userId}`);

    try {
      // 1. Récupérer le panier
      const userCart = await prisma.cart.findUnique({
        where: { userId: parseInt(userId) },
        include: { items: { include: { product: true } } }
      });

      if (!userCart || userCart.items.length === 0) {
        console.error("Panier vide ou introuvable pour ce paiement.");
        return NextResponse.json({ received: true });
      }

      // 2. Créer la commande
      const totalAmount = session.amount_total / 100;
      const shippingData = {
        shippingName,
        shippingAddress,
        shippingZip,
        shippingCity,
        mondialRelayPointId: mondialRelayPointId || null
      };

      const newOrder = await createOrder(parseInt(userId), userCart, totalAmount, shippingData);
      console.log(`✅ Commande #${newOrder.id} créée avec succès !`);

      // 3. Vider le panier
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