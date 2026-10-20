// src/lib/core/brevo/client.js
import * as Brevo from '@getbrevo/brevo';

// 1. Configuration de l'instance API (Version 3)
const apiInstance = new Brevo.TransactionalEmailsApi();

// --- MIGRATION V3 : Nouvelle méthode d'authentification ---
// L'ancienne méthode (authentications['apiKey']) ne fonctionne plus.
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey, 
  process.env.BREVO_API_KEY
);

/**
 * Envoie un email transactionnel via un Template Brevo
 * @param {string} toEmail - Email du destinataire (Client)
 * @param {number} templateId - ID du template créé dans l'interface Brevo
 * @param {object} params - Variables à injecter (ex: { PRENOM: 'Lucas', URL_SUIVI: '...' })
 * @param {string} [attachmentUrl] - (Optionnel) URL d'un PDF à joindre (ex: étiquette retour)
 */
export const sendBrevoTemplate = async (toEmail, templateId, params = {}, attachmentUrl = null) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.templateId = Number(templateId); // Sécurité : on force le type nombre
  sendSmtpEmail.params = params;

  // Gestion des pièces jointes
  if (attachmentUrl) {
    sendSmtpEmail.attachment = [{ url: attachmentUrl }];
  }

  try {
    // AJOUT DEBUG : On vérifie juste avant l'envoi
    console.log(`[DEBUG] Tentative envoi avec clé : ${process.env.BREVO_API_KEY ? 'PRÉSENTE (Commence par ' + process.env.BREVO_API_KEY.substring(0,5) + '...)' : 'ABSENTE ❌'}`);

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    const messageId = data.messageId || data.body?.messageId;
    console.log(`[BREVO] Succès. ID: ${messageId}`);
    return { success: true, messageId };

  } catch (error) {
    console.error('🔴 [BREVO] ERREUR SYSTÈME :');
    console.error('👉 Message:', error.message); // C'est souvent ici que se cache la vérité (ex: "getaddrinfo ENOTFOUND")
    console.error('👉 Stack:', error.stack);
    
    // On loggue l'objet entier au cas où
    console.error('👉 Objet Erreur complet:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    return { success: false, error: error.message };
  }
};

/**
 * Fonction de test pour vérifier la connexion
 */
export const testBrevoConnection = async () => {
    try {
        // Note: getAccount est dans AccountApi, pas TransactionalEmailsApi
        const accountApi = new Brevo.AccountApi();
        accountApi.setApiKey(Brevo.AccountApiApiKeys.apiKey, process.env.BREVO_API_KEY);
        
        const data = await accountApi.getAccount();
        console.log("[BREVO] Connexion réussie. Compte :", data.email);
        return true;
    } catch (error) {
        console.error("[BREVO] Erreur de connexion :", error.response ? error.response.body : error);
        return false;
    }
}

/**
 * Envoie un e-mail transactionnel HTML (sans template Brevo).
 */
export const sendBrevoHtml = async ({ toEmail, toName, subject, html, text }) => {
  if (!toEmail) return { success: false, error: "Destinataire manquant" };

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.sender = {
    name: process.env.BREVO_SENDER_NAME || "Bibli'o Jouets",
    email: process.env.BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.to = [{ email: toEmail, name: toName || undefined }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  if (text) sendSmtpEmail.textContent = text;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    const messageId = data.messageId || data.body?.messageId;
    console.log(`[BREVO] HTML envoyé. ID: ${messageId}`);
    return { success: true, messageId };
  } catch (error) {
    console.error("[BREVO] Erreur envoi HTML:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendResetEmail = async (email, resetUrl) => {
  const TEMPLATE_ID = 10; 

  const params = {
    RESET_LINK: resetUrl, // Doit correspondre à {{ params.RESET_LINK }} dans ton template Brevo
  };

  return await sendBrevoTemplate(email, TEMPLATE_ID, params);
};