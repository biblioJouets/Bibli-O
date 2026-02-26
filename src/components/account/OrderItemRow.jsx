/* src/components/account/OrderItemRow.jsx */
//Gère l'affichage individuel et les actions par jouet.
import Image from 'next/image';
import { useState } from 'react';
import ProlongButton from './ProlongButton';

export default function OrderItemRow({ item, orderDate, isPriority, orderId, currentIntention, showProlongButton }) {
  const productData = item.product || item.Products || {};
  const imageUrl = productData?.images?.[0] || '/assets/box_bj.png';
  const productName = productData?.name || "Jouet Mystère";
  const productPrice = Number(productData?.price || 0).toFixed(2);

  const calculateReturnDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('fr-FR');
  };
//fech de l'API pour les actions (échange, adoption, prolongation)

  const returnDate = calculateReturnDate(orderDate);
const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (actionType) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/user/items/${item.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType })
      });

      if (response.ok) {
        // Optionnel : Déclencher un toast de succès ou rafraîchir les données (router.refresh())
        console.log(`Action ${actionType} réussie !`);
      }
    } catch (error) {
      console.error("Erreur de communication :", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="order-item-row">
      <div className="item-info">
        <div className="item-image-wrapper">
          <Image
            src={imageUrl}
            alt={`Image de ${productName}`}
            width={80}
            height={80}
            className="item-thumbnail"
            priority={isPriority}
          />
        </div>
        <div className="item-details">
          <h4 className="item-name">{productName}</h4>
          <p className="item-price">Prix d’adoption : {productPrice} €</p>
          <p className="item-date">En votre possession jusqu’au <strong>{returnDate}</strong></p>
        </div>
      </div>

      <div className="item-actions">
        <button className="btn-pill btn-exchange" type="button">Échanger</button>
        <button className="btn-pill btn-adopt" type="button">Adopter</button>
        {showProlongButton ? (
          <ProlongButton orderId={orderId} currentIntention={currentIntention} />
        ) : (
          <button className="btn-pill btn-extend opacity-50 cursor-not-allowed" type="button" disabled title="Disponible 7 jours avant la fin">
            Prolonger
          </button>
        )}
      </div>
    </div>
  );
}