import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import prisma from "@/lib/core/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    // 1. Sécurité : Qui commande ?
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }

    const body = await req.json();
    const { cartItems, shippingData } = body; // On récupère les infos du front
    
    // Calcul du nombre de jouets
    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // 2. Déterminer les lignes de facture (Line Items)
    let line_items = [];

    // Logique de choix de l'abonnement
    if (count <= 2) {
      line_items.push({ price: process.env.STRIPE_PRICE_DECOUVERTE, quantity: 1 });
    } else if (count <= 4) {
      line_items.push({ price: process.env.STRIPE_PRICE_STANDARD, quantity: 1 });
    } else if (count <= 6) {
      line_items.push({ price: process.env.STRIPE_PRICE_PREMIUM, quantity: 1 });
    } else {
      // MAXI BOX (7 à 9 jouets)
      // 1. On facture la base Premium
      line_items.push({ price: process.env.STRIPE_PRICE_PREMIUM, quantity: 1 });
      // 2. On ajoute les jouets supplémentaires (ex: 8 jouets = 2 extras)
      const extraToys = count - 6;
      line_items.push({ price: process.env.STRIPE_PRICE_EXTRA_TOY, quantity: extraToys });
    }

    // 3. Récupérer ou créer le client Stripe (Optionnel mais recommandé pour lier au user)
    // Pour l'instant, on passe l'email directement à la session
    
    // 4. Créer la session Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // CB, Apple Pay, Google Pay auto
      line_items: line_items,
      mode: "subscription", // C'est un abonnement !
      customer_email: session.user.email, // Pré-remplit l'email
      
      // Où rediriger après le paiement ?
      success_url: `${baseUrl}/confirmation-commande?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/paiement`,

      // Métadonnées : Pour savoir quoi faire quand le paiement réussit (Webhook)
      metadata: {
        userId: session.user.id, // ID de ton User Prisma (si tu l'as sous la main, sinon via email)
        shippingName: shippingData.shippingName,
        shippingAddress: shippingData.shippingAddress,
        shippingCity: shippingData.shippingCity,
        shippingZip: shippingData.shippingZip
      },
      
      // Optionnel : Demander l'adresse de facturation/livraison à Stripe aussi
      billing_address_collection: 'required',
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("Erreur Stripe:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}