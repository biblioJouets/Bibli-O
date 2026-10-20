/* src/lib/modules/emails/email.service.js */
import { sendBrevoTemplate, sendBrevoHtml } from '@/lib/core/brevo/client';
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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function giftEmailLayout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#FFFAF4;font-family:Georgia, 'Times New Roman', serif;color:#2E1D21;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFAF4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFF7EB;border-radius:25px;overflow:hidden;">
        <tr><td style="background:#ffe264;padding:22px 28px;">
          <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Bibli'o Jouets</p>
          <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;">${title}</h1>
        </td></tr>
        <tr><td style="padding:28px;font-size:16px;line-height:1.6;">
          ${bodyHtml}
          <p style="margin:28px 0 0;font-size:14px;">Louez, Jouez, Échangez !</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
  const appUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || 'https://www.bibliojouets.fr';
  const activationUrl = `${appUrl.replace(/\/$/, '')}/mon-compte`;
  const amountLabel = Number(amount).toFixed(0);
  const isPostal = method === 'POSTAL';
  const hasRecipient = Boolean(recipientEmail && recipientEmail !== buyer?.email);
  const codeTarget = hasRecipient ? recipientEmail : buyer?.email;
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const safeName = escapeHtml(recipientName || buyer?.firstName || 'vous');
  const safeCode = escapeHtml(code);

  const buyerNote = isPostal
    ? "Votre carte cadeau au format postal est en préparation. Nous l'envoyons à l'adresse indiquée, frais de port de 2,00 € inclus."
    : hasRecipient
      ? `${recipientName || 'Le bénéficiaire'} a bien reçu son code par e-mail.`
      : "Votre code cadeau vous a été envoyé dans un e-mail séparé.";

  const buyerHtml = giftEmailLayout(
    'Votre carte cadeau est confirmée',
    `<p>Bonjour ${escapeHtml(buyer?.firstName || 'Client')},</p>
     <p>Merci pour votre commande <strong>#${orderId}</strong>. La carte cadeau de <strong>${amountLabel} €</strong> est bien enregistrée.</p>
     <p>${buyerNote}</p>`
  );

  const codeHtml = giftEmailLayout(
    'Un cadeau vous attend',
    `<p>Bonjour ${safeName},</p>
     <p>Vous recevez une carte cadeau Bibli'o Jouets de <strong>${amountLabel} €</strong>.</p>
     ${safeMessage ? `<p style="background:#FFD9DC;border-radius:25px;padding:16px 20px;"><em>${safeMessage}</em></p>` : ''}
     <p style="font-size:22px;letter-spacing:0.08em;font-weight:bold;background:#fff;border-radius:25px;padding:16px;text-align:center;">${safeCode}</p>
     <p>Activez-la depuis votre espace client, une fois connecté :</p>
     <p><a href="${activationUrl}" style="display:inline-block;background:#FF8C94;color:#2E1D21;text-decoration:none;border-radius:999px;padding:12px 22px;font-weight:bold;">Activer ma carte</a></p>`
  );

  const addressLine = isPostal
    ? `${shipping?.shippingName || ''} — ${shipping?.shippingAddress || ''}, ${shipping?.shippingZip || ''} ${shipping?.shippingCity || ''}`
    : 'Envoi par e-mail';

  const adminHtml = giftEmailLayout(
    'Nouvelle carte cadeau',
    `<p>Commande <strong>#${orderId}</strong> — <strong>${amountLabel} €</strong>${isPostal ? ' + 2,00 € de port' : ''}.</p>
     <p>Mode : <strong>${isPostal ? 'Voie postale (+2 €)' : 'E-mail'}</strong></p>
     <p>Code : <strong>${safeCode}</strong></p>
     <p>Acheteur : ${escapeHtml(buyer?.firstName || '')} ${escapeHtml(buyer?.lastName || '')} — ${escapeHtml(buyer?.email || '')}</p>
     <p>Bénéficiaire : ${safeName}${recipientEmail ? ` — ${escapeHtml(recipientEmail)}` : ''}</p>
     <p>Livraison : ${escapeHtml(addressLine)}</p>`
  );

  const jobs = [
    sendBrevoHtml({
      toEmail: buyer?.email,
      toName: buyer?.firstName,
      subject: `Carte cadeau confirmée — commande #${orderId}`,
      html: buyerHtml,
      text: `Votre carte cadeau de ${amountLabel} € est confirmée. ${buyerNote}`,
    }),
  ];

  if (codeTarget) {
    jobs.push(sendBrevoHtml({
      toEmail: codeTarget,
      toName: recipientName || buyer?.firstName,
      subject: `Votre carte cadeau Bibli'o Jouets — ${amountLabel} €`,
      html: codeHtml,
      text: `Votre code cadeau ${code} d'un montant de ${amountLabel} €. Activez-le sur ${activationUrl}`,
    }));
  }

  jobs.push(sendBrevoHtml({
    toEmail: 'contact@bibliojouets.com',
    toName: 'Admin',
    subject: `Carte cadeau #${orderId} — ${isPostal ? 'postal +2€' : 'e-mail'}`,
    html: adminHtml,
    text: `Commande #${orderId}, code ${code}, ${amountLabel} €, ${isPostal ? 'voie postale' : 'e-mail'}. ${addressLine}`,
  }));

  await Promise.all(jobs);
};

export const emailService = {
  sendOrderConfirmation,
  notifyAdminNewOrder,
  sendReturnLabel,
  sendGiftCardEmails,
};
