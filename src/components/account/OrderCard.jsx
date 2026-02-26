/* src/components/account/OrderCard.jsx */
import Link from 'next/link';
import OrderItemRow from './OrderItemRow';
import ProlongButton from './ProlongButton'; // <-- Notre nouveau composant

export default function OrderCard({ order }) {
  const statusTranslations = {
    PENDING: "En attente",
    PAID: "Payé",
    SHIPPED: "Expédié",
    PREPARING: "En préparation",
    DELIVERED: "Livré",
    ACTIVE: "En cours (Location)", // J'ajoute le statut ACTIVE
    RETURNED: "Retourné",
    CANCELLED: "Annulé"
  };

  const items = order.items || order.OrderItems || order.OrderProducts || [];
  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR');
  const formattedPrice = Number(order.totalAmount || 0).toFixed(2);

  // --- LOGIQUE TEMPORELLE (J-7) ---
  let showProlongButton = false;
  if (order.status === 'ACTIVE' && order.nextBillingDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // On normalise la date du jour à minuit
    
    const billingDate = new Date(order.nextBillingDate);
    billingDate.setHours(0, 0, 0, 0);

    const diffTime = billingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Si on est à 7 jours ou moins de la date anniversaire (et qu'elle n'est pas passée)
    if (diffDays <= 7 && diffDays >= 0) {
      showProlongButton = true;
    }
  }

  return (
    <div className="order-card p-6 rounded-[25px] bg-[#FFFAF4] shadow-sm mb-6 flex flex-col gap-4">
      <div className="order-header flex flex-wrap justify-between items-center gap-4">
        <div className="order-meta flex flex-col gap-1 text-[#2E1D21]">
          <span className="font-semibold">Commande du {orderDate}</span>
          <span className={`text-sm font-medium px-3 py-1 rounded-full w-fit bg-white border border-[#DAEEE6]`}>
            {statusTranslations[order.status] || order.status}
          </span>
        </div>
        
        <div className="order-actions-global flex items-center gap-4">
          <span className="text-lg font-bold text-[#6EC1E4]">{formattedPrice} €</span>
          
          {/* AFFICHAGE CONDITIONNEL DU BOUTON J-7 */}
          {showProlongButton && (
            <ProlongButton 
              orderId={order.id} 
              currentIntention={order.renewalIntention} 
            />
          )}

          <Link href={`/confirmation-commande?id=${order.id}`} className="px-5 py-2 rounded-full border border-[#2E1D21] text-[#2E1D21] hover:bg-[#2E1D21] hover:text-white transition-colors text-sm font-medium">
            Détails
          </Link>
        </div>
      </div>

      <div className="order-items-container flex flex-col gap-4 mt-2">
        {items.map((item, index) => (
          <OrderItemRow 
            key={item.id || index} 
            item={item} 
            orderDate={order.createdAt}
            isPriority={index === 0} 
          />
        ))}
      </div>
    </div>
  );
}