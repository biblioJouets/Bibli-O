/* src/components/account/OrderCard.jsx */
'use client';
import { useRouter } from 'next/navigation';
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

/**
 * @param {{ order: object, canExchange?: boolean, canExchangeReason?: string|null }} props
 * canExchange  — résultat de canUserExchange() calculé côté serveur/page parente.
 *               Si non fourni (undefined), la garde est considérée comme permissive
 *               pour ne pas casser les vues qui n'ont pas encore migré.
 */
export default function OrderCard({ order, canExchange = true, canExchangeReason = null }) {
  const router = useRouter();
  const items = order.items || order.OrderItems || order.OrderProducts || [];
  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR');
  const formattedPrice = Number(order.totalAmount || 0).toFixed(2);
  const orderId = formatOrderId(order);
  const isAdoption = order.orderType === 'ADOPTION';
  const isExchange = order.orderType === 'EXCHANGE';
  const isRefill  = order.orderType === 'REFILL';

  // Réassort : jouets adoptés non encore remplacés (ADOPTE_REMPLACE exclus)
  const adoptedSlots = items.filter((item) => item.renewalIntention === 'ADOPTE').length;

  // Échange : jouets actifs (non adoptés) — détermine combien le client peut choisir
  const ADOPTED_STATUSES = ['ADOPTE', 'ADOPTE_REMPLACE'];
  const exchangeableSlots = items.filter((item) => !ADOPTED_STATUSES.includes(item.renewalIntention)).length;

  const isHistorical = ['RETURNED', 'COMPLETED', 'CANCELLED'].includes(order.status);
  const hasRetourDemande = items.some((item) => item.renewalIntention === 'RETOUR_DEMANDE');

  // Masquage total du bouton d'échange : commande clôturée OU retour logistique en cours
  // Dans ces deux cas on ne montre rien — inutile de charger l'interface.
  const hideExchangeButton = isHistorical || hasRetourDemande;

  // Grisage du bouton d'échange : uniquement si la limite temporelle de période est atteinte
  // (le retour en cours est géré par hideExchangeButton, pas ici)
  const exchangeBlocked = !canExchange;
  const exchangeBlockReason = !canExchange
    ? (canExchangeReason ?? "Échange indisponible sur cette période de facturation.")
    : null;

  return (
    <div className={`order-card p-6 rounded-[25px] shadow-sm mb-6 flex flex-col gap-4 ${
      isAdoption ? 'bg-[#F5F0FA] border border-[#c4a8d5]'
      : isExchange ? 'bg-[#EBF7FD] border border-[#6EC1E4]'
      : 'bg-[#FFFAF4]'
    }`}>
      <div className="order-header flex flex-wrap justify-between items-center gap-4">
        <div className="order-meta flex flex-col gap-1 text-[#2E1D21]">
          {/* Numéro de commande formaté */}
          <span className="font-mono text-xs text-[#a0888c] tracking-wide">{orderId}</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Commande du {orderDate}</span>
            {isAdoption && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#c4a8d5] text-[#2E1D21]">
                🧸 Achat définitif
              </span>
            )}
            {isExchange && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#6EC1E4] text-white">
                🔄 Boîte Navette
              </span>
            )}
            {isRefill && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#DAEEE6] text-[#2E1D21]">
                🎁 Réassort
              </span>
            )}
          </div>
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
            key={`${order.id}-${item.ProductId ?? index}`}
            item={item}
            orderStatus={order.status}
            orderId={order.id}
            isAdoptionOrder={isAdoption}
            hideExchangeButton={hideExchangeButton}
            exchangeBlocked={exchangeBlocked}
            exchangeBlockReason={exchangeBlockReason}
            exchangeableSlots={exchangeableSlots}
          />
        ))}
      </div>

      {/* Zone Réassort — visible uniquement sur commandes ACTIVE avec des jouets adoptés */}
      {order.status === 'ACTIVE' && adoptedSlots > 0 && (
        <div className="mt-2 p-4 rounded-[20px] bg-[#DAEEE6] border border-[#88D4AB] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-[#2E1D21] text-sm">
              🎁 Vous avez adopté {adoptedSlots} jouet{adoptedSlots > 1 ? 's' : ''}.
            </span>
            <span className="text-xs text-[#3a6b50]">
              Vous avez {adoptedSlots} place{adoptedSlots > 1 ? 's' : ''} libre{adoptedSlots > 1 ? 's' : ''} dans votre box !
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/bibliotheque?mode=refill&slots=${adoptedSlots}&sourceOrderId=${order.id}`)}
            className="px-5 py-2 rounded-full bg-[#88D4AB] hover:bg-[#6abf92] text-[#2E1D21] font-semibold text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            Remplacer ce{adoptedSlots > 1 ? 's' : ''} jouet{adoptedSlots > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}