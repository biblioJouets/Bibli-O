/* src/app/api/webhooks/stripe/route.js */
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
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
        where: {
          stripeSubscriptionId: stripeSubId,
          status: { in: ['ACTIVE', 'PREPARING', 'SHIPPED'] },
        },
        include: {
          OrderProducts: { include: { Products: true } },
          Users: true,
        },
      });

      if (order) {
        // --- NOUVEAU BLOC : SYNCHRONISATION DE LA CAGNOTTE VIA LES COUPONS ---
        // On vérifie si une réduction (notre coupon) a été appliquée sur cette facture
        const discountAmount = invoice.total_discount_amounts?.reduce((sum, discount) => sum + discount.amount, 0) || 0;
        
        if (discountAmount > 0 && order.userId) {
           try {
             await prisma.users.update({
               where: { id: order.userId },
               // On décrémente Prisma de la somme que le coupon a fait économiser
               data: { giftCredit: { decrement: discountAmount } }
             });
             console.log(`[Webhook] Prisma synchronisé : ${discountAmount / 100}€ déduits de la cagnotte suite au renouvellement.`);
           } catch (dbErr) {
             console.error("[Webhook] Erreur de synchro cagnotte Prisma:", dbErr);
           }
        }
        
        const productsToRenew = order.OrderProducts.filter(p =>
          p.renewalIntention === 'PROLONGATION' ||
          p.renewalIntention === 'PROLONGATION_TACITE' ||
          p.renewalIntention === 'PAIEMENT_ECHOUE' ||
          p.renewalIntention === null
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

        if (invoice.hosted_invoice_url) {
          await prisma.orders.update({
            where: { id: order.id },
            data: { stripeInvoiceUrl: invoice.hosted_invoice_url },
          });
        }

        if (invoice.id && order.userId) {
          const lineItem  = invoice.lines?.data?.[0];
          const periodStart = lineItem?.period?.start  ?? invoice.period_start  ?? null;
          const periodEnd   = lineItem?.period?.end    ?? invoice.period_end    ?? null;

          await prisma.stripeInvoice.upsert({
            where:  { stripeInvoiceId: invoice.id },
            update: {
              status:           invoice.status ?? 'paid',
              hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
              invoicePdf:       invoice.invoice_pdf        ?? null,
            },
            create: {
              stripeInvoiceId:  invoice.id,
              stripeSubId,
              userId:           order.userId,
              amountPaid:       invoice.amount_paid  ?? invoice.amount_due ?? 0,
              currency:         invoice.currency     ?? 'eur',
              status:           invoice.status       ?? 'paid',
              invoiceNumber:    invoice.number       ?? null,
              hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
              invoicePdf:       invoice.invoice_pdf        ?? null,
              periodStart:      periodStart ? new Date(periodStart * 1000) : null,
              periodEnd:        periodEnd   ? new Date(periodEnd   * 1000) : null,
            },
          });
        }

        revalidatePath('/mon-compte/facturation');
        console.log(` [Webhook] Abonnement prolongé pour ${productsToRenew.length} jouet(s)`);

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

          await sendBrevoEmail(order.Users.email, prenom, 24, {
            prenom,
            jouet: jouetsString,
            nouvelleDate: dateFormatted,
            lienFacture: lienFactureStripe,
          });
          console.log(` [Brevo] Email de confirmation envoyé à ${order.Users.email}`);
        }
      }
    }
  }

  // --- SCÉNARIO B : checkout.session.completed (adoption OU nouvelle commande) ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log(" Webhook reçu pour session:", session.id);

    // --- B1 : ADOPTION D'UN JOUET ---
    if (session.metadata?.type === 'adoption') {
      const { orderId, productId, userId } = session.metadata;
      console.log(`[Webhook] Adoption détectée — orderId:${orderId} productId:${productId}`);

      try {
        const existingOrderProduct = await prisma.orderProducts.findUnique({
          where: {
            OrderId_ProductId: {
              OrderId: parseInt(orderId),
              ProductId: parseInt(productId),
            },
          },
        });

        if (existingOrderProduct?.renewalIntention === 'ADOPTE') {
          console.log(`[Webhook] Adoption déjà traitée pour jouet #${productId} — idempotence OK`);
          return NextResponse.json({ received: true, note: 'Already adopted' });
        }
      
        const sourceOrder = await prisma.orders.findUnique({
          where: { id: parseInt(orderId) },
          include: { Users: true },
        });

        await prisma.$transaction(async (tx) => {
          await tx.orderProducts.update({
            where: {
              OrderId_ProductId: {
                OrderId: parseInt(orderId),
                ProductId: parseInt(productId),
              },
            },
            data: { renewalIntention: 'ADOPTE' },
          });

          await tx.products.update({
            where: { id: parseInt(productId) },
            data: { stock: { decrement: 1 } },
          });

          await tx.orders.create({
            data: {
              userId: parseInt(userId),
              orderType: 'ADOPTION',
              status: 'COMPLETED',
              totalAmount: session.amount_total / 100,
              shippingName: sourceOrder?.shippingName ?? null,
              shippingAddress: sourceOrder?.shippingAddress ?? null,
              shippingZip: sourceOrder?.shippingZip ?? null,
              shippingCity: sourceOrder?.shippingCity ?? null,
              shippingPhone: sourceOrder?.shippingPhone ?? null,
              mondialRelayPointId: sourceOrder?.mondialRelayPointId ?? null,
              OrderProducts: {
                create: {
                  ProductId: parseInt(productId),
                  quantity: 1,
                },
              },
            },
          });
        });

        console.log(`[Webhook] Adoption finalisée en BDD pour jouet #${productId} + commande ADOPTION créée`);

        const order = await prisma.orders.findUnique({
          where: { id: parseInt(orderId) },
          include: {
            Users: true,
            OrderProducts: { where: { ProductId: parseInt(productId) }, include: { Products: true } },
          },
        });

        if (order?.Users) {
          const user = order.Users;
          const product = order.OrderProducts[0]?.Products;
          const jouet = product?.name || 'votre jouet';
          let prenom = (user.firstName || 'Client(e)').trim();
          prenom = prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase();

          await sendBrevoEmail(user.email, prenom, 20, {
            prenom,
            jouet,
            lienCompte: `${appUrl}/mon-compte`,
          });
          console.log(`[Brevo] Email adoption client envoyé à ${user.email}`);

          await sendBrevoEmail('contact@bibliojouets.com', 'Admin', 21, {
            client_nom: `${user.firstName} ${user.lastName || ''}`.trim(),
            client_email: user.email,
            jouet_nom: product?.name || 'Jouet inconnu',
            jouet_id: productId,
            prix_adoption: (session.amount_total / 100).toFixed(2),
            order_id: orderId,
            lien_admin: `${process.env.NEXT_PUBLIC_APP_URL}/admin/orders`
          });
          console.log(`[Brevo] Email adoption admin envoyé`);
        }
      } catch (err) {
        console.error('[Webhook] Erreur traitement adoption:', err);
        return NextResponse.json({ error: 'Erreur traitement adoption' }, { status: 500 });
      }

      return NextResponse.json({ received: true });
    }

    // --- B2 : NOUVELLE COMMANDE ---
    const {
      userId, cartId, cartSnapshot, shippingName, shippingAddress,
      shippingCity, shippingZip, mondialRelayPointId, shippingPhone,
      applied_promo,
      isBoxMystere, childAge, childGender,
      creditUsed, couponId
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
        return { productId: snapItem.id, quantity: snapItem.q, intent: snapItem.intent, product: productInfo };
      }).filter(item => item !== null);

      if (virtualCartItems.length === 0) throw new Error("Panier vide après vérification BDD");

      const virtualCartData = { items: virtualCartItems };
      const totalAmount = session.amount_total / 100;
      const stripeSubscriptionId = session.subscription;
      
      const shippingData = {
        shippingName, shippingAddress, shippingZip, shippingCity, shippingPhone,
        mondialRelayPointId: mondialRelayPointId && mondialRelayPointId !== "null" ? mondialRelayPointId : null
      };
      
      if (stripeSubscriptionId) {
        const existing = await prisma.orders.findFirst({
          where: { stripeSubscriptionId },
        });
        if (existing) {
          console.log(`[Webhook] Commande déjà existante pour subscription ${stripeSubscriptionId} — événement ignoré (idempotence)`);
          return NextResponse.json({ received: true, note: 'Already processed' });
        }
      }

      console.log(" Création de la commande...");
      const newOrder = await createOrder(userIdInt, virtualCartData, totalAmount, shippingData, stripeSubscriptionId);
      console.log(" Commande créée ! ID:", newOrder.id);

      if (session.customer) {
        await prisma.users.update({
          where: { id: userIdInt },
          data: { stripeCustomerId: session.customer }
        });
        console.log(`[Webhook] ID Stripe ${session.customer} rattaché au client ${userIdInt}`);
      }
      
      // --- LOGIQUE NETTOYAGE CARTE CADEAU ---
      const usedAmount = parseInt(creditUsed || '0', 10);

      if (userIdInt && usedAmount > 0) {
        try {
          await prisma.users.update({
            where: { id: userIdInt },
            data: {
              giftCredit: {
                decrement: usedAmount
              }
            }
          });
          console.log(`[Webhook] Cagnotte déduite de ${usedAmount} centimes pour l'utilisateur ${userIdInt}`);
        } catch (dbError) {
          console.error(`[Webhook] Erreur de déduction de crédit pour User ${userIdInt}:`, dbError);
        }

        if (couponId) {
          try {
            await stripe.coupons.del(couponId);
            console.log(`[Webhook] Coupon éphémère ${couponId} supprimé avec succès.`);
          } catch (couponErr) {
            console.error(`[Webhook] Impossible de supprimer le coupon ${couponId}:`, couponErr);
          }
        }
      }

      if (isBoxMystere === "true") {
        await prisma.orders.update({
          where: { id: newOrder.id },
          data: {
            childAge: childAge || "non renseigné",
            childGender: childGender || "non renseigné",
          },
        });
        console.log(`[Box Mystère] childAge=${childAge} childGender=${childGender} sauvegardé sur commande #${newOrder.id}`);
      }
      
      if (cartIdInt) {
        console.log(" Suppression du panier ID:", cartIdInt);
        await prisma.cartItem.deleteMany({ where: { cartId: cartIdInt } });
      } else {
        console.error(" Pas de cartId reçu, IMPOSSIBLE DE VIDER LE PANIER.");
      }

      if (applied_promo === 'BIBLIOMOISOFFERT' && stripeSubscriptionId) {
        try {
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
              const existingUsage = await prisma.promoCodeUsage.findUnique({
                where: { userId_promoCode: { userId: userIdInt, promoCode: applied_promo } }
              });
              
              if (existingUsage && existingUsage.subscriptionId !== stripeSubscriptionId) {
                console.warn(`[ALERTE DOUBLE PAIEMENT] L'utilisateur ID ${userIdInt} a validé 2 fois.`);
                return NextResponse.json({ received: true }, { status: 200 });
              }
            } else {
              throw prismaError;
            }
          }

          await stripe.subscriptions.update(stripeSubscriptionId, {
            discounts: [{
              coupon: process.env.STRIPE_BOGO_COUPON_ID, 
            }],
          });

          console.log(`✅ Offre ${applied_promo} activée pour l'utilisateur ${userIdInt}`);

        } catch (error) {
          console.error(`Erreur critique webhook promo pour l'utilisateur ${userIdInt}:`, error);
          throw error; 
        }
      }

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
        where: { stripeSubscriptionId: stripeSubId, status: 'ACTIVE' },
        include: {
          OrderProducts: { include: { Products: true } },
          Users: true,
        },
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

  // --- SCÉNARIO D : Abonnement mis à jour (résiliation / pause) ---
  if (event.type === 'customer.subscription.updated') {
    const sub      = event.data.object;
    const prevAttr = event.data.previous_attributes ?? {};

    const order = await prisma.orders.findFirst({
      where: { stripeSubscriptionId: sub.id, status: 'ACTIVE' },
      include: { Users: true },
    });

    if (order?.Users) {
      const user   = order.Users;
      let prenom   = (user.firstName || 'Client(e)').trim();
      prenom = prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase();
      const lienCompte = `${appUrl}/mon-compte`;

      if (!prevAttr.cancel_at_period_end && sub.cancel_at_period_end === true) {
        const item0 = sub.items?.data?.[0];
        const endTs = sub.current_period_end ?? item0?.current_period_end ?? null;
        const endDate = endTs ? new Date(endTs * 1000).toLocaleDateString('fr-FR') : '—';

        await sendBrevoEmail(user.email, prenom, 31, {
          prenom,
          date_fin: endDate,
          lienCompte,
        });
        console.log(`[Brevo] Email résiliation (template 31) envoyé à ${user.email}`);
      }

      if (!prevAttr.pause_collection && sub.pause_collection?.behavior === 'keep_as_draft') {
        await sendBrevoEmail(user.email, prenom, 32, {
          prenom,
          lienCompte,
        });
        console.log(`[Brevo] Email pause (template 32) envoyé à ${user.email}`);
      }
    }
  }

  // --- SCÉNARIO E : Échec de paiement d'abonnement (alerte renforcée) ---
  if (event.type === 'invoice.payment_failed') {
    const invoice    = event.data.object;
    const stripeSubId =
      invoice.subscription ||
      invoice.parent?.subscription_details?.subscription ||
      invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription;

    if (stripeSubId) {
      const order = await prisma.orders.findFirst({
        where: { stripeSubscriptionId: stripeSubId, status: 'ACTIVE' },
        include: { Users: true },
      });

      if (order?.Users) {
        const user   = order.Users;
        let prenom   = (user.firstName || 'Client(e)').trim();
        prenom = prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase();

        await sendBrevoEmail(user.email, prenom, 30, {
          prenom,
          montant: ((invoice.amount_due ?? 0) / 100).toFixed(2),
          lienPortail: `${appUrl}/api/stripe/create-portal-session?subscriptionId=${stripeSubId}`,
          lienCompte:  `${appUrl}/mon-compte/facturation`,
        });
        console.log(`[Brevo] Email alerte paiement échoué (template 30) envoyé à ${user.email}`);
      }
    }
  }
  return NextResponse.json({ received: true });  
}