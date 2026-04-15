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

// ============================================================
//  4. ÉCHANGE (BOÎTE NAVETTE)
// ============================================================

// Grille tarifaire — prix en centimes pour Stripe
const PRICING_MAP = { 1: 2000, 2: 2500, 3: 3500, 4: 3800, 5: 4500, 6: 5100, 7: 5600, 8: 6000, 9: 6300 };

export const getPriceIdForToyCount = (count) => {
  const priceIds = {
    1: process.env.STRIPE_PRICE_1_TOY,
    2: process.env.STRIPE_PRICE_2_TOYS,
    3: process.env.STRIPE_PRICE_3_TOYS,
    4: process.env.STRIPE_PRICE_4_TOYS,
    5: process.env.STRIPE_PRICE_5_TOYS,
    6: process.env.STRIPE_PRICE_6_TOYS,
    7: process.env.STRIPE_PRICE_7_TOYS,
    8: process.env.STRIPE_PRICE_8_TOYS,
    9: process.env.STRIPE_PRICE_9_TOYS,
  };
  return priceIds[count] || null;
};

export const initiateExchange = async (orderId, userId, newCartItems, shippingOverride = null) => {
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // 1. Guard ownership
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      Users: true,
      OrderProducts: { include: { Products: true } },
    },
  });

  if (!order || order.userId !== parseInt(userId)) {
    const err = new Error("Action interdite");
    err.status = 403;
    throw err;
  }

  // 2. Guard statut
  if (order.status !== 'ACTIVE') {
    const err = new Error("L'échange n'est disponible que pour une location en cours.");
    err.status = 400;
    throw err;
  }

  // 3. Guard jeton mensuel
  if (order.hasExchangedThisMonth) {
    const err = new Error("Vous avez déjà effectué un échange ce mois-ci. Revenez le mois prochain !");
    err.status = 400;
    throw err;
  }

  // 3b. Guard retour en cours — bloquer si l'ancienne boîte n'a pas encore été réceptionnée
  const hasRetourDemande = order.OrderProducts.some(
    (op) => op.renewalIntention === 'RETOUR_DEMANDE'
  );
  if (hasRetourDemande) {
    const err = new Error("Un retour est déjà en cours pour cette commande. L'échange sera disponible une fois la boîte réceptionnée.");
    err.status = 400;
    throw err;
  }

  // 4. Guard panier — signaler si upgrade nécessaire
  const currentToyCount = order.OrderProducts.length;
  const newToyCount = newCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (newToyCount > currentToyCount) {
    const newPriceAmount = PRICING_MAP[newToyCount];
    return {
      requiresUpgrade: true,
      currentToyCount,
      newToyCount,
      newMonthlyPrice: newPriceAmount ? newPriceAmount / 100 : null,
    };
  }

  // 5. Décrémentation atomique du stock des nouveaux jouets
  const productIds = newCartItems.map((i) => i.productId);
  const products = await prisma.products.findMany({ where: { id: { in: productIds } } });

  let newExchangeOrder;

  await prisma.$transaction(async (tx) => {
    for (const item of newCartItems) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < (item.quantity || 1)) {
        throw new Error(`Stock insuffisant pour : ${product?.name || 'jouet inconnu'}`);
      }
      await tx.products.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity || 1 } },
      });
    }

    // 6. Marquer TOUS les produits de l'ancienne commande en RETOUR_DEMANDE
    //    (l'échange est total — toute la boîte repart)
    await tx.orderProducts.updateMany({
      where: { OrderId: orderId },
      data: { renewalIntention: 'RETOUR_DEMANDE' },
    });

    // 6b. Consommer le jeton + passer l'ancienne commande en RETURNING
    await tx.orders.update({
      where: { id: orderId },
      data: {
        hasExchangedThisMonth: true,
        status: 'RETURNING',
      },
    });

    // 7. Créer la commande EXCHANGE (boîte navette) liée au client
    // Calculer rentalEndDate = nextBillingDate de la commande source (premier produit)
    const sourceProduct = order.OrderProducts[0];
    const sourceRentalEnd = sourceProduct?.rentalEndDate ?? null;
    const sourceNextBilling = sourceProduct?.nextBillingDate ?? null;

    // Utiliser les infos de livraison fournies ou celles de la commande source
    const shipping = shippingOverride ?? {
      shippingName: order.shippingName,
      shippingAddress: order.shippingAddress,
      shippingZip: order.shippingZip,
      shippingCity: order.shippingCity,
      shippingPhone: order.shippingPhone,
      mondialRelayPointId: order.mondialRelayPointId,
    };

    newExchangeOrder = await tx.orders.create({
      data: {
        userId: order.userId,
        orderType: 'EXCHANGE',
        status: 'PREPARING',
        totalAmount: order.totalAmount, // Copie le montant de l'abonnement
        shippingName: shipping.shippingName,
        shippingAddress: shipping.shippingAddress,
        shippingZip: shipping.shippingZip,
        shippingCity: shipping.shippingCity,
        shippingPhone: shipping.shippingPhone,
        mondialRelayPointId: shipping.mondialRelayPointId ?? null,
        stripeSubscriptionId: order.stripeSubscriptionId,
        OrderProducts: {
          create: newCartItems.map((item) => ({
            ProductId: item.productId,
            quantity: item.quantity || 1,
            rentalEndDate: sourceRentalEnd,
            nextBillingDate: sourceNextBilling,
          })),
        },
      },
    });
  });

// 8. Emails Brevo
  const user = order.Users;
  
  // 8.1 Formatage des variables logistiques
  const jouets_retour = order.OrderProducts.map((op) => op.Products?.name).join(' / ') || 'Anciens jouets';
  const jouets_envoi = products.map((p) => p.name).join(' / ') || 'Nouveaux jouets';
  
  const client_nom = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const prenom = user?.firstName || "Client(e)";
  
  // Récupération de l'adresse (shippingOverride s'il existe, sinon l'adresse de la commande)
  const shipping = shippingOverride ?? order;
  const client_adresse = `${shipping.shippingName || client_nom}\n${shipping.shippingAddress || ''}\n${shipping.shippingZip || ''} ${shipping.shippingCity || ''}\nFrance`;
  
  // 8.2 Calcul de l'évolution de l'abonnement
  const previousCount = order.OrderProducts.length;
  const newCount = newCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const evolution_abo = newCount > previousCount
    ? `Votre formule a évolué pour accueillir ${newCount} jouet(s) !` 
    : `Vous conservez votre formule actuelle de ${previousCount} jouet(s).`;
  
  const abonnement = `Formule ${newCount} jouet(s)`;

  // 8.3 URLs
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bibliojouets.com';
  const lien_compte = `${appUrl}/mon-compte`;
  const lien_admin = `${appUrl}/admin/orders?type=EXCHANGE`;

  // 8.4 Envoi de l'Email Client
  if (user?.email) {
    await sendBrevoTemplate(
      user.email,
      17, // ID du template client
      { 
        prenom, 
        jouets_envoi, 
        jouets_retour, 
        evolution_abo, 
        lien_compte 
      }
    ).catch((err) => console.error("[BREVO] Erreur email échange client:", err));
  }

  // 8.5 Envoi de l'Email Admin
  const adminEmail = process.env.BREVO_SENDER_EMAIL || 'contact@bibliojouets.com';
  await sendBrevoTemplate(
    adminEmail,
    18, // ID du template admin
    {
      client_nom,
      client_email: user?.email || '',
      abonnement,
      client_adresse,
      jouets_envoi,
      jouets_retour,
      lien_admin,
    }
  ).catch((err) => console.error("[BREVO] Erreur email échange admin:", err));

  return { requiresUpgrade: false, success: true, exchangeOrderId: newExchangeOrder.id };
};

export const upgradeAndExchange = async (orderId, userId, newCartItems, newToyCount, shippingOverride = null) => {
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Guards identiques à initiateExchange (ownership + statut + jeton)
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: { Users: true, OrderProducts: { include: { Products: true } } },
  });

  if (!order || order.userId !== parseInt(userId)) {
    const err = new Error("Action interdite"); err.status = 403; throw err;
  }
  if (order.status !== 'ACTIVE') {
    const err = new Error("L'échange n'est disponible que pour une location en cours."); err.status = 400; throw err;
  }
  if (order.hasExchangedThisMonth) {
    const err = new Error("Vous avez déjà effectué un échange ce mois-ci."); err.status = 400; throw err;
  }
  const hasRetourDemandeUp = order.OrderProducts.some((op) => op.renewalIntention === 'RETOUR_DEMANDE');
  if (hasRetourDemandeUp) {
    const err = new Error("Un retour est déjà en cours pour cette commande."); err.status = 400; throw err;
  }

  // Upgrade Stripe
  if (order.stripeSubscriptionId) {
    const newPriceId = getPriceIdForToyCount(newToyCount);
    if (!newPriceId) {
      const err = new Error("Formule indisponible pour ce nombre de jouets."); err.status = 400; throw err;
    }
    const subscription = await stripe.subscriptions.retrieve(order.stripeSubscriptionId);
    const currentItemId = subscription.items.data[0]?.id;
    await stripe.subscriptions.update(order.stripeSubscriptionId, {
      items: [{ id: currentItemId, price: newPriceId }],
      proration_behavior: 'create_prorations',
    });
  }

  // Réutilise la même logique d'échange standard (stock + jeton + email)
  return initiateExchange(orderId, userId, newCartItems, shippingOverride);
};

// ============================================================
//  5. ADOPTION D'UN JOUET (Paiement One-Shot)
// ============================================================
export const createAdoptionSession = async (orderId, productId, userId) => {
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // 1. Guard ownership & récupération
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      Users: true,
      OrderProducts: {
        where: { ProductId: productId },
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
  if (order.status !== 'ACTIVE') {
    const err = new Error("L'adoption n'est disponible que pour une location en cours.");
    err.status = 400;
    throw err;
  }

  // 3. Guard — le jouet appartient bien à cette commande
  const orderProduct = order.OrderProducts[0];
  if (!orderProduct) {
    const err = new Error("Jouet introuvable dans cette commande.");
    err.status = 404;
    throw err;
  }

  // 4. Guard — pas déjà adopté
  if (orderProduct.renewalIntention === 'ADOPTE') {
    const err = new Error("Ce jouet est déjà en cours d'adoption.");
    err.status = 400;
    throw err;
  }

  const product = orderProduct.Products;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bibliojouets.com';

  // 5. Création de la session Stripe Checkout (mode 'payment' = one-shot)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: order.Users?.email,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Adoption — ${product.name}`,
            description: `Achat définitif du jouet que vous avez en location.`,
            images: product.images?.length
              ? [`${appUrl}${product.images[0]}`]
              : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: 'adoption',
      orderId: String(orderId),
      productId: String(productId),
      userId: String(userId),
    },
    success_url: `${appUrl}/confirmation-commande?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/mon-compte`,
  });

  return { url: session.url };
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