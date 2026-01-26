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
    console.log(`[BREVO] Email confirmation envoyé pour commande ${customOrderId}`);
  } catch (error) {
    console.error("[BREVO] Erreur sendOrderConfirmation:", error);
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
      console.log(`👮 [BREVO] Alerte Admin envoyée à ${ADMIN_EMAIL}`);
    } catch (error) {
      console.error("[BREVO] Erreur notifyAdminNewOrder:", error);
    }
  };

export const sendReturnLabel = async (orderInfo) => {
  try {
    const TEMPLATE_ID_RETOUR = 8; // À changer par le bon ID de template retour
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
  
  // ÉTAPE 1 : TRANSACTION BDD (Rapide et Atomique)
  // On récupère le résultat de la transaction dans une variable
  const result = await prisma.$transaction(async (tx) => {
    
    // 1. Vérification ultime du stock AVANT de valider
    for (const item of cartData.items) {
      const product = await tx.products.findUnique({ where: { id: item.productId } });
      
      // Sécurité : On vérifie si le produit existe et s'il y a du stock
      if (!product || product.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour le produit : ${product?.name || 'Inconnu'}`);
      }
    }

    // 2. Création de la commande
    // Note : On utilise 'tx' partout ici, pas 'prisma'
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
        OrderProducts: {
          create: cartData.items.map(item => ({
            ProductId: item.productId,
            quantity: item.quantity 
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