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
    if (!endpointSecret) throw new Error("Webhook secret manquant");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    // 👇 On récupère cartSnapshot (et non plus productIds)
    const { userId, cartId, cartSnapshot, shippingName, shippingAddress, shippingCity, shippingZip, mondialRelayPointId, shippingPhone } = session.metadata;

    try {
      if (!cartSnapshot) {
        throw new Error("Aucun snapshot panier trouvé dans les métadonnées Stripe");
      }
      
      // On récupère [{id: 1, q: 2}, {id: 5, q: 1}]
      const snapshotItems = JSON.parse(cartSnapshot); 
      const ids = snapshotItems.map(item => item.id);

      // On va chercher les infos fraîches en BDD
      const dbProducts = await prisma.products.findMany({
        where: { id: { in: ids } }
      });

      // On reconstruit le panier virtuel en croisant BDD et Snapshot
      const virtualCartItems = snapshotItems.map(snapItem => {
        const productInfo = dbProducts.find(p => p.id === snapItem.id);
        if (!productInfo) return null; // Sécurité si un produit a été supprimé de la BDD entre temps

        return {
          productId: snapItem.id,
          quantity: snapItem.q, // 👈 ICI : On utilise la vraie quantité payée
          product: productInfo 
        };
      }).filter(item => item !== null); // On filtre les nuls éventuels

      const virtualCartData = { items: virtualCartItems };

      // Vérification cohérence
      if (virtualCartData.items.length === 0) {
        throw new Error("Produits introuvables en BDD (IDs invalides)");
      }

      const totalAmount = session.amount_total / 100;
      const shippingData = {
        shippingName, shippingAddress, shippingZip, shippingCity, shippingPhone,
        mondialRelayPointId: mondialRelayPointId && mondialRelayPointId !== "null" ? mondialRelayPointId : null
      };

      // 2. Créer la commande
      const newOrder = await createOrder(parseInt(userId), virtualCartData, totalAmount, shippingData);
      
      // 3. Vider le panier
      if (cartId) {
        await prisma.cartItem.deleteMany({ where: { cartId: parseInt(cartId) } });
      }

    } catch (error) {
      console.error("❌ Erreur CRITIQUE Webhook:", error);
      return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}