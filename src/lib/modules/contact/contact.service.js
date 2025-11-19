// src/lib/modules/contact/contact.service.js
import prisma from '@/lib/core/database/index.js';
import { sendMail, addContactToList } from '@/lib/core/mailjet/index.js';

const ADMIN_RECEIVER_EMAIL = process.env.ADMIN_RECEIVER_EMAIL ;

export const contactService = {
  /**
   * Create a contact message: save to DB, notify admin, optionally confirm to user
   * @param {Object} payload
   */
  async createMessage(payload) {
    const { name, surname, phone, email, message } = payload;

    // Création en BDD
    const created = await prisma.contactMessage.create({
      data: {
        name,
        surname,
        phone,
        email,
        message,
      },
    });

    // Envoi email d'alerte à l'admin
    try {
      const subjectAdmin = `Nouveau message de contact : ${email}`;
      const textAdmin = `
Nouveau message reçu depuis la page contact.

Nom: ${name || '-'}
Prénom: ${surname || '-'}
Tel: ${phone || '-'}
Email: ${email}
Message:
${message}
      `;

      await sendMail({
        toEmail: ADMIN_RECEIVER_EMAIL,
        subject: subjectAdmin,
        text: textAdmin,
      });
    } catch (err) {
      console.error('Erreur envoi mail admin (non bloquant) :', err);
    }

    // Envoi email de confirmation au client (non bloquant)
    try {
      const subjectClient = 'Votre message a bien été reçu — bibli\'O jouets';
      const textClient = `Bonjour ${name || ''},

Merci pour votre message. Nous avons bien reçu votre demande et reviendrons vers vous rapidement.

Récapitulatif:
${message}

Cordialement,
L'équipe bibli'O jouets
`;

      await sendMail({
        toEmail: email,
        subject: subjectClient,
        text: textClient,
      });
    } catch (err) {
      console.error('Erreur envoi mail client (non bloquant) :', err);
    }

    return created;
  },
};
