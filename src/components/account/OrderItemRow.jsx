/* src/components/account/OrderItemRow.jsx */
import Image from 'next/image';
import { useState } from 'react';
import ProlongButton from './ProlongButton';

export default function OrderItemRow({ item, orderStatus }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const productData = item.product || item.Products || {};
  const imageUrl = productData?.images?.[0] || '/assets/box_bj.png';
  const productName = productData?.name || "Jouet Mystère";
  const productPrice = Number(productData?.price || 0).toFixed(2);

// --- LOGIQUE DE RETOUR D'UN JOUET ---
  const handleReturnToy = async () => {
    if (confirm("Voulez-vous vraiment enregistrer le retour de ce jouet ? Votre abonnement sera ajusté.")) {
      setIsProcessing(true);
      try {
        const response = await fetch('/api/orders/return-item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderId: item.OrderId, 
            productId: item.ProductId 
          })
        });
        
        if (response.ok) {
          alert("Demande de retour enregistrée, facturation mise à jour.");
          // Ici, tu pourrais faire un router.refresh() pour mettre à jour l'affichage
        } else {
          alert("Erreur lors de la demande de retour.");
        }
      } catch (error) {
        console.error("Erreur réseau", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };
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
        <button 
  className="btn-pill btn-exchange" 
  type="button"
  onClick={handleReturnToy}
  disabled={isProcessing}
>
  {isProcessing ? 'En cours...' : 'Rendre'}
</button>
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