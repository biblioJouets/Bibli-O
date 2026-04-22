/* src/components/account/OrderItemRow.jsx */
'use client';
import Image from 'next/image';
import { useState } from 'react';
import AdoptModal from './AdoptModal';
import ReturnModal from './ReturnModal';

const ADOPTED_STATUSES = ['ADOPTE', 'ADOPTE_REMPLACE'];

export default function OrderItemRow({
  item,
  orderStatus,
  orderId,
  isAdoptionOrder = false,
  // Mode sélection groupée transmis par OrderCard
  activeMode     = null,   // null | 'exchange' | 'prolong'
  isSelected     = false,
  onToggleSelect = null,
}) {
  const [showReturnModal,  setShowReturnModal]  = useState(false);
  const [showAdoptModal,   setShowAdoptModal]   = useState(false);
  const [isReturning, setIsReturning] = useState(
    item.renewalIntention === 'RETOUR_DEMANDE' || orderStatus === 'RETURNING'
  );

  const isAdopted      = ADOPTED_STATUSES.includes(item.renewalIntention);
  const isProlonged    = item.renewalIntention === 'PROLONGATION' || item.renewalIntention === 'PROLONGATION_TACITE';
  const isHistorical   = ['PENDING', 'PREPARING', 'RETURNED', 'COMPLETED', 'CANCELLED'].includes(orderStatus);

  const productData  = item.product || item.Products || {};
  const imageUrl     = productData?.images?.[0] || '/assets/box_bj.png';
  const productName  = productData?.name || "Jouet Mystère";
  const productPrice = Number(productData?.price || 0).toFixed(2);
  const returnDate   = item.rentalEndDate
    ? new Date(item.rentalEndDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : "Non définie";

  // Date projetée après prolongation : nextBillingDate + 1 mois (même logique que le webhook)
  const projectedEndDate = (() => {
    if (!item.nextBillingDate) return null;
    const d = new Date(item.nextBillingDate);
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  })();
  const billingDate = item.nextBillingDate
    ? new Date(item.nextBillingDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  // La checkbox n'apparaît que si un mode actif est en cours ET que le jouet est éligible
  const isSelectable = !!onToggleSelect && !isAdopted && !isReturning && !isHistorical && orderStatus === 'ACTIVE';

  return (
    <div className={`order-item-row transition-colors ${isSelected ? 'bg-[#EBF7FD] rounded-[16px] px-2' : ''}`}>

      {/* Checkbox — visible uniquement en mode sélection */}
      {activeMode && (
        isSelectable ? (
          <label className="flex items-center justify-center px-2 cursor-pointer flex-shrink-0"
            onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item.ProductId)}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: activeMode === 'exchange' ? '#6EC1E4' : '#88D4AB' }}
            />
          </label>
        ) : (
          <div className="w-8 flex-shrink-0" />
        )
      )}

      {/* Infos jouet */}
      <div className="item-info flex-1">
        <div className="item-image-wrapper">
          <Image src={imageUrl} alt={productName} width={80} height={80} className="item-thumbnail" />
        </div>
        <div className="item-details">
          <h4 className="item-name">{productName}</h4>
          {!isAdoptionOrder && (
            <>
              <p className="item-price">Prix d&apos;adoption : {productPrice} €</p>
              {isProlonged ? (
                <div className="flex flex-col gap-1 mt-0.5">
                  <p className="item-date">En votre possession jusqu&apos;au <strong>{returnDate}</strong></p>
                  <p className="text-xs leading-snug px-2 py-1.5 rounded-[10px]"
                    style={{ background: '#EDF7F2', color: '#2d6a4f', border: '1px solid #b7e4c7' }}>
                    ✅ Prolongation enregistrée.{' '}
                    {projectedEndDate && billingDate
                      ? <>Votre nouvelle date (env. <strong>{projectedEndDate}</strong>) sera confirmée après le paiement du <strong>{billingDate}</strong>.</>
                      : 'Votre nouvelle date sera confirmée après le prochain paiement.'
                    }
                  </p>
                </div>
              ) : (
                <p className="item-date">En votre possession jusqu&apos;au <strong>{returnDate}</strong></p>
              )}
            </>
          )}
          {isAdoptionOrder && (
            <p className="item-price">Acheté pour {productPrice} €</p>
          )}
        </div>
      </div>

      {/* Zone d'état / actions par jouet */}
      <div className="item-actions">
        {isHistorical ? null
        : isAdoptionOrder ? (
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ backgroundColor: '#c4a8d5', color: '#2E1D21' }}>
            🧸 À vous pour toujours
          </span>
        ) : isReturning ? (
          <span className="text-gray-400 text-sm px-4 py-2 rounded-full"
            style={{ background: '#f3f4f6' }}>
            Retour en cours
          </span>
        ) : isAdopted ? (
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ backgroundColor: '#DAEEE6', color: '#2E1D21' }}>
            Adopté pour la vie 🧸
          </span>
        ) : orderStatus === 'ACTIVE' && !activeMode ? (
          /* Boutons individuels — visibles hors mode sélection groupée */
          <>
            {/* Paiement échoué : action urgente, toujours prioritaire */}
            {item.renewalIntention === 'PAIEMENT_ECHOUE' && (
              <button type="button"
                onClick={() => window.location.href = `/api/stripe/create-portal-session?orderId=${item.OrderId}`}
                className="px-4 py-2 rounded-full font-semibold text-sm transition-colors shadow-sm"
                style={{ background: '#FFD9DC', color: '#2E1D21', border: '1px solid #FF8C94' }}>
                ⚠️ Action requise
              </button>
            )}

            <button type="button"
              onClick={() => setShowAdoptModal(true)}
              className="px-4 py-2 rounded-full text-white font-semibold text-sm transition-colors shadow-sm"
              style={{ background: '#FF8C94' }}>
              🧸 Adopter
            </button>

            {['ACTIVE', 'SHIPPED'].includes(orderStatus) && (
              <button type="button"
                onClick={() => setShowReturnModal(true)}
                className="px-4 py-2 rounded-full text-[#a0888c] font-semibold text-sm transition-colors"
                style={{ background: '#f3f4f6' }}>
                Rendre
              </button>
            )}
          </>
        ) : null}
      </div>

      {showReturnModal && (
        <ReturnModal
          orderId={item.OrderId}
          productId={item.ProductId}
          onClose={() => setShowReturnModal(false)}
          onSuccess={() => { setIsReturning(true); setShowReturnModal(false); }}
        />
      )}
      {showAdoptModal && (
        <AdoptModal
          orderId={orderId}
          productId={item.ProductId}
          productName={productName}
          onClose={() => setShowAdoptModal(false)}
        />
      )}
    </div>
  );
}
