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
