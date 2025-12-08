import { cartService } from '../cart.service';
import { prisma } from '@/lib/core/database';

jest.mock('@/lib/core/database', () => {
  const mockClient = {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    products: {
      findUnique: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };
  
  return {
    __esModule: true,
    default: mockClient, 
    prisma: mockClient,
  };
});

describe('CartService - Gestion du Stock', () => {
  const userId = 1;
  const productId = 8;
  const cartId = 100;

  beforeEach(() => {
    jest.clearAllMocks();
    
    prisma.cart.findUnique.mockResolvedValue({ id: cartId, userId, items: [] });
  });

  // --- TESTS AJOUT AU PANIER ---
  it('DOIT ajouter le produit si le stock est suffisant', async () => {
    // 1. SETUP
    prisma.products.findUnique.mockResolvedValue({ id: productId, stock: 5 });
    prisma.cartItem.findUnique.mockResolvedValue(null);
    prisma.cartItem.create.mockResolvedValue({ id: 1, quantity: 1 });

    // 2. ACTION
    await cartService.addToCart(userId, productId, 1);

    // 3. ASSERTION
    expect(prisma.cartItem.create).toHaveBeenCalledWith({
      data: {
        cartId: cartId,
        productId: productId,
        quantity: 1
      }
    });
  });

  it('DOIT BLOQUER (Erreur) si la quantité demandée dépasse le stock', async () => {
    // 1. SETUP
    prisma.products.findUnique.mockResolvedValue({ id: productId, stock: 1 });
    prisma.cartItem.findUnique.mockResolvedValue({ id: 50, quantity: 1 });

    // 2. ACTION & ASSERTION
    await expect(cartService.addToCart(userId, productId, 1))
      .rejects
      .toThrow("Stock insuffisant");

    expect(prisma.cartItem.update).not.toHaveBeenCalled();
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });

  // --- TESTS MISE À JOUR QUANTITÉ ---
  describe('updateQuantity', () => {
    it('DOIT mettre à jour la quantité si le stock le permet', async () => {
      // 1. SETUP
      prisma.cartItem.findUnique.mockResolvedValue({ 
        id: 50, 
        quantity: 1, 
        product: { id: productId, stock: 5 } 
      });

      // 2. ACTION
      await cartService.updateQuantity(userId, 50, 3);

      // 3. ASSERTION
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 50 },
        data: { quantity: 3 }
      });
    });

    it('DOIT BLOQUER si la nouvelle quantité dépasse le stock', async () => {
      // 1. SETUP
      prisma.cartItem.findUnique.mockResolvedValue({ 
        id: 50, 
        quantity: 1, 
        product: { id: productId, stock: 2 } 
      });

      // 2. ACTION
      await expect(cartService.updateQuantity(userId, 50, 3))
        .rejects
        .toThrow("Impossible d'ajouter plus");

      // 3. ASSERTION
      expect(prisma.cartItem.update).not.toHaveBeenCalled();
    });
  });
});