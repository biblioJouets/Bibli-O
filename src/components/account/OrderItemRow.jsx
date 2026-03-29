/* src/components/account/OrderItemRow.jsx */
import Image from 'next/image';
import { useState } from 'react';
import ProlongButton from './ProlongButton';
import ReturnModal from './ReturnModal';

export default function OrderItemRow({ item, orderStatus }) {
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [isReturning, setIsReturning] = useState(
    item.renewalIntention === 'RETOUR_DEMANDE' || orderStatus === 'RETURNING'
  );

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

  return (
    <div className="order-item-row">
      <div className="item-info">
        <div className="item-image-wrapper">
          <Image src={imageUrl} alt={productName} width={80} height={80} className="item-thumbnail" />
        </div>
        <div className="item-details">
          <h4 className="item-name">{productName}</h4>
          <p className="item-price">Prix d’adoption : {productPrice} €</p>
          <p className="item-date">En votre possession jusqu’au <strong>{returnDate}</strong></p>
        </div>
      </div>

      <div className="item-actions">
        {/* Bouton Rendre — conditionnel selon le statut */}
        {(['ACTIVE', 'SHIPPED'].includes(orderStatus)) && !isReturning && (
          <button
            className="border border-gray-300 text-gray-500 text-sm px-4 py-2 rounded-full hover:border-red-300 hover:text-red-500 transition-colors"
            type="button"
            onClick={() => setShowReturnModal(true)}
          >
            Rendre ce jouet
          </button>
        )}
        {(orderStatus === 'RETURNING' || isReturning) && (
          <button
            className="border border-gray-200 text-gray-400 text-sm px-4 py-2 rounded-full cursor-not-allowed"
            type="button"
            disabled
          >
            Retour en cours
          </button>
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

        <button className="btn-pill btn-adopt" type="button">Adopter</button>
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
      </div>
    </div>
  );
}