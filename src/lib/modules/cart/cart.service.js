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
  async addToCart(userId, productId, quantity = 1, intent = "RENTAL") {
    const cart = await this.getCart(userId);
    const pId = parseInt(productId);

    const BOX_REF = 'BOX-MYSTERE';
    const cartProducts = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: { select: { reference: true } } },
    });
    if (cartProducts.some(ci => ci.intent === 'GIFT_CARD')) {
      throw new Error("Votre panier contient une carte-cadeau. Retirez-la avant d'ajouter un jouet.");
    }

    // 1. Récupérer le produit pour connaître son stock
    const product = await prisma.products.findUnique({
      where: { id: pId }
    });

    if (!product) throw new Error("Produit introuvable");

    const hasBox = cartProducts.some(ci => ci.product?.reference === BOX_REF);

    if (product.reference === BOX_REF && cartProducts.length > 0) {
      throw new Error("La Box Mystère s'achète seule. Veuillez d'abord vider votre panier.");
    }
    if (product.reference !== BOX_REF && hasBox) {
      throw new Error("Votre panier contient déjà la Box Mystère. Elle s'achète sans autre jouet.");
    }

    // 2. Vérifier si l'item est déjà dans le panier
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_intent: {
          cartId: cart.id,
          productId: pId,
          intent: intent
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
          quantity: quantity,
          intent: intent // "RENTAL" ou "PURCHASE"
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

    if (!item.product || item.intent === 'GIFT_CARD') {
      throw new Error("La quantité d'une carte cadeau ne se modifie pas.");
    }

    if (quantity > item.product.stock) {
         throw new Error(`Impossible d'ajouter plus. Stock max : ${item.product.stock}`);
    }

    return await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity: parseInt(quantity) }
    });
  },

  async addGiftCard(userId, { customAmount, giftMetadata }) {
    const amount = Math.floor(Number(customAmount));
    if (!Number.isInteger(amount) || amount < 10 || amount > 500) {
      throw new Error("Le montant doit être un nombre entier entre 10 € et 500 €.");
    }

    const meta = giftMetadata && typeof giftMetadata === 'object' ? giftMetadata : null;
    if (meta?.offerToSomeone) {
      const firstName = String(meta.recipientFirstName || '').trim();
      const lastName = String(meta.recipientLastName || '').trim();
      const email = String(meta.recipientEmail || '').trim();
      if (!firstName || !lastName || !email || !email.includes('@')) {
        throw new Error("Renseignez le prénom, le nom et l'e-mail du bénéficiaire.");
      }
    }

    const cart = await this.getCart(userId);
    const existing = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
    const others = existing.filter((item) => item.intent !== 'GIFT_CARD');
    if (others.length > 0) {
      const error = new Error("Votre panier contient déjà des jouets. Une carte-cadeau doit rester seule.");
      error.code = 'CART_MIXED';
      throw error;
    }

    const payload = {
      customAmount: amount,
      giftMetadata: meta,
      quantity: 1,
      intent: 'GIFT_CARD',
    };

    const current = existing.find((item) => item.intent === 'GIFT_CARD');
    if (current) {
      return prisma.cartItem.update({
        where: { id: current.id },
        data: payload,
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: null,
        ...payload,
      },
    });
  },

  async removeItem(userId, itemId) {
    return await prisma.cartItem.delete({
      where: { id: parseInt(itemId) }
    });
  }
};