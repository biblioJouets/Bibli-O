import { getSuggestedPlan } from '../subscription';

describe('Logique Abonnement (getSuggestedPlan)', () => {
  
  it('Suggère "Découverte" pour 1 ou 2 jouets', () => {
    expect(getSuggestedPlan(1).name).toBe("Découverte");
    expect(getSuggestedPlan(2).name).toBe("Découverte");
  });

  it('Suggère "Standard" pour 3 ou 4 jouets', () => {
    expect(getSuggestedPlan(3).name).toBe("Standard");
    expect(getSuggestedPlan(4).name).toBe("Standard");
  });

  it('Suggère "Premium" pour 5 ou 6 jouets', () => {
    expect(getSuggestedPlan(5).name).toBe("Premium");
    expect(getSuggestedPlan(6).name).toBe("Premium");
  });

  it('Suggère "Sur devis" pour plus de 6 jouets', () => {
    const plan = getSuggestedPlan(7);
    expect(plan.name).toBe("Sur devis");
    expect(plan.contactLink).toBe("/contact");
    expect(plan.price).toBeNull();
  });
});