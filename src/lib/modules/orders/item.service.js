import prisma from '@/lib/core/database';

export async function processItemAction(itemId, userId, action) {
  // 1. Vérification d'intégrité absolue : 
  // On croise l'ID du jouet avec l'ID de l'utilisateur via la commande parente.
  // Impossible d'agir sur le jouet d'un autre client, même en manipulant le réseau.
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      id: itemId,
      order: {
        userId: parseInt(userId)
      }
    }
  });

  if (!orderItem) {
    throw new Error("Jouet introuvable ou accès refusé.");
  }

  // 2. Aiguillage selon le cycle de vie du jouet
  switch (action) {
    case 'EXCHANGE':
      // "Louez, Jouez, Échangez !" 
      // Le jouet est marqué pour le retour logistique vers Saussan.
      return await prisma.orderItem.update({
        where: { id: itemId },
        data: { 
          status: 'RETURN_REQUESTED',
          notes: 'En attente de réception pour application du protocole de nettoyage rigoureux.'
        }
      });

    case 'ADOPT':
      // C'est le coup de cœur. Le jouet reste définitivement dans la famille.
      // (Note : Dans le futur, tu pourras brancher ici l'API Stripe pour facturer le prix d'adoption)
      return await prisma.orderItem.update({
        where: { id: itemId },
        data: { 
          status: 'ADOPTED',
          // On s'assure que ce jouet spécifique ne rentre plus dans la facturation de l'abonnement
          isSubscriptionActive: false 
        }
      });

    case 'EXTEND':
      // Le modèle est sans engagement, on repousse simplement la date indicative.
      const currentExpectedReturn = orderItem.expectedReturnDate || new Date();
      const newReturnDate = new Date(currentExpectedReturn);
      newReturnDate.setDate(newReturnDate.getDate() + 30);

      return await prisma.orderItem.update({
        where: { id: itemId },
        data: { 
          expectedReturnDate: newReturnDate 
        }
      });

    default:
      throw new Error("Action non reconnue");
  }
}