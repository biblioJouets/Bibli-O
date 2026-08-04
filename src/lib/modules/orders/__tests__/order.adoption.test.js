/* src/lib/modules/orders/__tests__/order.adoption.test.js
 *
 * Tests de createAdoptionSession — vérifie que la session Stripe Checkout
 * est construite avec les bons line_items selon biblioPrice / price.
 */
import { createAdoptionSession } from '../order.service';
import prisma from '@/lib/core/database';

// ─────────────────────────────────────────────────────────────
//  Mock Prisma
// ─────────────────────────────────────────────────────────────
jest.mock('@/lib/core/database', () => {
  const mockClient = {
    orders: {
      findUnique: jest.fn(),
    },
  };
  return { __esModule: true, default: mockClient, prisma: mockClient };
});

// ─────────────────────────────────────────────────────────────
//  Mock Stripe (import dynamique)
// ─────────────────────────────────────────────────────────────
const mockSessionCreate = jest.fn();
const mockStripeInstance = {
  checkout: {
    sessions: { create: mockSessionCreate },
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripeInstance);
});

// ─────────────────────────────────────────────────────────────
//  Données de test
// ─────────────────────────────────────────────────────────────
const USER_ID = 1;
const ORDER_ID = 10;
const PRODUCT_ID = 8;

const makeOrder = (productOverrides = {}) => ({
  id: ORDER_ID,
  userId: USER_ID,
  status: 'ACTIVE',
  stripeSubscriptionId: 'sub_test123',
  Users: { email: 'client@test.fr' },
  OrderProducts: [
    {
      ProductId: PRODUCT_ID,
      renewalIntention: null,
      Products: {
        id: PRODUCT_ID,
        name: 'Lego City',
        price: 16,
        biblioPrice: null,
        images: [],
        ...productOverrides,
      },
    },
  ],
});

// ─────────────────────────────────────────────────────────────
//  SUITE
// ─────────────────────────────────────────────────────────────
describe('createAdoptionSession — Logique de prix Stripe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'https://bibliojouets.com';
    mockSessionCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/test' });
  });

  // ──────────────────────────────────────────────────────────
  //  Prix : biblioPrice prioritaire sur price
  // ──────────────────────────────────────────────────────────
  it('utilise biblioPrice en centimes quand il est défini', async () => {
    prisma.orders.findUnique.mockResolvedValue(makeOrder({ biblioPrice: 14, price: 16 }));

    await createAdoptionSession(ORDER_ID, PRODUCT_ID, USER_ID);

    expect(mockSessionCreate).toHaveBeenCalledTimes(1);
    const call = mockSessionCreate.mock.calls[0][0];

    expect(call.line_items[0].price_data.unit_amount).toBe(1400); // 14 * 100
    expect(call.line_items[0].price_data.product_data.name).toContain('Lego City');
  });

  it('tombe sur price quand biblioPrice est null', async () => {
    prisma.orders.findUnique.mockResolvedValue(makeOrder({ biblioPrice: null, price: 16 }));

    await createAdoptionSession(ORDER_ID, PRODUCT_ID, USER_ID);

    const call = mockSessionCreate.mock.calls[0][0];
    expect(call.line_items[0].price_data.unit_amount).toBe(1600); // 16 * 100
  });

  it('arrondit correctement les montants décimaux (ex: 14.99€ → 1499 centimes)', async () => {
    prisma.orders.findUnique.mockResolvedValue(makeOrder({ biblioPrice: 14.99, price: 20 }));

    await createAdoptionSession(ORDER_ID, PRODUCT_ID, USER_ID);

    const call = mockSessionCreate.mock.calls[0][0];
    expect(call.line_items[0].price_data.unit_amount).toBe(1499);
  });

  // ──────────────────────────────────────────────────────────
  //  Structure de la session Stripe
  // ──────────────────────────────────────────────────────────
  it('crée une session en mode payment (one-shot), pas en mode subscription', async () => {
    prisma.orders.findUnique.mockResolvedValue(makeOrder({ biblioPrice: 14 }));

    await createAdoptionSession(ORDER_ID, PRODUCT_ID, USER_ID);

    const call = mockSessionCreate.mock.calls[0][0];
    expect(call.mode).toBe('payment');
    expect(call.payment_method_types).toContain('card');
  });

  it('inclut les métadonnées correctes (type, orderId, productId, userId)', async () => {
    prisma.orders.findUnique.mockResolvedValue(makeOrder({ biblioPrice: 14 }));

    await createAdoptionSession(ORDER_ID, PRODUCT_ID, USER_ID);

    const call = mockSessionCreate.mock.calls[0][0];
    expect(call.metadata).toMatchObject({
      type: 'adoption',
      orderId: String(ORDER_ID),
      productId: String(PRODUCT_ID),
      userId: String(USER_ID),
    });
  });

  it("pre-remplit l'email client dans la session Stripe", async () => {
    prisma.orders.findUnique.mockResolvedValue(makeOrder({ biblioPrice: 14 }));

    await createAdoptionSession(ORDER_ID, PRODUCT_ID, USER_ID);

    const call = mockSessionCreate.mock.calls[0][0];
    expect(call.customer_email).toBe('client@test.fr');
  });

  it("retourne l'URL de checkout Stripe", async () => {
    prisma.orders.findUnique.mockResolvedValue(makeOrder({ biblioPrice: 14 }));

    const result = await createAdoptionSession(ORDER_ID, PRODUCT_ID, USER_ID);

    expect(result).toEqual({ url: 'https://checkout.stripe.com/test' });
  });

  // ──────────────────────────────────────────────────────────
  //  Guards métier
  // ──────────────────────────────────────────────────────────
  it("rejette si la commande n'appartient pas a l'utilisateur (403)", async () => {
    prisma.orders.findUnique.mockResolvedValue({ ...makeOrder(), userId: 999 });

    await expect(createAdoptionSession(ORDER_ID, PRODUCT_ID, USER_ID))
      .rejects.toMatchObject({ message: 'Action interdite', status: 403 });

    expect(mockSessionCreate).not.toHaveBeenCalled();
  });

  it("rejette si la commande n'est pas en statut ACTIVE (400)", async () => {
    const inactiveOrder = makeOrder({ biblioPrice: 14 });
    inactiveOrder.status = 'RETURNED';
    prisma.orders.findUnique.mockResolvedValue(inactiveOrder);

    await expect(createAdoptionSession(ORDER_ID, PRODUCT_ID, USER_ID))
      .rejects.toMatchObject({ status: 400 });
  });

  it("rejette si le jouet est introuvable dans la commande (404)", async () => {
    const orderWithoutProduct = makeOrder({ biblioPrice: 14 });
    orderWithoutProduct.OrderProducts = []; // pas de jouet
    prisma.orders.findUnique.mockResolvedValue(orderWithoutProduct);

    await expect(createAdoptionSession(ORDER_ID, PRODUCT_ID, USER_ID))
      .rejects.toMatchObject({ status: 404 });
  });

  it("rejette si le jouet est deja adopte (400)", async () => {
    const order = makeOrder({ biblioPrice: 14 });
    order.OrderProducts[0].renewalIntention = 'ADOPTE';
    prisma.orders.findUnique.mockResolvedValue(order);

    await expect(createAdoptionSession(ORDER_ID, PRODUCT_ID, USER_ID))
      .rejects.toMatchObject({ status: 400 });
  });
});
