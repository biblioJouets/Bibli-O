/* src/components/account/OrderItemRow.jsx */
//Gère l'affichage individuel et les actions par jouet.
import Image from 'next/image';

export default function OrderItemRow({ item, orderDate, isPriority }) {
  // Extraction sécurisée des données du produit
  const productData = item.product || item.Products || {};
  const imageUrl = productData?.images?.[0] || '/assets/box_bj.png';
  const productName = productData?.name || "Jouet Mystère";
  const productPrice = Number(productData?.price || 0).toFixed(2);

  // Calcul physiologique de la date de retour (Date de commande + 30 jours)
  const calculateReturnDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('fr-FR');
  };

  const returnDate = calculateReturnDate(orderDate);

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
        <button className="btn-pill btn-extend" type="button">Prolonger</button>
      </div>
    </div>
  );
}