import prisma from '@/lib/core/database';

export const cartService = {
  // Récupérer le panier (ou le créer s'il n'existe pas)
  async getCart(userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }, // On récupère les infos du produit (nom, prix, images)
          orderBy: { id: 'asc' }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true }
      });
    }

    return cart;
  },

  // Ajouter un item (ou incrémenter si existe déjà)
  async addToCart(userId, productId, quantity = 1) {
    const cart = await this.getCart(userId);

    // Vérifier si l'item est déjà dans le panier
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: parseInt(productId)
        }
      }
    });

    if (existingItem) {
      // Update quantité
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Créer nouvel item
      return await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: quantity
        }
      });
    }
  },

  // Mettre à jour la quantité
  async updateQuantity(userId, itemId, quantity) {
    // Vérif de sécurité : l'item appartient bien au user ? 
    return await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity: parseInt(quantity) }
    });
  },

  // Supprimer un item
  async removeItem(userId, itemId) {
    return await prisma.cartItem.delete({
      where: { id: parseInt(itemId) }
    });
  }
};