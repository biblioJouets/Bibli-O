import { emailService } from '../email.service';
import { sendBrevoTemplate } from '@/lib/core/brevo/client';
import { getSuggestedPlan } from '@/lib/core/utils/subscription';

jest.mock('@/lib/core/brevo/client', () => ({
  sendBrevoTemplate: jest.fn().mockResolvedValue({ success: true }),
}));

// On mocke getSuggestedPlan pour maîtriser les prix dans nos assertions
jest.mock('@/lib/core/utils/subscription', () => ({
  getSuggestedPlan: jest.fn(),
}));

// ─────────────────────────────────────────────────────────────
//  DONNÉES DE BASE réutilisables
// ─────────────────────────────────────────────────────────────
const BASE_SHIPPING = {
  shippingAddress: '12 rue des Lilas',
  shippingZip: '75000',
  shippingCity: 'Paris',
  mondialRelayPointId: 'DOMICILE',
};

const makeOrder = (products, totalAmount = '0.00') => ({
  id: 42,
  totalAmount,
  user: { email: 'client@test.fr', firstName: 'Alice' },
  shippingData: BASE_SHIPPING,
  products,
});

// Produits de test
const LEGO_PURCHASE = {
  name: 'Lego City',
  intent: 'PURCHASE',
  biblioPrice: 14,
  price: 16,
};

const BABY_DRY_RENTAL = {
  name: 'Baby dry',
  intent: 'RENTAL',
  price: 0,
  biblioPrice: null,
};

const PUZZLE_RENTAL = {
  name: 'Puzzle Géant',
  intent: 'RENTAL',
  price: 0,
  biblioPrice: null,
};

// ─────────────────────────────────────────────────────────────
//  SUITE PRINCIPALE
// ─────────────────────────────────────────────────────────────
describe('emailService.sendOrderConfirmation — Panier Hybride', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Par défaut getSuggestedPlan retourne un objet réaliste
    getSuggestedPlan.mockReturnValue({ name: 'Box 1 Jouet', price: '20€', priceNumber: 20 });
  });

  // ──────────────────────────────────────────────────────────
  //  CAS 1 : Commande 100% Location
  // ──────────────────────────────────────────────────────────
  describe('Commande 100% Location (RENTAL)', () => {
    it('envoie RENTAL_PRODUCTS, pas de PURCHASED_PRODUCTS, et un SUB_PRICE correct', async () => {
      getSuggestedPlan.mockReturnValue({ name: 'Box 1 Jouet', price: '20€', priceNumber: 20 });

      const order = makeOrder([BABY_DRY_RENTAL], '20.00');
      await emailService.sendOrderConfirmation(order);

      expect(sendBrevoTemplate).toHaveBeenCalledTimes(1);
      const [, templateId, params] = sendBrevoTemplate.mock.calls[0];

      expect(templateId).toBe(8);

      // Articles loués présents
      expect(params.RENTAL_PRODUCTS).toEqual([{ NAME: 'Baby dry' }]);

      // Aucun article acheté
      expect(params.PURCHASED_PRODUCTS).toBeNull();

      // Prix abonnement calculé par getSuggestedPlan(1)
      expect(getSuggestedPlan).toHaveBeenCalledWith(1);
      expect(params.SUB_PRICE).toBe('20.00');

      // Total du jour = totalAmount brut
      expect(params.TOTAL_TODAY).toBe('20.00');
    });

    it('calcule le SUB_PRICE sur le nombre exact de jouets loués', async () => {
      getSuggestedPlan.mockReturnValue({ name: 'Box 2 Jouets', price: '25€', priceNumber: 25 });

      const order = makeOrder([BABY_DRY_RENTAL, PUZZLE_RENTAL], '25.00');
      await emailService.sendOrderConfirmation(order);

      expect(getSuggestedPlan).toHaveBeenCalledWith(2);
      const [, , params] = sendBrevoTemplate.mock.calls[0];
      expect(params.SUB_PRICE).toBe('25.00');
    });
  });

  // ──────────────────────────────────────────────────────────
  //  CAS 2 : Commande 100% Achat
  // ──────────────────────────────────────────────────────────
  describe('Commande 100% Achat (PURCHASE)', () => {
    it('envoie PURCHASED_PRODUCTS avec le bon PRICE, pas de RENTAL_PRODUCTS, SUB_PRICE nul', async () => {
      const order = makeOrder([LEGO_PURCHASE], '14.00');
      await emailService.sendOrderConfirmation(order);

      expect(sendBrevoTemplate).toHaveBeenCalledTimes(1);
      const [, , params] = sendBrevoTemplate.mock.calls[0];

      // Aucun article loué
      expect(params.RENTAL_PRODUCTS).toBeNull();

      // Article acheté avec son prix (biblioPrice prioritaire)
      expect(params.PURCHASED_PRODUCTS).toEqual([
        { NAME: 'Lego City', PRICE: '14.00' },
      ]);

      // Pas d'abonnement → SUB_PRICE nul
      expect(getSuggestedPlan).not.toHaveBeenCalled();
      expect(params.SUB_PRICE).toBeNull();

      // Total du jour = prix d'achat
      expect(params.TOTAL_TODAY).toBe('14.00');
    });

    it('utilise price en fallback si biblioPrice est absent', async () => {
      const productSansbiblioPrice = { name: 'Kapla', intent: 'PURCHASE', biblioPrice: null, price: 18 };
      const order = makeOrder([productSansbiblioPrice], '18.00');
      await emailService.sendOrderConfirmation(order);

      const [, , params] = sendBrevoTemplate.mock.calls[0];
      expect(params.PURCHASED_PRODUCTS).toEqual([{ NAME: 'Kapla', PRICE: '18.00' }]);
    });
  });

  // ──────────────────────────────────────────────────────────
  //  CAS 3 : Commande Hybride (Location + Achat)
  // ──────────────────────────────────────────────────────────
  describe('Commande Hybride (RENTAL + PURCHASE)', () => {
    it('sépare correctement les articles et additionne le TOTAL_TODAY', async () => {
      // 20€/mois d'abonnement (1 jouet loué) + 14€ achat Lego = 34€ aujourd'hui
      getSuggestedPlan.mockReturnValue({ name: 'Box 1 Jouet', price: '20€', priceNumber: 20 });

      const order = makeOrder([BABY_DRY_RENTAL, LEGO_PURCHASE], '34.00');
      await emailService.sendOrderConfirmation(order);

      const [, , params] = sendBrevoTemplate.mock.calls[0];

      // Jouets loués séparés
      expect(params.RENTAL_PRODUCTS).toEqual([{ NAME: 'Baby dry' }]);

      // Jouets achetés séparés avec prix
      expect(params.PURCHASED_PRODUCTS).toEqual([
        { NAME: 'Lego City', PRICE: '14.00' },
      ]);

      // getSuggestedPlan appelé avec le nombre de jouets LOUÉS uniquement (1)
      expect(getSuggestedPlan).toHaveBeenCalledWith(1);
      expect(params.SUB_PRICE).toBe('20.00');

      // Total = abonnement 1er mois + achat
      expect(params.TOTAL_TODAY).toBe('34.00');
    });

    it('gère plusieurs jouets loués ET plusieurs jouets achetés', async () => {
      getSuggestedPlan.mockReturnValue({ name: 'Box 2 Jouets', price: '25€', priceNumber: 25 });

      const secondPurchase = { name: 'Playmobil', intent: 'PURCHASE', biblioPrice: 22, price: 25 };
      const order = makeOrder(
        [BABY_DRY_RENTAL, PUZZLE_RENTAL, LEGO_PURCHASE, secondPurchase],
        '61.00'
      );
      await emailService.sendOrderConfirmation(order);

      const [, , params] = sendBrevoTemplate.mock.calls[0];

      expect(params.RENTAL_PRODUCTS).toHaveLength(2);
      expect(params.PURCHASED_PRODUCTS).toHaveLength(2);
      expect(getSuggestedPlan).toHaveBeenCalledWith(2);
      expect(params.SUB_PRICE).toBe('25.00');
    });
  });

  // ──────────────────────────────────────────────────────────
  //  DÉTAILS COMMUNS
  // ──────────────────────────────────────────────────────────
  describe('Champs communs du payload', () => {
    it('inclut le PRENOM du client et un COMMANDE_ID formaté', async () => {
      const order = makeOrder([BABY_DRY_RENTAL], '20.00');
      await emailService.sendOrderConfirmation(order);

      const [email, , params] = sendBrevoTemplate.mock.calls[0];

      expect(email).toBe('client@test.fr');
      expect(params.PRENOM).toBe('Alice');
      // COMMANDE_ID = CMD{JJMMAA}{HH}{MM}-42
      expect(params.COMMANDE_ID).toMatch(/^CMD\d{6}\d{4}-42$/);
    });

    it('détecte la livraison en Point Relais quand mondialRelayPointId est défini', async () => {
      const order = makeOrder([BABY_DRY_RENTAL], '20.00');
      order.shippingData.mondialRelayPointId = 'FR001234';
      await emailService.sendOrderConfirmation(order);

      const [, , params] = sendBrevoTemplate.mock.calls[0];
      expect(params.LIVRAISON_MODE).toBe('Point Relais');
    });

    it('envoie malgré une erreur Brevo (ne propage pas)', async () => {
      sendBrevoTemplate.mockRejectedValueOnce(new Error('Brevo down'));
      const order = makeOrder([BABY_DRY_RENTAL], '20.00');

      // Ne doit pas rejeter — l'erreur est catchée dans le service
      await expect(emailService.sendOrderConfirmation(order)).resolves.toBeUndefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────
//  notifyAdminNewOrder — smoke tests
// ─────────────────────────────────────────────────────────────
describe('emailService.notifyAdminNewOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSuggestedPlan.mockReturnValue({ name: 'Box 1 Jouet', price: '20€', priceNumber: 20 });
  });

  it("envoie au bon email admin avec PRENOM='Admin'", async () => {
    const order = makeOrder([BABY_DRY_RENTAL], '20.00');
    await emailService.notifyAdminNewOrder(order);

    const [email, , params] = sendBrevoTemplate.mock.calls[0];
    expect(email).toBe('contact@bibliojouets.com');
    expect(params.PRENOM).toBe('Admin');
    expect(params.COMMANDE_ID).toBe('42');
  });

  it('applique la même séparation RENTAL / PURCHASE que pour le client', async () => {
    const order = makeOrder([BABY_DRY_RENTAL, LEGO_PURCHASE], '34.00');
    await emailService.notifyAdminNewOrder(order);

    const [, , params] = sendBrevoTemplate.mock.calls[0];
    expect(params.RENTAL_PRODUCTS).toEqual([{ NAME: 'Baby dry' }]);
    expect(params.PURCHASED_PRODUCTS).toEqual([{ NAME: 'Lego City', PRICE: '14.00' }]);
  });
});

describe('emailService.sendGiftCardEmails', () => {
  const buyer = {
    email: 'acheteur@test.fr',
    firstName: 'Lucas',
    lastName: 'Martin',
  };

  const expectedDate = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_URL = 'https://www.bibliojouets.fr';
  });

  function callByTemplate(templateId) {
    return sendBrevoTemplate.mock.calls.find((call) => call[1] === templateId);
  }

  it('envoie les templates 40, 42 et 43 pour une carte par e-mail offerte', async () => {
    await emailService.sendGiftCardEmails({
      buyer,
      code: 'BJ-AB12-CD34',
      amount: 50,
      method: 'EMAIL',
      recipientName: 'Camille Martin',
      recipientEmail: 'camille@test.fr',
      message: 'Joyeux anniversaire',
      orderId: 88,
    });

    expect(sendBrevoTemplate).toHaveBeenCalledTimes(3);

    const [buyerEmail, buyerTemplate, buyerParams] = callByTemplate(40);
    expect(buyerEmail).toBe('acheteur@test.fr');
    expect(buyerTemplate).toBe(40);
    expect(buyerParams).toEqual({
      ORDER_ID: '88',
      BUYER_FIRSTNAME: 'Lucas',
      DATE: expectedDate,
      AMOUNT: '50',
      CODE: 'BJ-AB12-CD34',
      TOTAL_PAID: '50.00',
      DELIVERY_STATUS_TEXT: 'Le code a été envoyé par e-mail à Camille Martin.',
      ORDERS_URL: 'https://www.bibliojouets.fr/mon-compte/commandes',
    });

    const [beneficiaryEmail, , beneficiaryParams] = callByTemplate(42);
    expect(beneficiaryEmail).toBe('camille@test.fr');
    expect(beneficiaryParams).toEqual({
      AMOUNT: '50',
      RECIPIENT_NAME: 'Camille Martin',
      BUYER_NAME: 'Lucas Martin',
      MESSAGE: 'Joyeux anniversaire',
      CODE: 'BJ-AB12-CD34',
      ACTIVATION_URL: 'https://www.bibliojouets.fr/mon-compte',
    });

    const [adminEmail, , adminParams] = callByTemplate(43);
    expect(adminEmail).toBe('contact@bibliojouets.com');
    expect(adminParams).toMatchObject({
      ORDER_ID: '88',
      DATE: expectedDate,
      AMOUNT: '50',
      CODE: 'BJ-AB12-CD34',
      BUYER_NAME: 'Lucas Martin',
      BUYER_EMAIL: 'acheteur@test.fr',
      RECIPIENT_NAME: 'Camille Martin',
      RECIPIENT_EMAIL: 'camille@test.fr',
      MESSAGE: 'Joyeux anniversaire',
      ADMIN_URL: 'https://www.bibliojouets.fr/admin/orders',
    });
  });

  it('envoie le code à l’acheteur quand il n’y a pas de bénéficiaire tiers', async () => {
    await emailService.sendGiftCardEmails({
      buyer,
      code: 'BJ-AAAA-BBBB',
      amount: 30,
      method: 'EMAIL',
      recipientName: null,
      recipientEmail: null,
      message: '',
      orderId: 12,
    });

    const [, , buyerParams] = callByTemplate(40);
    expect(buyerParams.DELIVERY_STATUS_TEXT).toBe('Le code vous a été envoyé par e-mail.');
    expect(buyerParams.TOTAL_PAID).toBe('30.00');

    const [beneficiaryEmail, , beneficiaryParams] = callByTemplate(42);
    expect(beneficiaryEmail).toBe('acheteur@test.fr');
    expect(beneficiaryParams.RECIPIENT_NAME).toBe('Lucas');
    expect(beneficiaryParams.MESSAGE).toBe(
      'Un petit cadeau pour jouer encore et encore. Louez, Jouez, Échangez !'
    );
  });

  it('envoie les templates 41, 42 et 44 pour une carte postale', async () => {
    await emailService.sendGiftCardEmails({
      buyer,
      code: 'BJ-POST-0001',
      amount: 50,
      method: 'POSTAL',
      recipientName: 'Camille Martin',
      recipientEmail: 'camille@test.fr',
      message: 'Pour toi',
      orderId: 90,
      shipping: {
        shippingName: 'Camille Martin',
        shippingAddress: '4 rue des Jouets',
        shippingZip: '44000',
        shippingCity: 'Nantes',
        shippingPhone: '0600000000',
      },
    });

    expect(callByTemplate(40)).toBeUndefined();
    expect(callByTemplate(43)).toBeUndefined();

    const [buyerEmail, , buyerParams] = callByTemplate(41);
    expect(buyerEmail).toBe('acheteur@test.fr');
    expect(buyerParams).toEqual({
      ORDER_ID: '90',
      BUYER_FIRSTNAME: 'Lucas',
      AMOUNT: '50',
      RECIPIENT_NAME: 'Camille Martin',
      TOTAL_PAID: '52.00',
      SHIPPING_NAME: 'Camille Martin',
      SHIPPING_ADDRESS: '4 rue des Jouets',
      SHIPPING_ZIP: '44000',
      SHIPPING_CITY: 'Nantes',
      CODE: 'BJ-POST-0001',
      ORDERS_URL: 'https://www.bibliojouets.fr/mon-compte/commandes',
    });

    expect(callByTemplate(42)[0]).toBe('camille@test.fr');

    const [adminEmail, , adminParams] = callByTemplate(44);
    expect(adminEmail).toBe('contact@bibliojouets.com');
    expect(adminParams).toMatchObject({
      ORDER_ID: '90',
      AMOUNT: '50',
      TOTAL_PAID: '52.00',
      CODE: 'BJ-POST-0001',
      SHIPPING_NAME: 'Camille Martin',
      SHIPPING_ADDRESS: '4 rue des Jouets',
      SHIPPING_ZIP: '44000',
      SHIPPING_CITY: 'Nantes',
      SHIPPING_PHONE: '0600000000',
      BUYER_NAME: 'Lucas Martin',
      BUYER_EMAIL: 'acheteur@test.fr',
      RECIPIENT_NAME: 'Camille Martin',
      MESSAGE: 'Pour toi',
      ADMIN_URL: 'https://www.bibliojouets.fr/admin/orders',
    });
  });

  it('signale un échec Brevo pour que la commande reste tracée', async () => {
    sendBrevoTemplate.mockResolvedValue({ success: false, error: 'Brevo down' });

    await expect(emailService.sendGiftCardEmails({
      buyer,
      code: 'BJ-FAIL-0001',
      amount: 20,
      method: 'EMAIL',
      orderId: 3,
    })).rejects.toThrow(/Échec d'envoi/);
  });
});
