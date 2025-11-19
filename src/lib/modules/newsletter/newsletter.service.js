import prisma from '@/lib/core/database/index.js';
import { addContactToList, sendMail } from '@/lib/core/mailjet/index.js';

console.log(' Prisma dans newsletter.service:', prisma ? ' OK' : ' UNDEFINED');

export const newsletterService = {
  async subscribe(email) {
    try {
      const newsletter = await prisma.newsletter_subscribers.create({
        data: { email },
      });

      // Ajout à la Mailjet Contact List (non bloquant)
      try {
        await addContactToList({
          email,
          listId: process.env.MAILJET_CONTACT_LIST_ID,
        });
      } catch (err) {
        console.error('Erreur ajout contact Mailjet (non bloquant) :', err);
      }

      // Envoi d'un email de confirmation au client (non bloquant)
      try {
        await sendMail({
          toEmail: email,
          subject: "Vous êtes inscrit à la newsletter — bibli'O jouets",
          text: `Merci ! Votre email (${email}) a bien été ajouté à notre newsletter.`,
        });
      } catch (err) {
        console.error('Erreur envoi confirmation newsletter (non bloquant):', err);
      }

      return newsletter;
    } catch (error) {
      console.error('Erreur dans subscribe:', error);

      if (error.code === 'P2002') {
        throw new Error('Cet email est déjà inscrit à la newsletter');
      }
      throw error;
    }
  },
  // Récupérer tous les abonnés
  async getAll() {
    return await prisma.newsletter_subscribers.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  // Récupérer un abonné par email
  async getByEmail(email) {
    return await prisma.newsletter_subscribers.findUnique({
      where: { email },
    });
  },

  // Supprimer un abonné
  async unsubscribe(email) {
    return await prisma.newsletter_subscribers.delete({
      where: { email },
    });
  },

  // Compter les abonnés
  async count() {
    return await prisma.newsletter_subscribers.count();
  },
};