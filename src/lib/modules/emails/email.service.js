/* src/lib/modules/emails/email.service.js */
import { sendBrevoTemplate } from '@/lib/core/brevo/client';
import { getSuggestedPlan } from '@/lib/core/utils/subscription';

// ============================================================
//  FONCTIONS D'ENVOI D'EMAIL — COMMANDES
// ============================================================

const sendOrderConfirmation = async (orderInfo) => {
  try {
    // --- 1. SÉPARATION DES ARTICLES (LOCATION VS ACHAT) ---
    const rentalProducts = orderInfo.products
      .filter(p => p.intent !== 'PURCHASE')
      .map(p => ({ NAME: p.name }));

    const purchasedProducts = orderInfo.products
      .filter(p => p.intent === 'PURCHASE')
      .map(p => ({
        NAME: p.name,
        PRICE: Number(p.biblioPrice || p.price).toFixed(2)
      }));

    // --- 2. CALCUL DU FORFAIT MENSUEL ---
    // On calcule le prix récurrent uniquement s'il y a des jouets loués
    const subPrice = rentalProducts.length > 0 ? getSuggestedPlan(rentalProducts.length).priceNumber : null;

    // --- 3. GÉNÉRATION DU NUMÉRO DE COMMANDE PERSONNALISÉ ---
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const customOrderId = `CMD${day}${month}${year}${hours}${minutes}-${orderInfo.id}`;

    // --- 4. LOGIQUE DE LIVRAISON ---
    const isRelay = orderInfo.shippingData?.mondialRelayPointId &&
                    orderInfo.shippingData.mondialRelayPointId !== "DOMICILE" &&
                    orderInfo.shippingData.mondialRelayPointId !== "null";

    const modeLivraison = isRelay ? "Point Relais" : "Domicile";

    const adresseComplete = isRelay
        ? `${orderInfo.shippingData.mondialRelayPointId} - ${orderInfo.shippingData.shippingAddress}, ${orderInfo.shippingData.shippingZip} ${orderInfo.shippingData.shippingCity}`
        : `${orderInfo.shippingData.shippingAddress}, ${orderInfo.shippingData.shippingZip} ${orderInfo.shippingData.shippingCity}`;

    // --- 5. PRÉPARATION DU PAYLOAD BREVO ---
    const emailParams = {
      PRENOM: orderInfo.user.firstName || "Client",
      COMMANDE_ID: customOrderId,

      // Nouvelles variables pour le template hybride
      RENTAL_PRODUCTS: rentalProducts.length > 0 ? rentalProducts : null,
      PURCHASED_PRODUCTS: purchasedProducts.length > 0 ? purchasedProducts : null,
      TOTAL_TODAY: Number(orderInfo.totalAmount).toFixed(2),
      SUB_PRICE: subPrice ? Number(subPrice).toFixed(2) : null,

      DATE_DEBUT: new Date().toLocaleDateString('fr-FR'),
      LIVRAISON_MODE: modeLivraison,
      LIVRAISON_ADRESSE: adresseComplete,
    };

    await sendBrevoTemplate(orderInfo.user.email, 8, emailParams);
  } catch (error) {
    console.error("[BREVO] Erreur sendOrderConfirmation:", error);
  }
};

//   FONCTION : Alerte Admin
const notifyAdminNewOrder = async (orderInfo) => {
    try {
      const ADMIN_TEMPLATE_ID = 8;
      const ADMIN_EMAIL = "contact@bibliojouets.com";

      // Même logique de séparation pour l'Admin
      const rentalProducts = orderInfo.products
        .filter(p => p.intent !== 'PURCHASE')
        .map(p => ({ NAME: p.name }));

      const purchasedProducts = orderInfo.products
        .filter(p => p.intent === 'PURCHASE')
        .map(p => ({
          NAME: p.name,
          PRICE: Number(p.biblioPrice || p.price).toFixed(2)
        }));

      const subPrice = rentalProducts.length > 0 ? getSuggestedPlan(rentalProducts.length).priceNumber : null;

      const isRelay = orderInfo.shippingData?.mondialRelayPointId && orderInfo.shippingData.mondialRelayPointId !== "DOMICILE";
      const modeLivraison = isRelay ? "Point Relais" : "Domicile";

      const emailParams = {
        PRENOM: "Admin",
        COMMANDE_ID: orderInfo.id.toString(),

        RENTAL_PRODUCTS: rentalProducts.length > 0 ? rentalProducts : null,
        PURCHASED_PRODUCTS: purchasedProducts.length > 0 ? purchasedProducts : null,
        TOTAL_TODAY: Number(orderInfo.totalAmount).toFixed(2),
        SUB_PRICE: subPrice ? Number(subPrice).toFixed(2) : null,

        DATE_DEBUT: new Date().toLocaleDateString('fr-FR'),
        LIVRAISON_MODE: modeLivraison,
        LIVRAISON_ADRESSE: `${orderInfo.shippingData.shippingAddress}, ${orderInfo.shippingData.shippingCity}`
      };

      await sendBrevoTemplate(ADMIN_EMAIL, ADMIN_TEMPLATE_ID, emailParams);
    } catch (error) {
      console.error("[BREVO] Erreur notifyAdminNewOrder:", error);
    }
};

const sendReturnLabel = async (orderInfo) => {
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

export const emailService = {
  sendOrderConfirmation,
  notifyAdminNewOrder,
  sendReturnLabel,
};
