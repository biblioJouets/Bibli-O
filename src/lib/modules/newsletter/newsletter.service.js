import prisma from '@/lib/core/database/index.js';

console.log(' Prisma dans newsletter.service:', prisma ? ' OK' : ' UNDEFINED');

export const newsletterService = {
  // Créer une inscription newsletter
  async subscribe(email) {
    try {
      console.log('📧 Tentative d\'inscription:', email);
      
      const newsletter = await prisma.newsletter_subscribers.create({
        data: { email },
      });
      
      console.log(' Newsletter créée:', newsletter);
      return newsletter;
    } catch (error) {
      console.error(' Erreur dans subscribe:', error);
      
      // Email déjà existant
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