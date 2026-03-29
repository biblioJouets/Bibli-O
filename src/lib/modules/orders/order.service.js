/* src/lib/modules/orders/order.service.js */
import prisma from '@/lib/core/database';
import { sendBrevoTemplate } from '@/lib/core/brevo/client';

// ============================================================
//  1. FONCTIONS D'ENVOI D'EMAIL
// ============================================================

export const sendOrderConfirmation = async (orderInfo) => {
  try {
    const productsList = orderInfo.products.map(product => ({
      NAME: product.name
    }));

    // --- 1. GÉNÉRATION DU NUMÉRO DE COMMANDE PERSONNALISÉ (CMD + Date + Heure) ---
    // Format : CMDjjmmaahhmm (ex: CMD1101261722)
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2); // On garde juste 26 pour 2026
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // On ajoute l'ID à la fin pour garantir l'unicité si 2 commandes tombent à la même minute
    const customOrderId = `CMD${day}${month}${year}${hours}${minutes}-${orderInfo.id}`;

    // --- 2. LOGIQUE DE LIVRAISON CORRIGÉE ---
    // Si l'ID est "DOMICILE" ou null, c'est Domicile. Sinon c'est un vrai Point Relais.
    const isRelay = orderInfo.shippingData?.mondialRelayPointId && 
                    orderInfo.shippingData.mondialRelayPointId !== "DOMICILE" && 
                    orderInfo.shippingData.mondialRelayPointId !== "null";

    const modeLivraison = isRelay ? "Point Relais" : "Domicile";
    
    // Construction de l'adresse complète pour l'affichage
    const adresseComplete = isRelay 
        ? `${orderInfo.shippingData.mondialRelayPointId} - ${orderInfo.shippingData.shippingAddress}, ${orderInfo.shippingData.shippingZip} ${orderInfo.shippingData.shippingCity}`
        : `${orderInfo.shippingData.shippingAddress}, ${orderInfo.shippingData.shippingZip} ${orderInfo.shippingData.shippingCity}`;

    const emailParams = {
      PRENOM: orderInfo.user.firstName || "Client",
      COMMANDE_ID: customOrderId, // On envoie le nouveau format ici
      TOTAL: Number(orderInfo.totalAmount).toFixed(2), 
      DATE_DEBUT: new Date().toLocaleDateString('fr-FR'),
      LIVRAISON_MODE: modeLivraison, // Nouveau paramètre : Le Titre (Domicile ou Relais)
      LIVRAISON_ADRESSE: adresseComplete, // Nouveau paramètre : L'adresse complète
      products: productsList // Note: Brevo attend souvent "products" ou "PRODUCTS" selon ta boucle
    };

    emailParams.PRODUCTS = productsList;

    await sendBrevoTemplate(orderInfo.user.email, 8, emailParams);
  } catch (error) {
  }
};

//   FONCTION : Alerte Admin
export const notifyAdminNewOrder = async (orderInfo) => {
    try {
      const ADMIN_TEMPLATE_ID = 8; 
      const ADMIN_EMAIL = "contact@bibliojouets.com"; 
  
      const productsList = orderInfo.products.map(p => ({ NAME: p.name }));
      
      const isRelay = orderInfo.shippingData?.mondialRelayPointId && orderInfo.shippingData.mondialRelayPointId !== "DOMICILE";
      const modeLivraison = isRelay ? "Point Relais" : "Domicile";

      const emailParams = {
        PRENOM: "Admin", 
        COMMANDE_ID: orderInfo.id.toString(), // Pour l'admin on garde l'ID technique simple c'est souvent mieux
        TOTAL: Number(orderInfo.totalAmount).toFixed(2),
        DATE_DEBUT: new Date().toLocaleDateString('fr-FR'),
        LIVRAISON_MODE: modeLivraison,
        LIVRAISON_ADRESSE: `${orderInfo.shippingData.shippingAddress}, ${orderInfo.shippingData.shippingCity}`,
        PRODUCTS: productsList
      };
  
      await sendBrevoTemplate(ADMIN_EMAIL, ADMIN_TEMPLATE_ID, emailParams);
    } catch (error) {
    }
  };

export const sendReturnLabel = async (orderInfo) => {
  try {
    const TEMPLATE_ID_RETOUR = 8;
    const emailParams = {
      PRENOM: orderInfo.user.firstName || "Client",
      COMMANDE_ID: orderInfo.id,
    };
    await sendBrevoTemplate(orderInfo.user.email, TEMPLATE_ID_RETOUR, emailParams, orderInfo.returnLabelUrl);
    console.log(`[BREVO] Email étiquette retour envoyé pour commande #${orderInfo.id}`);
  } catch (error) {
    console.error("[BREVO] Erreur sendReturnLabel:", error);
    throw error;
  }
};

// ============================================================
//  2. LOGIQUE COMMANDE (Service)
// ============================================================
export const createOrder = async (userId, cartData, totalAmount, shippingData, stripeSubscriptionId) => {
  
  const result = await prisma.$transaction(async (tx) => {
    
    // 1. Vérification ultime du stock AVANT de valider
    for (const item of cartData.items) {
      const product = await tx.products.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour le produit : ${product?.name || 'Inconnu'}`);
      }
    }

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(nextMonth.getDate() + 30);

    // 2. Création de la commande
    const newOrder = await tx.orders.create({
      data: {
        userId: userId,
        totalAmount: totalAmount,
        status: 'PREPARING',
        mondialRelayPointId: shippingData.mondialRelayPointId,
        shippingName: shippingData.shippingName,
        shippingAddress: shippingData.shippingAddress,
        shippingZip: shippingData.shippingZip,
        shippingCity: shippingData.shippingCity,
        shippingPhone: shippingData.shippingPhone,
        stripeSubscriptionId: stripeSubscriptionId,
        OrderProducts: {
          create: cartData.items.map(item => ({
            ProductId: item.productId,
            quantity: item.quantity,
            nextBillingDate: nextMonth, 
            rentalEndDate: nextMonth
          }))
        }
      }
    });

    // 3. Décrémentation Stock
    for (const item of cartData.items) {
      await tx.products.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    // 4. On récupère l'user AVEC 'tx' pour être cohérent dans la transaction
    const user = await tx.users.findUnique({ where: { id: userId } });

    // On retourne ce dont on a besoin pour la suite (hors transaction)
    return { newOrder, user };
  });

try {
    const { newOrder, user } = result;
    const products = cartData.items.map(item => item.product);

    const orderInfoForMail = {
      id: newOrder.id,
      totalAmount: newOrder.totalAmount,
      user: { email: user.email, firstName: user.firstName },
      products: products,
      shippingData: shippingData 
    };

    // On ne bloque pas le retour de la fonction si l'email échoue
    await Promise.all([
      sendOrderConfirmation(orderInfoForMail), 
      notifyAdminNewOrder(orderInfoForMail)    
    ]);
  } catch (emailError) {
    // On loggue l'erreur mais on ne throw pas pour ne pas faire croire au Webhook que c'est un échec
    console.error("⚠️ La commande est créée mais l'email a échoué :", emailError);
  }

  return result.newOrder;
};



// ============================================================
//  3. RETOUR D'UN JOUET
// ============================================================
export const processReturn = async (orderId, productId, userId) => {
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // 1. Guard ownership & récupération
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      Users: true,
      OrderProducts: {
        include: { Products: true },
      },
    },
  });

  if (!order || order.userId !== parseInt(userId)) {
    const err = new Error("Action interdite");
    err.status = 403;
    throw err;
  }

  // 2. Guard statut
  if (!['ACTIVE', 'SHIPPED'].includes(order.status)) {
    const err = new Error("Cette commande ne peut pas être retournée.");
    err.status = 400;
    throw err;
  }

  // 3. Guard — le jouet appartient bien à cette commande
  const orderProduct = order.OrderProducts.find((op) => op.ProductId === productId);
  if (!orderProduct) {
    const err = new Error("Jouet introuvable dans cette commande.");
    err.status = 404;
    throw err;
  }

  // 4. Stripe — cancel_at_period_end sur l'abonnement si présent
  if (order.stripeSubscriptionId) {
    await stripe.subscriptions.update(order.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  // 5. DB — mettre à jour uniquement ce jouet
  await prisma.orderProducts.update({
    where: { OrderId_ProductId: { OrderId: orderId, ProductId: productId } },
    data: { renewalIntention: 'RETOUR_DEMANDE', nextBillingDate: null },
  });

  // 6. DB — passer la commande en RETURNING
  const updatedOrder = await prisma.orders.update({
    where: { id: orderId },
    data: { status: 'RETURNING' },
  });

  // 7. Email Brevo
  const user = order.Users;
  if (user?.email) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const customOrderId = `CMD${pad(now.getDate())}${pad(now.getMonth() + 1)}${String(now.getFullYear()).slice(-2)}${pad(now.getHours())}${pad(now.getMinutes())}-${orderId}`;
    const listeJouets = order.OrderProducts.map((op) => op.Products.name).join(' / ');
    const lienCompte = `${process.env.NEXT_PUBLIC_APP_URL || 'https://bibliojouets.com'}/mon-compte`;

    await sendBrevoTemplate(
      user.email,
      16,
      { prenom: user.firstName || "Client(e)", orderId: customOrderId, jouets: listeJouets, lienCompte },
      updatedOrder.returnLabelUrl || undefined
    ).catch((err) => console.error("[BREVO] Erreur email retour:", err));
  }

  return { returnLabelUrl: updatedOrder.returnLabelUrl || null };
};

export const getUserOrders = async (userId) => {
    try {
      return await prisma.orders.findMany({
        where: { userId: parseInt(userId) },
        include: {
          OrderProducts: {
            include: { Products: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error("Erreur getUserOrders:", error);
      throw error;
    }
  };