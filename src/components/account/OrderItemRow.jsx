/* src/components/account/OrderItemRow.jsx */
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProlongButton from './ProlongButton';
import ReturnModal from './ReturnModal';
import AdoptModal from './AdoptModal';

export default function OrderItemRow({ item, orderStatus, orderId, isAdoptionOrder = false, hideExchangeButton = false, exchangeBlocked = false, exchangeBlockReason = null }) {
  const router = useRouter();
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [isReturning, setIsReturning] = useState(
    item.renewalIntention === 'RETOUR_DEMANDE' || orderStatus === 'RETURNING'
  );
  const isAdopted = item.renewalIntention === 'ADOPTE';

  const productData = item.product || item.Products || {};
  const imageUrl = productData?.images?.[0] || '/assets/box_bj.png';
  const productName = productData?.name || "Jouet Mystère";
  const productPrice = Number(productData?.price || 0).toFixed(2);
  // On utilise la date de fin DU JOUET
  const returnDate = item.rentalEndDate 
    ? new Date(item.rentalEndDate).toLocaleDateString('fr-FR') 
    : "Non définie";

// --- LOGIQUE TEMPORELLE (J-7) AU NIVEAU DU JOUET ---
  let showProlongButton = false;
  
  if (orderStatus === 'ACTIVE') {
    if (item.renewalIntention === 'PAIEMENT_ECHOUE') {
      // Priorité absolue : Si le paiement a échoué, on affiche TOUJOURS le bouton d'alerte
      showProlongButton = true;
    } else if (item.nextBillingDate) {
      // Sinon, on applique la règle classique des 7 jours
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      const billingDate = new Date(item.nextBillingDate);
      billingDate.setHours(0, 0, 0, 0);
      const diffTime = billingDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // On affiche le bouton de J-7 jusqu'à la date de facturation (et même un peu après s'il y a un retard)
      if (diffDays <= 7) {
        showProlongButton = true;
      }
    }
  }

  // Commandes clôturées : aucun bouton d'action ne doit être affiché
  const isHistorical = ['RETURNED', 'COMPLETED', 'CANCELLED'].includes(orderStatus);

  return (
    <div className="order-item-row">
      <div className="item-info">
        <div className="item-image-wrapper">
          <Image src={imageUrl} alt={productName} width={80} height={80} className="item-thumbnail" />
        </div>
        <div className="item-details">
          <h4 className="item-name">{productName}</h4>
          {!isAdoptionOrder && (
            <>
              <p className="item-price">Prix d&apos;adoption : {productPrice} €</p>
              <p className="item-date">En votre possession jusqu&apos;au <strong>{returnDate}</strong></p>
            </>
          )}
          {isAdoptionOrder && (
            <p className="item-price">Acheté pour {productPrice} €</p>
          )}
        </div>
      </div>

      {/* Pas de boutons d’action pour une commande clôturée ou d’achat */}
      {isHistorical ? null : isAdoptionOrder ? (
        <div className="item-actions">
          <span
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ backgroundColor: '#c4a8d5', color: '#2E1D21' }}
          >

            🧸 À vous pour toujours
          </span>
        </div>
      ) : (
      <div className="item-actions">
        {/* Bouton Échanger :
            - masqué totalement si retour en cours ou commande clôturée (hideExchangeButton)
            - grisé avec message si limite de période atteinte (exchangeBlocked)
            - actif sinon */}
        {orderStatus === 'ACTIVE' && !hideExchangeButton && (
          exchangeBlocked ? (
            <div className="flex flex-col items-start gap-1">
              <button
                disabled
                className="bg-gray-200 text-gray-400 font-semibold px-6 py-2 rounded-full cursor-not-allowed text-sm"
                type="button"
              >
                Échanger
              </button>
              {exchangeBlockReason && (
                <span className="text-xs text-gray-400 px-1">{exchangeBlockReason}</span>
              )}
            </div>
          ) : (
            <button
              className="bg-[#6EC1E4] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#5aafcf] transition-colors shadow-md text-sm"
              type="button"
              onClick={() => router.push(`/bibliotheque?mode=exchange&orderId=${orderId}`)}
            >
              Échanger
            </button>
          )
        )}

        {/* Règle d'exclusion stricte : retour en cours → badge seul, rien d'autre */}
        {isReturning ? (
          <button
            className="border border-gray-200 text-gray-400 text-sm px-4 py-2 rounded-full cursor-not-allowed"
            type="button"
            disabled
          >
            Retour en cours
          </button>
        ) : isAdopted ? (
          <span
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ backgroundColor: '#DAEEE6', color: '#2E1D21' }}
          >
            Adopté pour la vie 🧸
          </span>
        ) : (
          <>
            {/* Bouton Rendre — conditionnel selon le statut */}
            {['ACTIVE', 'SHIPPED'].includes(orderStatus) && (
              <button
                className="border border-gray-300 text-gray-500 text-sm px-4 py-2 rounded-full hover:border-red-300 hover:text-red-500 transition-colors"
                type="button"
                onClick={() => setShowReturnModal(true)}
              >
                Rendre
              </button>
            )}

            <button
              className="btn-pill btn-adopt"
              type="button"
              onClick={() => setShowAdoptModal(true)}
            >
              Adopter
            </button>

            {showProlongButton ? (
              <ProlongButton
                orderId={item.OrderId}
                productId={item.ProductId}
                currentIntention={item.renewalIntention}
              />
            ) : (
              <button className="btn-pill btn-extend opacity-50 cursor-not-allowed" type="button" disabled>
                Prolonger
              </button>
            )}
          </>
        )}

        {showReturnModal && (
          <ReturnModal
            orderId={item.OrderId}
            productId={item.ProductId}
            onClose={() => setShowReturnModal(false)}
            onSuccess={() => {
              setIsReturning(true);
              setShowReturnModal(false);
            }}
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
      )}
    </div>
  );
}