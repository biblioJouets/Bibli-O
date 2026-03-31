import Link from 'next/link';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

const STATUS_CONFIG = {
  ACTIVE: {
    label: 'Abonnement actif',
    icon: CheckCircle,
    color: '#3b8c6e',
    bg: '#DAEEE6',
  },
  RETURNING: {
    label: 'Retour en cours',
    icon: Clock,
    color: '#d97706',
    bg: '#FFF7EB',
  },
  CANCELLED: {
    label: 'Paiement échoué',
    icon: XCircle,
    color: '#991b1b',
    bg: '#fee2e2',
  },
  PENDING: {
    label: 'En attente',
    icon: Clock,
    color: '#d97706',
    bg: '#FFF7EB',
  },
};

/**
 * Widget statut abonnement Stripe.
 * @param {{ orders: import('@prisma/client').Orders[] }} props
 */
export default function WidgetSubscription({ orders }) {
  // Commande la plus récente avec un abonnement Stripe
  const activeOrder = orders.find(
    (o) => o.stripeSubscriptionId && ['ACTIVE', 'RETURNING', 'SHIPPED', 'PREPARING'].includes(o.status)
  );

  const status = activeOrder?.status ?? null;
  const config = STATUS_CONFIG[status] ?? null;
  const Icon = config?.icon ?? CreditCard;

  return (
    <div
      className="bg-white rounded-[25px] shadow-sm p-6 flex flex-col gap-4"
      style={{ border: '1px solid #eee' }}
    >
      <h3 className="font-bold text-lg" style={{ color: '#2E1D21' }}>
        Mon Abonnement
      </h3>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            background: config?.bg ?? '#f3f4f6',
          }}
        >
          <Icon
            size={22}
            aria-hidden="true"
            style={{ color: config?.color ?? '#888' }}
          />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: config?.color ?? '#888' }}>
            {config?.label ?? 'Aucun abonnement actif'}
          </p>
          {activeOrder?.stripeSubscriptionId && (
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">
              ID : {activeOrder.stripeSubscriptionId}
            </p>
          )}
        </div>
      </div>

      <Link
        href="/mon-compte/abonnement"
        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-colors mt-auto self-start"
        style={{ background: '#2E1D21', color: '#fff' }}
      >
        <CreditCard size={16} aria-hidden="true" />
        Gérer mon abonnement
      </Link>
    </div>
  );
}
