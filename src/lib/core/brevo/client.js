import * as Brevo from '@getbrevo/brevo';

// 1. Configuration de l'instance API
const apiInstance = new Brevo.TransactionalEmailsApi();

// On configure l'authentification
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

/**
 * Envoie un email transactionnel via un Template Brevo
 * * @param {string} toEmail - Email du destinataire (Client)
 * @param {number} templateId - ID du template créé dans l'interface Brevo
 * @param {object} params - Variables à injecter (ex: { PRENOM: 'Lucas', URL_SUIVI: '...' })
 * @param {string} [attachmentUrl] - (Optionnel) URL d'un PDF à joindre (ex: étiquette retour)
 */
export const sendBrevoTemplate = async (toEmail, templateId, params = {}, attachmentUrl = null) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.templateId = templateId;
  sendSmtpEmail.params = params;

  // Gestion des pièces jointes (ex: Etiquette retour)
  if (attachmentUrl) {
    sendSmtpEmail.attachment = [{ url: attachmentUrl }];
  }

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`[BREVO] Email envoyé à ${toEmail} (Template: ${templateId}). ID: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('[BREVO] Erreur d\'envoi:', error.body || error);
    return { success: false, error: error };
  }
};

/**
 * Fonction de test pour vérifier la connexion (Optionnel)
 */
export const testBrevoConnection = async () => {
    try {
        const data = await apiInstance.getAccount();
        console.log("[BREVO] Connexion réussie. Compte :", data.email);
        return true;
    } catch (error) {
        console.error("[BREVO] Erreur de connexion :", error);
        return false;
    }
}