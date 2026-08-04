/* src/app/api/webhooks/stripe/__tests__/stripe.webhook.test.js
 *
 * Tests du handler POST /api/webhooks/stripe
 * Scénario principal : checkout.session.completed → nouvelle commande
 *
 * @jest-environment node
 */

// ─────────────────────────────────────────────────────────────
//  Mocks Next.js — doivent être AVANT tout import de route.js
// ─────────────────────────────────────────────────────────────
jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue('stripe-sig-test'),
  }),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      body,
      json: async () => body,
    })),
  },
}));

// ─────────────────────────────────────────────────────────────
//  Mock Stripe — factory inline (pas de var externe hoistée)
// ─────────────────────────────────────────────────────────────
jest.mock('stripe', () => {
  const mockConstructEvent = jest.fn();
  const mockSubscriptionsUpdate = jest.fn().mockResolvedValue({});

  const MockStripe = jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { update: mockSubscriptionsUpdate },
  }));

  // Expose les fns de contrôle sur le constructeur lui-même
  MockStripe._mockConstructEvent = mockConstructEvent;
  MockStripe._mockSubscriptionsUpdate = mockSubscriptionsUpdate;

  return MockStripe;
});

// ─────────────────────────────────────────────────────────────
//  Mock createOrder
// ─────────────────────────────────────────────────────────────
jest.mock('@/lib/modules/orders/order.service', () => ({
  createOrder: jest.fn().mockResolvedValue({ id: 99 }),
}));

// ─────────────────────────────────────────────────────────────
//  Mock Prisma — factory inline
// ─────────────────────────────────────────────────────────────
jest.mock('@/lib/core/database', () => {
  const db = {
    products: { findMany: jest.fn() },
    orders: {
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
    },
    cartItem: { deleteMany: jest.fn().mockResolvedValue({}) },
    promoCodeUsage: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };
  return { __esModule: true, default: db };
});

// ─────────────────────────────────────────────────────────────
//  Mock global fetch (emails Brevo inline dans le webhook)
// ─────────────────────────────────────────────────────────────
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({}),
});

// ─────────────────────────────────────────────────────────────
//  Imports après mocks
// ─────────────────────────────────────────────────────────────
import { POST } from '../route';
import Stripe from 'stripe';
import prisma from '@/lib/core/database';
import { createOrder } from '@/lib/modules/orders/order.service';

// Raccourcis vers les mocks de contrôle
const getStripeInstance = () => Stripe.mock.results[0]?.value ?? Stripe();
const getConstructEvent = () => Stripe._mockConstructEvent;

// ─────────────────────────────────────────────────────────────
//  Données de test
// ─────────────────────────────────────────────────────────────
const LEGO = { id: 1, name: 'Lego City', price: 16, biblioPrice: 14, stock: 5 };
const BABY_DRY = { id: 2, name: 'Baby dry', price: 0, biblioPrice: null, stock: 3 };

function makeRequest() {
  return { text: jest.fn().mockResolvedValue('{}') };
}

function buildSessionEvent(metadata, amountTotal = 3400, subscriptionId = 'sub_test_123') {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_abc',
        amount_total: amountTotal,
        subscription: subscriptionId,
        metadata,
      },
    },
  };
}

function buildCartSnapshot(items) {
  return JSON.stringify(items.map((i) => ({ id: i.productId, q: i.quantity, intent: i.intent })));
}

const BASE_METADATA = {
  userId: '10',
  cartId: '5',
  shippingName: 'Alice Dupont',
  shippingAddress: '12 rue des Lilas',
  shippingZip: '75000',
  shippingCity: 'Paris',
  shippingPhone: '0600000000',
  mondialRelayPointId: 'null',
};

// ─────────────────────────────────────────────────────────────
//  SUITE
// ─────────────────────────────────────────────────────────────
describe('Webhook Stripe — checkout.session.completed : nouvelle commande', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy';
    // Réinitialisation des mocks stateful
    prisma.orders.findFirst.mockResolvedValue(null);
    createOrder.mockResolvedValue({ id: 99 });
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  // ──────────────────────────────────────────────────────────
  //  CAS 1 : 100 % Location
  // ──────────────────────────────────────────────────────────
  describe('Panier 100% Location (RENTAL)', () => {
    it('appelle createOrder avec items RENTAL uniquement', async () => {
      const snapshot = buildCartSnapshot([{ productId: BABY_DRY.id, quantity: 1, intent: 'RENTAL' }]);
      prisma.products.findMany.mockResolvedValue([BABY_DRY]);

      const event = buildSessionEvent({ ...BASE_METADATA, cartSnapshot: snapshot });
      getConstructEvent().mockReturnValue(event);

      const res = await POST(makeRequest());
      expect(res.status).toBe(200);
      expect(createOrder).toHaveBeenCalledTimes(1);

      const [userId, cartData, totalAmount, , stripeSubId] = createOrder.mock.calls[0];
      expect(userId).toBe(10);
      expect(totalAmount).toBe(34);
      expect(stripeSubId).toBe('sub_test_123');
      expect(cartData.items).toHaveLength(1);
      expect(cartData.items[0]).toMatchObject({ productId: BABY_DRY.id, intent: 'RENTAL' });
    });
  });

  // ──────────────────────────────────────────────────────────
  //  CAS 2 : 100 % Achat
  // ──────────────────────────────────────────────────────────
  describe('Panier 100% Achat (PURCHASE)', () => {
    it('appelle createOrder avec items PURCHASE uniquement', async () => {
      const snapshot = buildCartSnapshot([{ productId: LEGO.id, quantity: 1, intent: 'PURCHASE' }]);
      prisma.products.findMany.mockResolvedValue([LEGO]);

      const event = buildSessionEvent({ ...BASE_METADATA, cartSnapshot: snapshot }, 1400, null);
      getConstructEvent().mockReturnValue(event);

      const res = await POST(makeRequest());
      expect(res.status).toBe(200);
      expect(createOrder).toHaveBeenCalledTimes(1);

      const [, cartData, totalAmount, , stripeSubId] = createOrder.mock.calls[0];
      expect(totalAmount).toBe(14);
      expect(stripeSubId).toBeNull();
      expect(cartData.items[0]).toMatchObject({ productId: LEGO.id, intent: 'PURCHASE' });
    });
  });

  // ──────────────────────────────────────────────────────────
  //  CAS 3 : Hybride (Location + Achat)
  // ──────────────────────────────────────────────────────────
  describe('Panier Hybride (RENTAL + PURCHASE)', () => {
    it('transmet les deux intents séparément à createOrder', async () => {
      const snapshot = buildCartSnapshot([
        { productId: BABY_DRY.id, quantity: 1, intent: 'RENTAL' },
        { productId: LEGO.id, quantity: 1, intent: 'PURCHASE' },
      ]);
      prisma.products.findMany.mockResolvedValue([BABY_DRY, LEGO]);

      const event = buildSessionEvent({ ...BASE_METADATA, cartSnapshot: snapshot }, 3400);
      getConstructEvent().mockReturnValue(event);

      const res = await POST(makeRequest());
      expect(res.status).toBe(200);
      expect(createOrder).toHaveBeenCalledTimes(1);

      const [, cartData, totalAmount] = createOrder.mock.calls[0];
      expect(totalAmount).toBe(34);

      const rentalItems = cartData.items.filter((i) => i.intent === 'RENTAL');
      const purchaseItems = cartData.items.filter((i) => i.intent === 'PURCHASE');
      expect(rentalItems).toHaveLength(1);
      expect(rentalItems[0].productId).toBe(BABY_DRY.id);
      expect(purchaseItems).toHaveLength(1);
      expect(purchaseItems[0].productId).toBe(LEGO.id);
    });

    it('attache le product BDD complet (avec biblioPrice) à chaque item du panier virtuel', async () => {
      const snapshot = buildCartSnapshot([
        { productId: BABY_DRY.id, quantity: 1, intent: 'RENTAL' },
        { productId: LEGO.id, quantity: 1, intent: 'PURCHASE' },
      ]);
      prisma.products.findMany.mockResolvedValue([BABY_DRY, LEGO]);

      const event = buildSessionEvent({ ...BASE_METADATA, cartSnapshot: snapshot });
      getConstructEvent().mockReturnValue(event);

      await POST(makeRequest());

      const [, cartData] = createOrder.mock.calls[0];
      const legoItem = cartData.items.find((i) => i.productId === LEGO.id);
      expect(legoItem.product).toMatchObject({ id: LEGO.id, name: 'Lego City', biblioPrice: 14 });
    });
  });

  // ──────────────────────────────────────────────────────────
  //  Idempotence
  // ──────────────────────────────────────────────────────────
  describe('Idempotence', () => {
    it("n'appelle pas createOrder si la commande existe déjà pour ce subscriptionId", async () => {
      const snapshot = buildCartSnapshot([{ productId: BABY_DRY.id, quantity: 1, intent: 'RENTAL' }]);
      prisma.products.findMany.mockResolvedValue([BABY_DRY]);
      prisma.orders.findFirst.mockResolvedValue({ id: 88, stripeSubscriptionId: 'sub_test_123' });

      const event = buildSessionEvent({ ...BASE_METADATA, cartSnapshot: snapshot });
      getConstructEvent().mockReturnValue(event);

      const res = await POST(makeRequest());
      expect(res.status).toBe(200);
      expect(createOrder).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────
  //  Vidage du panier
  // ──────────────────────────────────────────────────────────
  describe('Vidage du panier après création', () => {
    it('supprime les cartItems avec le cartId issu des métadonnées', async () => {
      const snapshot = buildCartSnapshot([{ productId: BABY_DRY.id, quantity: 1, intent: 'RENTAL' }]);
      prisma.products.findMany.mockResolvedValue([BABY_DRY]);

      const event = buildSessionEvent({ ...BASE_METADATA, cartSnapshot: snapshot });
      getConstructEvent().mockReturnValue(event);

      await POST(makeRequest());

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 5 } });
    });
  });

  // ──────────────────────────────────────────────────────────
  //  Sécurité — signature invalide
  // ──────────────────────────────────────────────────────────
  describe('Sécurité', () => {
    it('retourne 400 si la signature Stripe est invalide', async () => {
      getConstructEvent().mockImplementation(() => {
        throw new Error('Signature mismatch');
      });

      const res = await POST(makeRequest());
      expect(res.status).toBe(400);
      expect(createOrder).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────
  //  Données manquantes
  // ──────────────────────────────────────────────────────────
  describe('Données manquantes', () => {
    it('retourne 500 si cartSnapshot est absent des métadonnées', async () => {
      const event = buildSessionEvent({ ...BASE_METADATA }); // pas de cartSnapshot
      getConstructEvent().mockReturnValue(event);

      const res = await POST(makeRequest());
      expect(res.status).toBe(500);
      expect(createOrder).not.toHaveBeenCalled();
    });

    it('retourne 500 si tous les produits sont introuvables en BDD', async () => {
      const snapshot = buildCartSnapshot([{ productId: 999, quantity: 1, intent: 'RENTAL' }]);
      prisma.products.findMany.mockResolvedValue([]); // produit inconnu

      const event = buildSessionEvent({ ...BASE_METADATA, cartSnapshot: snapshot });
      getConstructEvent().mockReturnValue(event);

      const res = await POST(makeRequest());
      expect(res.status).toBe(500);
    });
  });

  // ──────────────────────────────────────────────────────────
  //  Non-régression — autre type d'événement
  // ──────────────────────────────────────────────────────────
  describe("Non-régression — événement invoice.paid", () => {
    it('répond 200 sans appeler createOrder', async () => {
      const event = {
        type: 'invoice.paid',
        data: {
          object: {
            id: 'in_test',
            subscription: null,
            lines: { data: [] },
          },
        },
      };
      getConstructEvent().mockReturnValue(event);
      prisma.orders.findFirst.mockResolvedValue(null);

      const res = await POST(makeRequest());
      expect(res.status).toBe(200);
      expect(createOrder).not.toHaveBeenCalled();
    });
  });
});

// ─────────────────────────────────────────────────────────────
//  Non-régression — contrat de createOrder
// ─────────────────────────────────────────────────────────────
describe('Non-régression — createOrder sans champ intent', () => {
  it('createOrder est une fonction exportée (contrat public stable)', () => {
    // EXCHANGE et REFILL ont leurs propres fonctions (initiateExchange / initiateRefill).
    // createOrder reste le point d'entrée pour les nouvelles commandes (location + achat).
    expect(typeof createOrder).toBe('function');
  });
});
