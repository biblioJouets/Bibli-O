import prisma from '@/lib/core/database';
import { sendBrevoTemplate } from '@/lib/core/brevo/client';

// ============================================================
//  1. FONCTIONS D'ENVOI D'EMAIL (Exportées pour les tests)
// ============================================================

/**
 * Envoie l'email de confirmation de commande
 * @param {object} orderInfo - Objet contenant { id, totalAmount, user: { email, firstName }, products: [] }
 */
export const sendOrderConfirmation = async (orderInfo) => {
  try {
    // 1. On prépare la liste SIMPLE (Juste les noms)
    const productsList = orderInfo.products.map(product => ({
      NAME: product.name
      // On retire PRICE ici, inutile
    }));

    const emailParams = {
      PRENOM: orderInfo.user.firstName || "Client",
      COMMANDE_ID: orderInfo.id,
      // Le total est bien le montant de l'abonnement (ex: 39.99) passé lors de la création
      TOTAL: Number(orderInfo.totalAmount).toFixed(2), 
      DATE_DEBUT: new Date().toLocaleDateString('fr-FR'),
      LIVRAISON: "Point Relais",
      PRODUCTS: productsList 
    };

    await sendBrevoTemplate(orderInfo.user.email, 8, emailParams);
    console.log(`[BREVO] Email confirmation envoyé pour commande #${orderInfo.id}`);
  } catch (error) {
    console.error("[BREVO] Erreur sendOrderConfirmation:", error);
    throw error;
  }
};
/**
 * Envoie l'étiquette de retour
 * @param {object} orderInfo - Objet contenant { id, user: { email, firstName }, returnLabelUrl }
 */
export const sendReturnLabel = async (orderInfo) => {
  try {
    // ID 9 = Ton Template "Étiquette Retour" (Si tu ne l'as pas encore créé, mets 8 pour tester)
    const TEMPLATE_ID_RETOUR = 8; // <--- Mets l'ID de ton template retour ici

    const emailParams = {
      PRENOM: orderInfo.user.firstName || "Client",
      COMMANDE_ID: orderInfo.id,
    };

    // Le 4ème argument est l'URL de la pièce jointe (PDF)
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

/**
 * Création d'une commande à partir d'un panier
 */
export const createOrder = async (userId, cartData, totalAmount, shippingData) => {
  // 1. Création de la commande en BDD
  const newOrder = await prisma.orders.create({
    data: {
      userId: userId,
      totalAmount: totalAmount,
      status: 'PENDING',
      mondialRelayPointId: shippingData.mondialRelayPointId,
      shippingName: shippingData.shippingName,
      shippingAddress: shippingData.shippingAddress,
      shippingZip: shippingData.shippingZip,
      shippingCity: shippingData.shippingCity,
      OrderProducts: {
        create: cartData.items.map(item => ({
          ProductId: item.productId
        }))
      }
    }
  });

  // 2. MISE À JOUR DES STOCKS (Nouveau !) 📉
  // On parcourt chaque article du panier pour décrémenter son stock
  for (const item of cartData.items) {
    await prisma.products.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity // On enlève la quantité commandée (généralement 1)
        }
      }
    });
  }

  // 3. Récupération User pour l'email
  const user = await prisma.users.findUnique({
    where: { id: userId }
  });

  // 4. Envoi Email (via Brevo)
  try {
    await sendOrderConfirmation({
      id: newOrder.id,
      totalAmount: newOrder.totalAmount,
      user: { email: user.email, firstName: user.firstName },
      products: cartData.items.map(item => item.product)
    });
  } catch (emailError) {
    console.error("[BREVO] Echec envoi mail auto après commande (pas grave, la commande est créée).");
  }

  return newOrder;
};

/**
 * Récupération historique
 */
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