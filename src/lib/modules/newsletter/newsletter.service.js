import prisma from '@/lib/core/database';

export const newsletterService = {
  // Créer une inscription newsletter
  async subscribe(email) {
    try {
      const newsletter = await prisma.newsletter.create({
        data: { email },
      });
      return newsletter;
    } catch (error) {
      // Email déjà existant
      if (error.code === 'P2002') {
        throw new Error('Cet email est déjà inscrit à la newsletter');
      }
      throw error;
    }
  },

  // Récupérer tous les abonnés
  async getAll() {
    return await prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  // Récupérer un abonné par email
  async getByEmail(email) {
    return await prisma.newsletter.findUnique({
      where: { email },
    });
  },

  // Supprimer un abonné
  async unsubscribe(email) {
    return await prisma.newsletter.delete({
      where: { email },
    });
  },

  // Compter les abonnés
  async count() {
    return await prisma.newsletter.count();
  },
};