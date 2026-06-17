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
      findMany: jest.fn(),
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

// ─────────────────────────────────────────────────────────────
//  Helpers de setup réutilisables
// ─────────────────────────────────────────────────────────────
const mockEmptyCart = (cartId, userId) => {
  prisma.cart.findUnique.mockResolvedValue({ id: cartId, userId, items: [] });
  prisma.cartItem.findMany.mockResolvedValue([]); // pas de BOX-MYSTERE
};

describe('CartService - Gestion du Stock', () => {
  const userId = 1;
  const productId = 8;
  const cartId = 100;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmptyCart(cartId, userId);
  });

  // --- TESTS AJOUT AU PANIER ---
  it('DOIT ajouter le produit si le stock est suffisant', async () => {
    prisma.products.findUnique.mockResolvedValue({ id: productId, stock: 5, reference: 'LEGO-001' });
    prisma.cartItem.findUnique.mockResolvedValue(null);
    prisma.cartItem.create.mockResolvedValue({ id: 1, quantity: 1 });

    await cartService.addToCart(userId, productId, 1);

    expect(prisma.cartItem.create).toHaveBeenCalledWith({
      data: {
        cartId: cartId,
        productId: productId,
        quantity: 1,
        intent: 'RENTAL',
      },
    });
  });

  it('DOIT BLOQUER (Erreur) si la quantité demandée dépasse le stock', async () => {
    prisma.products.findUnique.mockResolvedValue({ id: productId, stock: 1, reference: 'LEGO-001' });
    prisma.cartItem.findUnique.mockResolvedValue({ id: 50, quantity: 1 });

    await expect(cartService.addToCart(userId, productId, 1))
      .rejects
      .toThrow('Stock insuffisant');

    expect(prisma.cartItem.update).not.toHaveBeenCalled();
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });

  // --- TESTS MISE À JOUR QUANTITÉ ---
  describe('updateQuantity', () => {
    it('DOIT mettre à jour la quantité si le stock le permet', async () => {
      prisma.cartItem.findUnique.mockResolvedValue({
        id: 50,
        quantity: 1,
        product: { id: productId, stock: 5 },
      });

      await cartService.updateQuantity(userId, 50, 3);

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 50 },
        data: { quantity: 3 },
      });
    });

    it('DOIT BLOQUER si la nouvelle quantité dépasse le stock', async () => {
      prisma.cartItem.findUnique.mockResolvedValue({
        id: 50,
        quantity: 1,
        product: { id: productId, stock: 2 },
      });

      await expect(cartService.updateQuantity(userId, 50, 3))
        .rejects
        .toThrow("Impossible d'ajouter plus");

      expect(prisma.cartItem.update).not.toHaveBeenCalled();
    });
  });
});

// ─────────────────────────────────────────────────────────────
//  Panier Hybride — intent RENTAL vs PURCHASE
// ─────────────────────────────────────────────────────────────
describe('CartService - Panier Hybride (intent)', () => {
  const userId = 1;
  const productId = 8;
  const cartId = 100;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmptyCart(cartId, userId);
  });

  it('crée 2 lignes distinctes pour le même produit avec intents différents', async () => {
    // Produit avec stock suffisant pour 2 lignes
    prisma.products.findUnique.mockResolvedValue({
      id: productId,
      stock: 5,
      reference: 'LEGO-001',
    });
    // Pas d'item existant dans les deux cas
    prisma.cartItem.findUnique.mockResolvedValue(null);
    prisma.cartItem.create
      .mockResolvedValueOnce({ id: 10, cartId, productId, quantity: 1, intent: 'RENTAL' })
      .mockResolvedValueOnce({ id: 11, cartId, productId, quantity: 1, intent: 'PURCHASE' });

    await cartService.addToCart(userId, productId, 1, 'RENTAL');
    await cartService.addToCart(userId, productId, 1, 'PURCHASE');

    expect(prisma.cartItem.create).toHaveBeenCalledTimes(2);

    // Premier appel : intent RENTAL
    expect(prisma.cartItem.create).toHaveBeenNthCalledWith(1, {
      data: { cartId, productId, quantity: 1, intent: 'RENTAL' },
    });

    // Deuxième appel : intent PURCHASE — clé composite différente
    expect(prisma.cartItem.create).toHaveBeenNthCalledWith(2, {
      data: { cartId, productId, quantity: 1, intent: 'PURCHASE' },
    });
  });

  it('utilise findUnique avec la clé composite cartId_productId_intent', async () => {
    prisma.products.findUnique.mockResolvedValue({
      id: productId,
      stock: 5,
      reference: 'LEGO-001',
    });
    prisma.cartItem.findUnique.mockResolvedValue(null);
    prisma.cartItem.create.mockResolvedValue({ id: 10 });

    await cartService.addToCart(userId, productId, 1, 'PURCHASE');

    expect(prisma.cartItem.findUnique).toHaveBeenCalledWith({
      where: {
        cartId_productId_intent: {
          cartId,
          productId,
          intent: 'PURCHASE',
        },
      },
    });
  });

  it('incrémente la quantité si le même intent existe déjà', async () => {
    prisma.products.findUnique.mockResolvedValue({
      id: productId,
      stock: 5,
      reference: 'LEGO-001',
    });
    // Item RENTAL déjà en panier avec qty 1
    prisma.cartItem.findUnique.mockResolvedValue({ id: 10, quantity: 1 });
    prisma.cartItem.update.mockResolvedValue({ id: 10, quantity: 2 });

    await cartService.addToCart(userId, productId, 1, 'RENTAL');

    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { quantity: 2 },
    });
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });

  it('ne mélange pas les items RENTAL et PURCHASE lors de la vérification de stock', async () => {
    // Stock = 2 ; 1 déjà en RENTAL, on tente d'ajouter 1 en PURCHASE → doit passer (2 ≤ stock)
    prisma.products.findUnique.mockResolvedValue({
      id: productId,
      stock: 2,
      reference: 'LEGO-001',
    });
    // findUnique appelé avec intent=PURCHASE → aucun item existant pour cet intent
    prisma.cartItem.findUnique.mockResolvedValue(null);
    prisma.cartItem.create.mockResolvedValue({ id: 11 });

    await expect(cartService.addToCart(userId, productId, 1, 'PURCHASE')).resolves.toBeDefined();
    expect(prisma.cartItem.create).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
//  Règle BOX-MYSTERE
// ─────────────────────────────────────────────────────────────
describe('CartService - Règle BOX-MYSTERE', () => {
  const userId = 1;
  const cartId = 100;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.cart.findUnique.mockResolvedValue({ id: cartId, userId, items: [] });
  });

  it("interdit d'ajouter la Box Mystere si le panier n'est pas vide", async () => {
    prisma.products.findUnique.mockResolvedValue({ id: 99, stock: 3, reference: 'BOX-MYSTERE' });
    // Un autre article est déjà dans le panier
    prisma.cartItem.findMany.mockResolvedValue([
      { product: { reference: 'LEGO-001' } },
    ]);

    await expect(cartService.addToCart(userId, 99, 1))
      .rejects
      .toThrow('La Box Mystère s\'achète seule');
  });

  it("interdit d'ajouter un jouet normal si la Box Mystere est deja dans le panier", async () => {
    prisma.products.findUnique.mockResolvedValue({ id: 8, stock: 3, reference: 'LEGO-001' });
    // La box est déjà présente
    prisma.cartItem.findMany.mockResolvedValue([
      { product: { reference: 'BOX-MYSTERE' } },
    ]);

    await expect(cartService.addToCart(userId, 8, 1))
      .rejects
      .toThrow('Votre panier contient déjà la Box Mystère');
  });
});