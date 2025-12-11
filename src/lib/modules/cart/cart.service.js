import prisma from '@/lib/core/database';

export const cartService = {
  // Récupérer le panier
  async getCart(userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
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

  // Ajouter un item avec VÉRIFICATION DU STOCK
  async addToCart(userId, productId, quantity = 1) {
    const cart = await this.getCart(userId);
    const pId = parseInt(productId);

    // 1. Récupérer le produit pour connaître son stock
    const product = await prisma.products.findUnique({
      where: { id: pId }
    });

    if (!product) throw new Error("Produit introuvable");

    // 2. Vérifier si l'item est déjà dans le panier
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: pId
        }
      }
    });

    // 3. Calculer la quantité finale souhaitée
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const finalQty = currentQtyInCart + quantity;

    // 4. BLOQUER si ça dépasse le stock
    if (finalQty > product.stock) {
      throw new Error(`Stock insuffisant. Il ne reste que ${product.stock} exemplaire(s).`);
    }

    if (existingItem) {
      // Update quantité
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: finalQty }
      });
    } else {
      // Créer nouvel item
      return await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: pId,
          quantity: quantity
        }
      });
    }
  },

  // Mettre à jour la quantité (avec vérification stock aussi)
  async updateQuantity(userId, itemId, quantity) {
    const item = await prisma.cartItem.findUnique({
        where: { id: parseInt(itemId) },
        include: { product: true } // On a besoin du stock du produit lié
    });

    if(!item) throw new Error("Article introuvable");

    if (quantity > item.product.stock) {
         throw new Error(`Impossible d'ajouter plus. Stock max : ${item.product.stock}`);
    }

    return await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity: parseInt(quantity) }
    });
  },

  async removeItem(userId, itemId) {
    return await prisma.cartItem.delete({
      where: { id: parseInt(itemId) }
    });
  }
};