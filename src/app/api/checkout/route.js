import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

    const body = await req.json();
    const { cartItems, shippingData } = body; 
    
    // Calcul du nombre total de jouets
    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    
    // Snapshot du panier
    const cartSnapshot = cartItems.map(item => ({ 
      id: item.productId, 
      q: item.quantity 
    }));

    
    // Mapping direct entre quantité et variable d'environnement
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

    let line_items = [];
    const priceId = pricingMap[count];

    if (priceId) {
        // Cas standard : entre 1 et 9 jouets
        line_items.push({ 
            price: priceId, 
            quantity: 1 
        });
    } else if (count > 9) {
        // Cas > 9 jouets : Logique "Sur mesure" ou blocage
        // Option A : On bloque et on demande de contacter
        return NextResponse.json({ error: "Pour plus de 9 jouets, veuillez nous contacter pour une offre sur mesure." }, { status: 400 });
        
        // Option B (Si tu veux permettre >9 en ajoutant des extras, c'est plus complexe, dis-le moi si besoin)
    } else {
        // Cas 0 jouet
        return NextResponse.json({ error: "Votre panier est vide." }, { status: 400 });
    }

    // 3. Créer la session Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "subscription", 
      customer_email: session.user.email,
      success_url: `${baseUrl}/confirmation-commande?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/paiement`,
      
      metadata: {
        userId: session.user.id,
        // 👇 ON ENVOIE LE NOUVEAU FORMAT AVEC QUANTITÉS
        cartSnapshot: JSON.stringify(cartSnapshot), 
        
        cartId: body.cartId || "", 
        shippingName: shippingData.shippingName || "",
        shippingAddress: shippingData.shippingAddress || "",
        shippingCity: shippingData.shippingCity || "",
        shippingZip: shippingData.shippingZip || "",
        shippingPhone: shippingData.shippingPhone || "",
        mondialRelayPointId: shippingData.mondialRelayPointId ? String(shippingData.mondialRelayPointId) : ""
      },
      billing_address_collection: 'required',
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("Erreur Stripe:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}