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

const GIFT_CARD_TEMPLATES = {
  BUYER_EMAIL: 40,
  BUYER_POSTAL: 41,
  BENEFICIARY: 42,
  ADMIN_EMAIL: 43,
  ADMIN_POSTAL: 44,
};

const GIFT_CARD_ADMIN_EMAIL = 'contact@bibliojouets.com';
const DEFAULT_GIFT_MESSAGE = "Un petit cadeau pour jouer encore et encore. Louez, Jouez, Échangez !";

function appPath(path) {
  const base = (process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || 'https://www.bibliojouets.fr').replace(/\/$/, '');
  return `${base}${path}`;
}

function formatOrderDate(date = new Date()) {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function personName(person, fallback = '') {
  const name = [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim();
  return name || fallback;
}

const sendGiftCardEmails = async ({
  buyer,
  code,
  amount,
  method,
  recipientName,
  recipientEmail,
  message,
  orderId,
  shipping,
}) => {
  const isPostal = method === 'POSTAL';
  const amountLabel = String(Number(amount));
  const totalPaid = (Number(amount) + (isPostal ? 2 : 0)).toFixed(2);
  const orderLabel = String(orderId);
  const dateLabel = formatOrderDate();
  const buyerName = personName(buyer, buyer?.firstName || 'Client');
  const buyerFirstName = buyer?.firstName || 'Client';
  const giftMessage = String(message || '').trim() || DEFAULT_GIFT_MESSAGE;
  const hasRecipient = Boolean(
    recipientEmail && recipientEmail.toLowerCase() !== String(buyer?.email || '').toLowerCase()
  );
  const beneficiaryEmail = hasRecipient ? recipientEmail : buyer?.email;
  const beneficiaryName = recipientName || buyerFirstName;
  const deliveryStatusText = hasRecipient
    ? `Le code a été envoyé par e-mail à ${recipientName || recipientEmail}.`
    : 'Le code vous a été envoyé par e-mail.';

  const jobs = [];

  if (buyer?.email) {
    jobs.push(isPostal
      ? sendBrevoTemplate(buyer.email, GIFT_CARD_TEMPLATES.BUYER_POSTAL, {
          ORDER_ID: orderLabel,
          BUYER_FIRSTNAME: buyerFirstName,
          AMOUNT: amountLabel,
          RECIPIENT_NAME: recipientName || buyerName,
          TOTAL_PAID: totalPaid,
          SHIPPING_NAME: shipping?.shippingName || '',
          SHIPPING_ADDRESS: shipping?.shippingAddress || '',
          SHIPPING_ZIP: shipping?.shippingZip || '',
          SHIPPING_CITY: shipping?.shippingCity || '',
          CODE: code,
          ORDERS_URL: appPath('/mon-compte/commandes'),
        })
      : sendBrevoTemplate(buyer.email, GIFT_CARD_TEMPLATES.BUYER_EMAIL, {
          ORDER_ID: orderLabel,
          BUYER_FIRSTNAME: buyerFirstName,
          DATE: dateLabel,
          AMOUNT: amountLabel,
          CODE: code,
          TOTAL_PAID: totalPaid,
          DELIVERY_STATUS_TEXT: deliveryStatusText,
          ORDERS_URL: appPath('/mon-compte/commandes'),
        }));
  }

  if (beneficiaryEmail) {
    jobs.push(sendBrevoTemplate(beneficiaryEmail, GIFT_CARD_TEMPLATES.BENEFICIARY, {
      AMOUNT: amountLabel,
      RECIPIENT_NAME: beneficiaryName,
      BUYER_NAME: buyerName,
      MESSAGE: giftMessage,
      CODE: code,
      ACTIVATION_URL: appPath('/mon-compte'),
    }));
  }

  jobs.push(isPostal
    ? sendBrevoTemplate(GIFT_CARD_ADMIN_EMAIL, GIFT_CARD_TEMPLATES.ADMIN_POSTAL, {
        ORDER_ID: orderLabel,
        AMOUNT: amountLabel,
        TOTAL_PAID: totalPaid,
        CODE: code,
        SHIPPING_NAME: shipping?.shippingName || '',
        SHIPPING_ADDRESS: shipping?.shippingAddress || '',
        SHIPPING_ZIP: shipping?.shippingZip || '',
        SHIPPING_CITY: shipping?.shippingCity || '',
        SHIPPING_PHONE: shipping?.shippingPhone || '',
        BUYER_NAME: buyerName,
        BUYER_EMAIL: buyer?.email || '',
        RECIPIENT_NAME: recipientName || buyerName,
        MESSAGE: giftMessage,
        ADMIN_URL: appPath('/admin/orders'),
      })
    : sendBrevoTemplate(GIFT_CARD_ADMIN_EMAIL, GIFT_CARD_TEMPLATES.ADMIN_EMAIL, {
        ORDER_ID: orderLabel,
        DATE: dateLabel,
        AMOUNT: amountLabel,
        CODE: code,
        BUYER_NAME: buyerName,
        BUYER_EMAIL: buyer?.email || '',
        RECIPIENT_NAME: recipientName || buyerName,
        RECIPIENT_EMAIL: recipientEmail || buyer?.email || '',
        MESSAGE: giftMessage,
        ADMIN_URL: appPath('/admin/orders'),
      }));

  const results = await Promise.all(jobs);
  const failed = results.filter((result) => result?.success === false);
  if (failed.length > 0) {
    throw new Error(`Échec d'envoi de ${failed.length} e-mail(s) carte cadeau.`);
  }
};

export const emailService = {
  sendOrderConfirmation,
  notifyAdminNewOrder,
  sendReturnLabel,
  sendGiftCardEmails,
};
