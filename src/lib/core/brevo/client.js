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
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    // Note : En v3, la réponse peut être dans data.body ou data direct selon le client HTTP
    // On gère les deux cas pour être sûr
    const messageId = data.messageId || data.body?.messageId;
    
    console.log(`[BREVO] Email envoyé à ${toEmail} (Template: ${templateId}). ID: ${messageId}`);
    return { success: true, messageId: messageId };
  } catch (error) {
    // Amélioration du log d'erreur pour le débogage
    const errorBody = error.response ? error.response.body : error;
    console.error('[BREVO] Erreur d\'envoi:', JSON.stringify(errorBody, null, 2));
    return { success: false, error: errorBody };
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