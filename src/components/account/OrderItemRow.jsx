/* src/components/account/OrderItemRow.jsx */
import Image from 'next/image';
import ProlongButton from './ProlongButton';

export default function OrderItemRow({ item, orderStatus }) {
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
  if (orderStatus === 'ACTIVE' && item.nextBillingDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const billingDate = new Date(item.nextBillingDate);
    billingDate.setHours(0, 0, 0, 0);
    const diffTime = billingDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7 && diffDays >= 0) {
      showProlongButton = true;
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
        <button className="btn-pill btn-exchange" type="button">Échanger</button>
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