import { Sparkles } from 'lucide-react';

/**
 * Widget impact : total de jouets loués dans l'historique du client.
 * @param {{ orders: import('@prisma/client').Orders[] }} props
 */
export default function WidgetImpact({ orders }) {
  const totalToys = orders.reduce(
    (sum, o) => sum + o.OrderProducts.reduce((s, op) => s + op.quantity, 0),
    0
  );

  const completedOrders = orders.filter((o) =>
    ['COMPLETED', 'RETURNED'].includes(o.status)
  ).length;

  return (
    <div
      className="rounded-[25px] shadow-sm p-6 flex flex-col gap-3"
      style={{ background: '#FFF7EB', border: '1px solid #ffe8c0' }}
    >
      <div className="flex items-center gap-2">
        <Sparkles size={20} style={{ color: '#d97706' }} aria-hidden="true" />
        <h3 className="font-bold text-lg" style={{ color: '#2E1D21' }}>
          Mon impact
        </h3>
      </div>

      <div className="flex gap-6 mt-1">
        <div>
          <p
            className="text-3xl font-extrabold leading-none"
            style={{ color: '#2E1D21' }}
          >
            {totalToys}
          </p>
          <p className="text-xs text-gray-500 mt-1">jouets loués au total</p>
        </div>
        <div>
          <p
            className="text-3xl font-extrabold leading-none"
            style={{ color: '#2E1D21' }}
          >
            {completedOrders}
          </p>
          <p className="text-xs text-gray-500 mt-1">locations terminées</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-1">
        Merci de faire partie de l&apos;aventure Bibliojouets 🌱
      </p>
    </div>
  );
}
