/* src/app/api/webhooks/stripe/route.js */
import { NextResponse } from "next/server";
import { headers } from "next/headers"; 
import Stripe from "stripe";
import prisma from "@/lib/core/database";
import { createOrder } from "@/lib/modules/orders/order.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// -------------------------------------------------------------------
// FONCTIONS UTILITAIRES : EMAILING BREVO
// -------------------------------------------------------------------
async function sendBrevoEmail(toEmail, toName, templateId, params) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { 
          name: process.env.BREVO_SENDER_NAME || "Bibli'o Jouets", 
          email: process.env.BREVO_SENDER_EMAIL 
        },
        to: [{ email: toEmail, name: toName }],
        templateId: templateId,
        params: params
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Erreur Brevo:", errorData);
    }
  } catch (error) {
    console.error("❌ Exception Brevo:", error);
  }
}

function formatToyNames(names) {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  const last = names.pop();
  return names.join(", ") + " et " + last;
}

// -------------------------------------------------------------------
// ROUTE PRINCIPALE DU WEBHOOK
// -------------------------------------------------------------------
export async function POST(req) {
  const body = await req.text();
  const headersList = await headers(); 
  const sig = headersList.get("stripe-signature");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  let event;
  
  // 1. VÉRIFICATION DE SÉCURITÉ
  try {
    if (!endpointSecret) throw new Error("Webhook secret manquant dans .env");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error(` Webhook Signature Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 2. ROUTAGE DES ÉVÉNEMENTS STRIPE

  // --- SCÉNARIO A : Paiement mensuel d'un abonnement (Prolongation Réussie) ---
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object;

    const stripeSubId = invoice.subscription || 
      invoice.parent?.subscription_details?.subscription ||
      invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription;

    console.log(` [Debug Webhook] Facture payée reçue. ID Abonnement Stripe: ${stripeSubId}`);
    
    if (stripeSubId) {
      const order = await prisma.orders.findFirst({
        where: { stripeSubscriptionId: stripeSubId },
        include: { 
          OrderProducts: { include: { Products: true } },
          Users: true 
        }
      });
      
      if (order) {
        const productsToRenew = order.OrderProducts.filter(p => 
          p.renewalIntention === 'PROLONGATION' || 
          p.renewalIntention === 'PROLONGATION_TACITE' ||
          p.renewalIntention === 'PAIEMENT_ECHOUE'
        );

        const toyNames = [];
        let dateFormatted = "";

        for (const product of productsToRenew) {
          const newBillingDate = new Date(product.nextBillingDate || new Date());
          newBillingDate.setDate(newBillingDate.getDate() + 30);
          
          dateFormatted = newBillingDate.toLocaleDateString('fr-FR');

          const newRentalEnd = new Date(product.rentalEndDate || new Date());
          newRentalEnd.setDate(newRentalEnd.getDate() + 30);

          await prisma.orderProducts.update({
            where: { OrderId_ProductId: { OrderId: product.OrderId, ProductId: product.ProductId } },
            data: { nextBillingDate: newBillingDate, rentalEndDate: newRentalEnd, renewalIntention: null }
          });

          toyNames.push(product.Products.name);
        }

        // Remise à zéro du jeton d'échange mensuel
        await prisma.orders.update({
          where: { id: order.id },
          data: { hasExchangedThisMonth: false },
        });

        console.log(` [Webhook] Abonnement prolongé pour ${productsToRenew.length} jouet(s), jeton échange remis à zéro`);

        // 📧 ENVOI DE L'EMAIL DE SUCCÈS (Template ID: 13)
        if (toyNames.length > 0 && order.Users) {
          let prenom = "Client(e)";
          if (order.shippingName) {
            prenom = order.shippingName.split(' ')[0];
          } else if (order.Users.firstName) {
            prenom = order.Users.firstName;
          }
          
          if (prenom && prenom.trim() !== "") {
            prenom = prenom.trim();
            prenom = prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase();
          } else {
            prenom = "Client(e)";
          }

          const jouetsString = formatToyNames(toyNames);
          const lienFactureStripe = invoice.hosted_invoice_url || `${appUrl}/mon-compte`;

          await sendBrevoEmail(order.Users.email, prenom, 13, {
            prenom: prenom, 
            jouet: jouetsString,
            nouvelleDate: dateFormatted,
            lienFacture: lienFactureStripe
          });
          console.log(` [Brevo] Email de confirmation envoyé à ${order.Users.email}`);
        }
      }
    }
  }

  // --- SCÉNARIO B : Nouvelle commande finalisée ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log(" Webhook reçu pour session:", session.id);

    // 💡 AJOUT DE applied_promo DANS L'EXTRACTION DES MÉTADONNÉES
    const { 
      userId, cartId, cartSnapshot, shippingName, shippingAddress, 
      shippingCity, shippingZip, mondialRelayPointId, shippingPhone,
      applied_promo // <-- NOUVEAU
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
      const stripeSubscriptionId = session.subscription;
      
      const shippingData = {
        shippingName, shippingAddress, shippingZip, shippingCity, shippingPhone,
        mondialRelayPointId: mondialRelayPointId && mondialRelayPointId !== "null" ? mondialRelayPointId : null
      };
      
      console.log(" Création de la commande...");
      const newOrder = await createOrder(userIdInt, virtualCartData, totalAmount, shippingData, stripeSubscriptionId);
      console.log(" Commande créée ! ID:", newOrder.id);
      
      if (cartIdInt) {
        console.log(" Suppression du panier ID:", cartIdInt);
        await prisma.cartItem.deleteMany({ where: { cartId: cartIdInt } });
      } else {
        console.error(" Pas de cartId reçu, IMPOSSIBLE DE VIDER LE PANIER.");
      }

// -------------------------------------------------------------------
      // 🎁 GESTION DE L'OFFRE BOGO (CORRIGÉE : MODE FLEXIBLE & RETRYS)
      // -------------------------------------------------------------------
      if (applied_promo === 'BIBLIOMOISOFFERT' && stripeSubscriptionId) {
        try {
          // 1. Verrou Prisma avec gestion intelligente des Retrys Stripe
          try {
            await prisma.promoCodeUsage.create({
              data: { 
                userId: userIdInt, 
                promoCode: applied_promo,
                subscriptionId: stripeSubscriptionId 
              },
            });
          } catch (prismaError) {
            if (prismaError.code === 'P2002') {
              // Si le code est déjà en base, on vérifie rationnellement pourquoi
              const existingUsage = await prisma.promoCodeUsage.findUnique({
                where: { userId_promoCode: { userId: userIdInt, promoCode: applied_promo } }
              });
              
              // Si l'ID d'abonnement est différent, c'est un vrai double achat du client
              if (existingUsage && existingUsage.subscriptionId !== stripeSubscriptionId) {
                console.warn(`[ALERTE DOUBLE PAIEMENT] L'utilisateur ID ${userIdInt} a validé 2 fois.`);
                // On stoppe l'exécution ici en douceur (Statut 200) sans faire crasher Stripe
                return NextResponse.json({ received: true }, { status: 200 });
              }
              // Si l'ID d'abonnement est identique, c'est juste Stripe qui fait 
              // un "Retry" après une panne. On ne fait rien et on laisse le code continuer !
            } else {
              throw prismaError;
            }
          }

          // 2. Application de la gratuité (Syntaxe "discounts" pour le mode Flexible)
          await stripe.subscriptions.update(stripeSubscriptionId, {
            discounts: [{
              coupon: process.env.STRIPE_BOGO_COUPON_ID, 
            }],
          });

          console.log(`✅ Offre ${applied_promo} activée pour l'utilisateur ${userIdInt}`);

        } catch (error) {
          console.error(`Erreur critique webhook promo pour l'utilisateur ${userIdInt}:`, error);
          throw error; // On force Stripe à réessayer en cas de nouvelle panne
        }
      }
      // -------------------------------------------------------------------

    } catch (error) {
      console.error(" Erreur Webhook:", error);
      return NextResponse.json({ error: "Erreur traitement commande" }, { status: 500 });
    }
  }

  // --- SCÉNARIO C : Échec du paiement de la prolongation ---
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    
    const stripeSubId = 
      invoice.subscription || 
      invoice.parent?.subscription_details?.subscription ||
      invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription;

    console.log(` [Debug Échec] Facture impayée reçue. ID Abonnement : ${stripeSubId}`);

    if (stripeSubId) {
      const order = await prisma.orders.findFirst({
        where: { stripeSubscriptionId: stripeSubId },
        include: { 
          OrderProducts: { include: { Products: true } },
          Users: true 
        }
      });

      if (order) {
        const productsToRenew = order.OrderProducts.filter(p => 
          p.renewalIntention === 'PROLONGATION' || 
          p.renewalIntention === 'PROLONGATION_TACITE'
        );

        const toyNames = [];

        for (const product of productsToRenew) {
          await prisma.orderProducts.update({
            where: { OrderId_ProductId: { OrderId: product.OrderId, ProductId: product.ProductId } },
            data: { renewalIntention: 'PAIEMENT_ECHOUE' }
          });
          toyNames.push(product.Products.name);
        }
        
        console.log(` [Webhook] Échec de paiement enregistré pour ${productsToRenew.length} jouet(s)`);

        // 📧 ENVOI DE L'EMAIL D'ÉCHEC (Template ID: 14)
        if (toyNames.length > 0 && order.Users) {
          let prenom = "Client(e)";
          if (order.shippingName) {
            prenom = order.shippingName.split(' ')[0];
          } else if (order.Users.firstName) {
            prenom = order.Users.firstName;
          }
          
          if (prenom && prenom.trim() !== "") {
            prenom = prenom.trim();
            prenom = prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase();
          } else {
            prenom = "Client(e)";
          }

          const jouetsString = formatToyNames(toyNames);

          await sendBrevoEmail(order.Users.email, prenom, 14, {
            prenom: prenom,
            jouet: jouetsString,
            lienCompte: `${appUrl}/mon-compte`
          });
          console.log(`📧 [Brevo] Email d'action requise envoyé à ${order.Users.email}`);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}