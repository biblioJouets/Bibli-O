/* src/components/account/OrderCard.jsx */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
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

const ADOPTED_STATUSES = ['ADOPTE', 'ADOPTE_REMPLACE'];

function formatOrderId(order) {
  const d = new Date(order.createdAt);
  const day     = String(d.getDate()).padStart(2, "0");
  const month   = String(d.getMonth() + 1).padStart(2, "0");
  const year    = String(d.getFullYear()).slice(2);
  const hours   = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `CMD${day}${month}${year}${hours}${minutes}-${order.id}`;
}

// activeMode : null | 'exchange' | 'prolong'
export default function OrderCard({ order, canExchange = true, canExchangeReason = null, onRefresh }) {
  const router = useRouter();
  const { setExchangeContext } = useCart();
  const items = order.items || order.OrderItems || order.OrderProducts || [];
  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR');
  const formattedPrice = Number(order.totalAmount || 0).toFixed(2);
  const orderId = formatOrderId(order);
  const isAdoption = order.orderType === 'ADOPTION';
  const isExchange = order.orderType === 'EXCHANGE';
  const isRefill   = order.orderType === 'REFILL';
  const isInactive = ['PENDING', 'PREPARING'].includes(order.status);

  const adoptedSlots = items.filter((i) => i.renewalIntention === 'ADOPTE').length;

  // Jouets sur lesquels une action est possible (ACTIVE, non adoptés, pas en retour)
  const selectableItems = items.filter(
    (i) =>
      order.status === 'ACTIVE' &&
      !ADOPTED_STATUSES.includes(i.renewalIntention) &&
      i.renewalIntention !== 'RETOUR_DEMANDE'
  );

  // Éligibilité J-7 par jouet (logique identique à l'ancien ProlongButton)
  const isProlongEligible = (item) => {
    if (item.renewalIntention === 'PAIEMENT_ECHOUE') return false; // géré séparément
    if (item.renewalIntention === 'PROLONGATION' || item.renewalIntention === 'PROLONGATION_TACITE') return false;
    if (!item.nextBillingDate) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const billing = new Date(item.nextBillingDate); billing.setHours(0, 0, 0, 0);
    const diffDays = Math.round((billing - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const prolongableItems = selectableItems.filter(isProlongEligible);
  const hasProlongable = prolongableItems.length > 0;

  const exchangeBlocked = !canExchange;
  const exchangeBlockReason = !canExchange
    ? (canExchangeReason ?? "Échange indisponible sur cette période de facturation.")
    : null;

  // Mode actif : null = repos, 'exchange' ou 'prolong' = sélection en cours
  const [activeMode, setActiveMode] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError,   setActionError]   = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const enterMode = (mode) => {
    setActiveMode(mode);
    setSelectedIds([]);
    setActionError(null);
    setActionSuccess(null);
  };

  const cancelMode = () => {
    setActiveMode(null);
    setSelectedIds([]);
    setActionError(null);
  };

  const toggleSelect = (productId) => {
    setSelectedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    // En mode prolong, "tout sélectionner" ne coche que les jouets éligibles J-7
    const pool = activeMode === 'prolong' ? prolongableItems : selectableItems;
    const allIds = pool.map((i) => i.ProductId);
    setSelectedIds(
      allIds.every((id) => selectedIds.includes(id)) ? [] : allIds
    );
  };

  // Valider échange → redirection bibliothèque
  const handleConfirmExchange = () => {
    if (selectedIds.length === 0) return;
    // totalActiveCount = capacité de l'abonnement = tous les jouets actifs non-adoptés
    setExchangeContext({
      orderId: order.id,
      selectedProductIds: selectedIds,
      totalActiveCount: selectableItems.length,
    });
    router.push(`/bibliotheque?mode=exchange&orderId=${order.id}&slots=${selectedIds.length}`);
  };

  // Valider prolongation → seuls les jouets éligibles J-7 sont envoyés
  const handleConfirmProlong = async () => {
    const eligibleIds = selectedIds.filter((id) =>
      prolongableItems.some((p) => p.ProductId === id)
    );
    if (eligibleIds.length === 0) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const results = await Promise.all(
        eligibleIds.map((productId) =>
          fetch('/api/orders/prolong-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id, productId }),
          })
        )
      );
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) throw new Error(`${failed.length} prolongation(s) ont échoué.`);
      setActionSuccess(
        `${eligibleIds.length} jouet${eligibleIds.length > 1 ? 's' : ''} prolongé${eligibleIds.length > 1 ? 's' : ''} avec succès.`
      );
      setActiveMode(null);
      setSelectedIds([]);
      onRefresh?.();
    } catch (err) {
      setActionError(err.message || 'Erreur lors de la prolongation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Afficher les boutons d'action sur toutes les commandes ACTIVE non-adoption
  const showActions = order.status === 'ACTIVE' && !isAdoption && selectableItems.length > 0;

  const allSelected = selectableItems.length > 0 && selectableItems.every((i) => selectedIds.includes(i.ProductId));

  return (
    <div className={`order-card p-6 rounded-[25px] shadow-sm mb-6 flex flex-col gap-4 ${
      isAdoption ? 'bg-[#F5F0FA] border border-[#c4a8d5]'
      : isExchange ? 'bg-[#EBF7FD] border border-[#6EC1E4]'
      : isRefill   ? 'bg-[#F2FAF6] border border-[#88D4AB]'
      : 'bg-[#FFFAF4]'
    }`}>

      {/* En-tête */}
      <div className="order-header flex flex-wrap justify-between items-center gap-4">
        <div className="order-meta flex flex-col gap-1 text-[#2E1D21]">
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
          {order.returnLabelUrl && (
            <a href={order.returnLabelUrl} target="_blank" rel="noreferrer"
              className="px-4 py-2 rounded-full border border-[#6EC1E4] text-[#0a4a6e] bg-[#EBF7FD] hover:bg-[#d0eef9] transition-colors text-sm font-medium">
              📄 Bordereau de retour
            </a>
          )}
          {order.stripeInvoiceUrl && (
            <a href={order.stripeInvoiceUrl} target="_blank" rel="noreferrer"
              className="px-4 py-2 rounded-full border border-[#FFE08A] text-[#7a5c00] bg-[#FFFBEB] hover:bg-[#fef3c7] transition-colors text-sm font-medium">
              🧾 Facture
            </a>
          )}
        </div>
      </div>

      {/* ── BOUTONS D'ACTION (au-dessus des jouets) ── */}
      {showActions && (
        <div className="flex flex-col gap-3">

          {/* État repos : boutons d'action */}
          {!activeMode && (
            <div className="flex flex-col gap-1.5">
              {/* Ligne de boutons — hauteur fixe, alignés au centre */}
              <div className="flex flex-wrap items-center gap-2">

                {/* Échanger */}
                {exchangeBlocked ? (
                  <button disabled type="button"
                    className="px-3 py-2 rounded-full bg-gray-100 text-gray-400 font-semibold text-sm cursor-not-allowed border-none">
                    🔄 Échanger
                  </button>
                ) : (
                  <button type="button" onClick={() => enterMode('exchange')}
                    className="px-3 py-2 rounded-full bg-[#6EC1E4] hover:bg-[#5aafcf] text-white font-semibold text-sm transition-colors shadow-sm border-none">
                    🔄 Échanger
                  </button>
                )}

                {/* Prolonger — actif uniquement si au moins un jouet est dans les 7 jours */}
                <button type="button"
                  onClick={() => enterMode('prolong')}
                  disabled={!hasProlongable}
                  title={!hasProlongable ? "Disponible dans les 7 jours avant votre prochaine facturation" : ""}
                  className="px-5 py-2 rounded-full bg-[#88D4AB] hover:bg-[#6abf92] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed border-none">
                  ⏳ Prolonger
                </button>

              </div>

              {/* Raison du blocage — sous la ligne, sans impacter la hauteur des boutons */}
              {exchangeBlocked && exchangeBlockReason && (
                <span className="text-xs text-gray-400 px-1">{exchangeBlockReason}</span>
              )}
            </div>
          )}

          {/* État actif : instruction + Tout sélectionner + Valider/Annuler */}
          {activeMode && (
            <div className={`p-3 rounded-[16px] flex flex-col gap-2 ${
              activeMode === 'exchange' ? 'bg-[#EBF7FD] border border-[#6EC1E4]' : 'bg-[#DAEEE6] border border-[#88D4AB]'
            }`}>
              <p className="text-sm font-semibold text-[#2E1D21]">
                {activeMode === 'exchange'
                  ? '🔄 Sélectionnez les jouets à échanger'
                  : '⏳ Sélectionnez les jouets à prolonger'}
              </p>

              {selectableItems.length > 1 && (
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: activeMode === 'exchange' ? '#6EC1E4' : '#88D4AB' }}
                  />
                  <span className="text-xs text-[#2E1D21] select-none">
                    Tout sélectionner ({selectableItems.length})
                  </span>
                </label>
              )}

              <div className="flex flex-wrap gap-2 mt-1">
                <button type="button"
                  disabled={selectedIds.length === 0 || actionLoading}
                  onClick={activeMode === 'exchange' ? handleConfirmExchange : handleConfirmProlong}
                  className={`px-5 py-2 rounded-full text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                    activeMode === 'exchange'
                      ? 'bg-[#6EC1E4] hover:bg-[#5aafcf]'
                      : 'bg-[#88D4AB] hover:bg-[#6abf92]'
                  }`}>
                  {actionLoading
                    ? '...'
                    : selectedIds.length === 0
                      ? 'Choisir des jouets'
                      : `Valider (${selectedIds.length} jouet${selectedIds.length > 1 ? 's' : ''})`}
                </button>
                <button type="button" onClick={cancelMode}
                  className="px-5 py-2 rounded-full bg-white text-[#a0888c] font-semibold text-sm transition-colors hover:bg-gray-50">
                  Annuler
                </button>
              </div>

              {actionError && <p className="text-sm text-red-500">{actionError}</p>}
            </div>
          )}

          {actionSuccess && !activeMode && (
            <p className="text-sm text-[#3a9e6f] font-medium">✅ {actionSuccess}</p>
          )}
        </div>
      )}

      {/* Liste des jouets */}
      <div className="order-items-container flex flex-col gap-3">
        {items.map((item, index) => (
          <OrderItemRow
            key={`${order.id}-${item.ProductId ?? index}`}
            item={item}
            orderStatus={order.status}
            orderId={order.id}
            isAdoptionOrder={isAdoption}
            activeMode={activeMode}
            isSelected={selectedIds.includes(item.ProductId)}
            onToggleSelect={activeMode ? toggleSelect : null}
          />
        ))}
      </div>

      {/* Bandeau Réassort */}
      {order.status === 'ACTIVE' && adoptedSlots > 0 && (
        <div className="p-4 rounded-[20px] bg-[#DAEEE6] border border-[#88D4AB] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-[#2E1D21] text-sm">
              🎁 Vous avez adopté {adoptedSlots} jouet{adoptedSlots > 1 ? 's' : ''}.
            </span>
            <span className="text-xs text-[#3a6b50]">
              Vous avez {adoptedSlots} place{adoptedSlots > 1 ? 's' : ''} libre{adoptedSlots > 1 ? 's' : ''} dans votre box !
            </span>
          </div>
          <button type="button"
            onClick={() => router.push(`/bibliotheque?mode=refill&slots=${adoptedSlots}&sourceOrderId=${order.id}`)}
            className="px-5 py-2 rounded-full bg-[#88D4AB] hover:bg-[#6abf92] text-[#2E1D21] font-semibold text-sm transition-colors shadow-sm whitespace-nowrap">
            Remplacer ce{adoptedSlots > 1 ? 's' : ''} jouet{adoptedSlots > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Info commande en préparation */}
      {isInactive && !isAdoption && (
        <div className="px-4 py-3 rounded-[16px] bg-[#FFF7E6] border border-[#FFE08A] text-sm text-[#7a5c00]">
          ⏳ Votre commande est en cours de préparation — les actions seront disponibles dès l&apos;expédition.
        </div>
      )}
    </div>
  );
}
