import { AlertTriangle, CreditCard } from 'lucide-react';

/**
 * Affiche les bannières d'alerte prioritaires en haut du tableau de bord.
 * @param {{ orders: import('@prisma/client').Orders[] }} props
 */
export default function DashboardAlerts({ orders }) {
  const today = new Date();

  // Alerte paiement échoué : ordre CANCELLED avec stripeSubscriptionId
  const failedPayment = orders.find(
    (o) => o.status === 'CANCELLED' && o.stripeSubscriptionId
  );

  // Alerte retour en retard : produit avec rentalEndDate dépassée sur commande ACTIVE
  const overdueItems = orders
    .filter((o) => o.status === 'ACTIVE')
    .flatMap((o) => o.OrderProducts)
    .filter((op) => op.rentalEndDate && new Date(op.rentalEndDate) < today);

  if (!failedPayment && overdueItems.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mb-6">
      {failedPayment && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-[25px] border"
          style={{ background: '#FFD9DC', borderColor: '#FF8C94', color: '#2E1D21' }}
        >
          <CreditCard size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-bold">Paiement échoué</p>
            <p className="text-sm mt-0.5">
              Un problème de paiement a été détecté sur votre abonnement.{' '}
              <a
                href="/mon-compte/abonnement"
                className="underline font-semibold"
                style={{ color: '#2E1D21' }}
              >
                Régulariser ma situation →
              </a>
            </p>
          </div>
        </div>
      )}

      {overdueItems.length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-[25px] border"
          style={{ background: '#FFF7D4', borderColor: '#ffe264', color: '#2E1D21' }}
        >
          <AlertTriangle size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-bold">Retour en attente</p>
            <p className="text-sm mt-0.5">
              {overdueItems.length === 1
                ? '1 jouet doit être retourné.'
                : `${overdueItems.length} jouets doivent être retournés.`}{' '}
              <a
                href="/mon-compte/commandes"
                className="underline font-semibold"
                style={{ color: '#2E1D21' }}
              >
                Voir mes commandes →
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
