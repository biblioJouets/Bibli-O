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

    const emailParams = {
      PRENOM: orderInfo.user.firstName || "Client",
      COMMANDE_ID: orderInfo.id,
      TOTAL: Number(orderInfo.totalAmount).toFixed(2), 
      DATE_DEBUT: new Date().toLocaleDateString('fr-FR'),
      LIVRAISON: orderInfo.shippingData?.mondialRelayPointId ? "Point Relais" : "Domicile",
      PRODUCTS: productsList 
    };

    await sendBrevoTemplate(orderInfo.user.email, 8, emailParams);
    console.log(`[BREVO] Email confirmation envoyé pour commande #${orderInfo.id}`);
  } catch (error) {
    console.error("[BREVO] Erreur sendOrderConfirmation:", error);
    // On ne throw pas l'erreur pour ne pas bloquer la commande si l'email plante
  }
};

// 👇 NOUVELLE FONCTION : Alerte Admin
export const notifyAdminNewOrder = async (orderInfo) => {
    try {
      // Tu peux créer un template Brevo "Alerte Admin" (ex: ID 10)
      // Ou réutiliser le template client (ID 8) en changeant juste l'email de destination pour tester
      const ADMIN_TEMPLATE_ID = 8; // Mets l'ID de ton choix
      const ADMIN_EMAIL = "contact@bibliojouets.com"; // Ton email admin
  
      const productsList = orderInfo.products.map(p => ({ NAME: p.name }));
  
      const emailParams = {
        PRENOM: "Admin", // Pour dire "Bonjour Admin"
        COMMANDE_ID: orderInfo.id,
        TOTAL: Number(orderInfo.totalAmount).toFixed(2),
        DATE_DEBUT: new Date().toLocaleDateString('fr-FR'),
        LIVRAISON: orderInfo.shippingData?.mondialRelayPointId ? `Relais (${orderInfo.shippingData.mondialRelayPointId})` : "Domicile",
        PRODUCTS: productsList
      };
  
      await sendBrevoTemplate(ADMIN_EMAIL, ADMIN_TEMPLATE_ID, emailParams);
      console.log(`👮 [BREVO] Alerte Admin envoyée à ${ADMIN_EMAIL}`);
    } catch (error) {
      console.error("[BREVO] Erreur notifyAdminNewOrder:", error);
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

export const createOrder = async (userId, cartData, totalAmount, shippingData) => {
  // 1. Création BDD
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
      shippingPhone: shippingData.shippingPhone,
      OrderProducts: {
        create: cartData.items.map(item => ({
          ProductId: item.productId,
          quantity: item.quantity // ✅ On n'oublie pas la quantité !
        }))
      }
    }
  });

  // 2. Décrémentation Stock
  for (const item of cartData.items) {
    await prisma.products.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } }
    });
  }

  // 3. Infos pour emails
  const user = await prisma.users.findUnique({ where: { id: userId } });
  const products = cartData.items.map(item => item.product);

  const orderInfoForMail = {
    id: newOrder.id,
    totalAmount: newOrder.totalAmount,
    user: { email: user.email, firstName: user.firstName },
    products: products,
    shippingData: shippingData // On passe les infos de livraison
  };

  // 4. Envois Emails (Client + Admin)
  await Promise.all([
    sendOrderConfirmation(orderInfoForMail), // Mail Client
    notifyAdminNewOrder(orderInfoForMail)    // 👇 Mail Admin
  ]);

  return newOrder;
};

// ... (Le reste getUserOrders ne change pas)
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