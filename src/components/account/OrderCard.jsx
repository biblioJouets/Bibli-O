/* src/components/account/OrderCard.jsx */
import Link from 'next/link';
import OrderItemRow from './OrderItemRow';

const STATUS_TRANSLATIONS = {
  PENDING:   "En attente",
  PAID:      "Payé",
  SHIPPED:   "Expédié",
  PREPARING: "En préparation",
  DELIVERED: "Livré",
  ACTIVE:    "En cours (Location)",
  RETURNING: "Retour en cours",
  RETURNED:  "Retourné",
  COMPLETED: "Clôturé",
  CANCELLED: "Annulé",
};

function formatOrderId(order) {
  const d = new Date(order.createdAt);
  const day     = String(d.getDate()).padStart(2, "0");
  const month   = String(d.getMonth() + 1).padStart(2, "0");
  const year    = String(d.getFullYear()).slice(2);
  const hours   = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `CMD${day}${month}${year}${hours}${minutes}-${order.id}`;
}

export default function OrderCard({ order }) {
  const items = order.items || order.OrderItems || order.OrderProducts || [];
  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR');
  const formattedPrice = Number(order.totalAmount || 0).toFixed(2);
  const orderId = formatOrderId(order);

  return (
    <div className="order-card p-6 rounded-[25px] bg-[#FFFAF4] shadow-sm mb-6 flex flex-col gap-4">
      <div className="order-header flex flex-wrap justify-between items-center gap-4">
        <div className="order-meta flex flex-col gap-1 text-[#2E1D21]">
          {/* Numéro de commande formaté */}
          <span className="font-mono text-xs text-[#a0888c] tracking-wide">{orderId}</span>
          <span className="font-semibold">Commande du {orderDate}</span>
          <span className="text-sm font-medium px-3 py-1 rounded-full w-fit bg-white border border-[#DAEEE6]">
            {STATUS_TRANSLATIONS[order.status] || order.status}
          </span>
        </div>
        <div className="order-actions-global flex flex-wrap items-center gap-3">
          <span className="text-lg font-bold text-[#6EC1E4]">{formattedPrice} €</span>

          {/* Bordereau de retour (uploadé par l'admin) */}
          {order.returnLabelUrl && (
            <a
              href={order.returnLabelUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full border border-[#6EC1E4] text-[#0a4a6e] bg-[#EBF7FD] hover:bg-[#d0eef9] transition-colors text-sm font-medium"
            >
              📄 Bordereau de retour
            </a>
          )}

          {/* Facture Stripe */}
          {order.stripeInvoiceUrl && (
            <a
              href={order.stripeInvoiceUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full border border-[#FFE08A] text-[#7a5c00] bg-[#FFFBEB] hover:bg-[#fef3c7] transition-colors text-sm font-medium"
            >
              🧾 Facture
            </a>
          )}

         
        </div>
      </div>

      <div className="order-items-container flex flex-col gap-4 mt-2">
        {items.map((item, index) => (
          <OrderItemRow
            key={item.ProductId || index}
            item={item}
            orderStatus={order.status}
            orderId={order.id}
            hasExchangedThisMonth={order.hasExchangedThisMonth}
          />
        ))}
      </div>
    </div>
  );
}