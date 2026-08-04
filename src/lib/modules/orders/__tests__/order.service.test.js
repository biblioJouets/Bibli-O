/* src/lib/modules/orders/__tests__/order.service.test.js
 *
 * Tests de createOrder — vérifie que le payload e-mail envoyé à Brevo
 * contient la bonne séparation RENTAL/PURCHASE selon les 3 scénarios :
 *   1. 100 % Location
 *   2. 100 % Achat
 *   3. Hybride (Location + Achat)
 * + Non-régression sur les commandes sans champ `intent`
 */
import { createOrder } from '../order.service';
import { emailService } from '../../emails/email.service';

// ─────────────────────────────────────────────────────────────
//  Mock Prisma
// ─────────────────────────────────────────────────────────────
jest.mock('@/lib/core/database', () => {
  const tx = {
    products: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    orders: {
      create: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
    },
  };

  const mockClient = {
    $transaction: jest.fn(async (fn) => fn(tx)),
    _tx: tx,
  };

  return { __esModule: true, default: mockClient };
});

// ─────────────────────────────────────────────────────────────
//  Mock emailService (ce que l'on veut inspecter)
// ─────────────────────────────────────────────────────────────
jest.mock('../../emails/email.service', () => ({
  emailService: {
    sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    notifyAdminNewOrder: jest.fn().mockResolvedValue(undefined),
  },
}));

// ─────────────────────────────────────────────────────────────
//  Helpers de test
// ─────────────────────────────────────────────────────────────
import prisma from '@/lib/core/database';

const BASE_SHIPPING = {
  shippingName: 'Alice Dupont',
  shippingAddress: '12 rue des Lilas',
  shippingZip: '75000',
  shippingCity: 'Paris',
  shippingPhone: '0600000000',
  mondialRelayPointId: null,
};

const LEGO = { id: 1, name: 'Lego City', price: 16, biblioPrice: 14, stock: 5 };
const BABY_DRY = { id: 2, name: 'Baby dry', price: 0, biblioPrice: null, stock: 3 };
const PUZZLE = { id: 3, name: 'Puzzle Géant', price: 0, biblioPrice: null, stock: 2 };

const makeCartItem = (product, intent = 'RENTAL', quantity = 1) => ({
  productId: product.id,
  quantity,
  intent,
  product, // product info portée par le webhook
});

const USER = { id: 10, email: 'client@test.fr', firstName: 'Alice', lastName: 'Dupont' };
function makeCreatedOrder(totalAmount) {
  return { id: 99, totalAmount, status: 'PREPARING' };
}

function setupPrismaMocks(products, totalAmount = 20) {
  const tx = prisma._tx;
  tx.products.findUnique.mockImplementation(({ where }) =>
    Promise.resolve(products.find((p) => p.id === where.id) ?? null)
  );
  tx.orders.create.mockResolvedValue(makeCreatedOrder(totalAmount));
  tx.users.findUnique.mockResolvedValue(USER);
}

// ─────────────────────────────────────────────────────────────
//  SUITE — createOrder : payload e-mail
// ─────────────────────────────────────────────────────────────
describe('createOrder — payload e-mail envoyé à emailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────────
  //  CAS 1 : 100 % Location
  // ──────────────────────────────────────────────────────────
  describe('Commande 100% Location (RENTAL)', () => {
    it('transmet des products avec intent RENTAL uniquement', async () => {
      setupPrismaMocks([BABY_DRY]);

      const cartData = { items: [makeCartItem(BABY_DRY, 'RENTAL')] };
      await createOrder(USER.id, cartData, 20, BASE_SHIPPING, 'sub_abc');

      expect(emailService.sendOrderConfirmation).toHaveBeenCalledTimes(1);
      const [orderInfo] = emailService.sendOrderConfirmation.mock.calls[0];

      expect(orderInfo.products).toHaveLength(1);
      expect(orderInfo.products[0]).toMatchObject({ name: 'Baby dry', intent: 'RENTAL' });
      // Aucun article PURCHASE dans le payload
      expect(orderInfo.products.filter((p) => p.intent === 'PURCHASE')).toHaveLength(0);
    });

    it('envoie aussi la notif admin avec le même payload', async () => {
      setupPrismaMocks([BABY_DRY]);

      const cartData = { items: [makeCartItem(BABY_DRY, 'RENTAL')] };
      await createOrder(USER.id, cartData, 20, BASE_SHIPPING, 'sub_abc');

      expect(emailService.notifyAdminNewOrder).toHaveBeenCalledTimes(1);
      const [adminOrderInfo] = emailService.notifyAdminNewOrder.mock.calls[0];
      expect(adminOrderInfo.products[0].intent).toBe('RENTAL');
    });
  });

  // ──────────────────────────────────────────────────────────
  //  CAS 2 : 100 % Achat
  // ──────────────────────────────────────────────────────────
  describe('Commande 100% Achat (PURCHASE)', () => {
    it('transmet des products avec intent PURCHASE uniquement', async () => {
      setupPrismaMocks([LEGO]);

      const cartData = { items: [makeCartItem(LEGO, 'PURCHASE')] };
      await createOrder(USER.id, cartData, 14, BASE_SHIPPING, null);

      expect(emailService.sendOrderConfirmation).toHaveBeenCalledTimes(1);
      const [orderInfo] = emailService.sendOrderConfirmation.mock.calls[0];

      expect(orderInfo.products).toHaveLength(1);
      expect(orderInfo.products[0]).toMatchObject({ name: 'Lego City', intent: 'PURCHASE', biblioPrice: 14 });
      expect(orderInfo.products.filter((p) => p.intent === 'RENTAL')).toHaveLength(0);
    });

    it('totalAmount transmis correspond au montant reçu', async () => {
      setupPrismaMocks([LEGO], 14);

      const cartData = { items: [makeCartItem(LEGO, 'PURCHASE')] };
      await createOrder(USER.id, cartData, 14, BASE_SHIPPING, null);

      const [orderInfo] = emailService.sendOrderConfirmation.mock.calls[0];
      expect(orderInfo.totalAmount).toBe(14);
    });
  });

  // ──────────────────────────────────────────────────────────
  //  CAS 3 : Hybride (Location + Achat)
  // ──────────────────────────────────────────────────────────
  describe('Commande Hybride (RENTAL + PURCHASE)', () => {
    it('sépare correctement les deux intents dans le payload', async () => {
      setupPrismaMocks([BABY_DRY, LEGO]);

      const cartData = {
        items: [
          makeCartItem(BABY_DRY, 'RENTAL'),
          makeCartItem(LEGO, 'PURCHASE'),
        ],
      };
      await createOrder(USER.id, cartData, 34, BASE_SHIPPING, 'sub_hybrid');

      const [orderInfo] = emailService.sendOrderConfirmation.mock.calls[0];

      const rentals = orderInfo.products.filter((p) => p.intent === 'RENTAL');
      const purchases = orderInfo.products.filter((p) => p.intent === 'PURCHASE');

      expect(rentals).toHaveLength(1);
      expect(rentals[0].name).toBe('Baby dry');

      expect(purchases).toHaveLength(1);
      expect(purchases[0].name).toBe('Lego City');
      expect(purchases[0].biblioPrice).toBe(14);
    });

    it('transmet le bon totalAmount pour un panier mixte', async () => {
      setupPrismaMocks([BABY_DRY, LEGO, PUZZLE], 61);

      const cartData = {
        items: [
          makeCartItem(BABY_DRY, 'RENTAL'),
          makeCartItem(PUZZLE, 'RENTAL'),
          makeCartItem(LEGO, 'PURCHASE'),
        ],
      };
      await createOrder(USER.id, cartData, 61, BASE_SHIPPING, 'sub_hybrid_multi');

      const [orderInfo] = emailService.sendOrderConfirmation.mock.calls[0];
      expect(orderInfo.totalAmount).toBe(61);

      const rentals = orderInfo.products.filter((p) => p.intent === 'RENTAL');
      const purchases = orderInfo.products.filter((p) => p.intent === 'PURCHASE');
      expect(rentals).toHaveLength(2);
      expect(purchases).toHaveLength(1);
    });
  });

  // ──────────────────────────────────────────────────────────
  //  CAS 4 : Non-régression — intent absent / undefined
  // ──────────────────────────────────────────────────────────
  describe('Non-régression — champ intent absent', () => {
    it("traite un item sans intent comme RENTAL (valeur par défaut)", async () => {
      setupPrismaMocks([BABY_DRY]);

      // Simule un ancien flow où intent n'est pas transmis dans le cart
      const cartData = { items: [{ productId: BABY_DRY.id, quantity: 1, product: BABY_DRY }] };
      await createOrder(USER.id, cartData, 20, BASE_SHIPPING, 'sub_legacy');

      const [orderInfo] = emailService.sendOrderConfirmation.mock.calls[0];
      // intent undefined → dans createOrder, isPurchase = false → conservé comme undefined dans products
      // Le emailService.js filtre : p.intent !== 'PURCHASE' → sera dans RENTAL_PRODUCTS
      expect(orderInfo.products[0].intent).toBeUndefined();
      // Aucun crash — la commande est bien créée
      expect(emailService.sendOrderConfirmation).toHaveBeenCalledTimes(1);
    });

    it('ne crashe pas si emailService échoue (erreur non propagée)', async () => {
      setupPrismaMocks([BABY_DRY]);
      emailService.sendOrderConfirmation.mockRejectedValueOnce(new Error('Brevo down'));
      emailService.notifyAdminNewOrder.mockRejectedValueOnce(new Error('Brevo down'));

      const cartData = { items: [makeCartItem(BABY_DRY, 'RENTAL')] };
      // La commande doit être retournée même si l'email échoue
      const result = await createOrder(USER.id, cartData, 20, BASE_SHIPPING, 'sub_err');
      expect(result).toMatchObject({ id: 99 });
    });
  });

  // ──────────────────────────────────────────────────────────
  //  STRUCTURE du payload commun
  // ──────────────────────────────────────────────────────────
  describe('Structure du payload orderInfo', () => {
    it('contient user.email, user.firstName, id, totalAmount, shippingData', async () => {
      setupPrismaMocks([BABY_DRY]);

      const cartData = { items: [makeCartItem(BABY_DRY, 'RENTAL')] };
      await createOrder(USER.id, cartData, 20, BASE_SHIPPING, 'sub_struct');

      const [orderInfo] = emailService.sendOrderConfirmation.mock.calls[0];
      expect(orderInfo.user.email).toBe(USER.email);
      expect(orderInfo.user.firstName).toBe(USER.firstName);
      expect(orderInfo.id).toBe(99);
      expect(orderInfo.totalAmount).toBe(20);
      expect(orderInfo.shippingData).toMatchObject(BASE_SHIPPING);
    });
  });
});
