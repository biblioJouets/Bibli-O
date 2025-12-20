import prisma from '@/lib/core/database';
import { sendBrevoTemplate } from '@/lib/core/brevo/client';

/**
 * Création d'une commande à partir d'un panier
 */
export const createOrder = async (userId, cartData, totalAmount, shippingData) => {
  // 1. Création de la commande en base de données
  const newOrder = await prisma.orders.create({
    data: {
      userId: userId,
      totalAmount: totalAmount,
      status: 'PENDING', // ou 'PREPARING' selon ta logique
      mondialRelayPointId: shippingData.mondialRelayPointId, // ID du point relais
      shippingName: shippingData.shippingName,
      // ... autres champs d'adresse si besoin
      OrderProducts: {
        create: cartData.items.map(item => ({
          ProductId: item.productId
        }))
      }
    }
  });

  // 2. Récupération des infos utilisateur pour l'email (Prénom, Email)
  const user = await prisma.users.findUnique({
    where: { id: userId }
  });

  // 3. Préparation et Envoi de l'email BREVO
  // On place cela dans un try/catch silencieux pour ne pas bloquer la commande si l'email échoue
  try {
    const emailParams = {
      PRENOM: user.firstName || "Client",
      COMMANDE_ID: newOrder.id,
      TOTAL: newOrder.totalAmount,
      DATE_DEBUT: new Date().toLocaleDateString('fr-FR'),
      // On force "Point Relais" puisque tu ne fais que ça
      LIVRAISON: "Point Relais", 
      // On prend le nom du premier article pour l'exemple
      NOM_ARTICLE_1: cartData.items[0]?.product?.name || "Sélection de jouets",
      PRIX_ARTICLE_1: cartData.items[0]?.product?.price || "-",
    };

    // ID 8 correspond à ton template "Confirmation de commande"
    await sendBrevoTemplate(user.email, 8, emailParams);
    console.log(`[BREVO] Email de confirmation envoyé pour la commande #${newOrder.id}`);

  } catch (emailError) {
    console.error("[BREVO] Erreur lors de l'envoi du mail de confirmation :", emailError);
    // On ne 'throw' pas l'erreur ici, car la commande est bien créée, c'est juste le mail qui a raté.
  }

  return newOrder;
};

/**
 * Récupération de l'historique des commandes d'un utilisateur
 */
export const getUserOrders = async (userId) => {
  try {
    const orders = await prisma.orders.findMany({
      where: { userId: parseInt(userId) },
      include: {
        OrderProducts: {
          include: {
            Products: true // On récupère les détails des produits loués
          }
        }
      },
      orderBy: { createdAt: 'desc' } // Les plus récentes en premier
    });
    return orders;
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes utilisateur:", error);
    throw error;
  }
};