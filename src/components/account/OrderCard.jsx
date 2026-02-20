/* src/components/account/OrderCard.jsx */
//Gère les métadonnées de la commande globale.
import Link from 'next/link';
import OrderItemRow from './OrderItemRow';

export default function OrderCard({ order }) {
  const statusTranslations = {
    PENDING: "En attente",
    PAID: "Payé",
    SHIPPED: "Expédié",
    PREPARING: "En préparation",
    DELIVERED: "Livré",
    RETURNED: "Retourné",
    CANCELLED: "Annulé"
  };

  // Résilience : on s'assure d'avoir un tableau valide
  const items = order.items || order.OrderItems || order.OrderProducts || [];
  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR');
  const formattedPrice = Number(order.totalAmount || 0).toFixed(2);

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-meta">
          <span className="order-date">Commande du {orderDate}</span>
          <span className={`order-status status-${order.status?.toLowerCase() || 'pending'}`}>
            {statusTranslations[order.status] || order.status}
          </span>
        </div>
        <div className="order-actions-global">
          <span className="order-total">{formattedPrice} €</span>
          <Link href={`/confirmation-commande?id=${order.id}`} className="btn-pill btn-details">
            Détails
          </Link>
        </div>
      </div>

      <div className="order-items-container">
        {items.map((item, index) => (
          <OrderItemRow 
            key={item.id || index} 
            item={item} 
            orderDate={order.createdAt}
            isPriority={index === 0} // Optimisation LCP pour la 1ère image
          />
        ))}
      </div>
    </div>
  );
}