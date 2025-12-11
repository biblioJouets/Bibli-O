// src/components/ProductCard.jsx
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  // Vérification du stock
  const isOutOfStock = product.stock <= 0;

  const isNew = () => {
    if (!product.createdAt) return false;
    const createdDate = new Date(product.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14; 
  };

  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/assets/toys/jouet1.jpg';

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isOutOfStock) {
       addToCart(product.id, 1);
    }
  };

  return (
    <div className="product-card" style={{ opacity: isOutOfStock ? 0.6 : 1, filter: isOutOfStock ? 'grayscale(100%)' : 'none' }}>
      
<Link href={`/bibliotheque/${product.id}`} className="product-card-link">        
        <div className="product-image-wrapper">
          <span className="product-badge">{product.ageRange || 'Tout âge'}</span>
          
          {/* Badge Nouveau (si en stock) */}
          {!isOutOfStock && isNew() && (
            <span className="product-badge-new">NOUVEAU</span>
          )}

          {/* Badge Loué (si hors stock) */}
          {isOutOfStock && (
            <span style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#2E1D21',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                zIndex: 10,
                whiteSpace: 'nowrap'
            }}>
                DÉJÀ LOUÉ 🧸
            </span>
          )}

          <Image 
            src={mainImage} 
            alt={product.name} 
            width={400} 
            height={300} 
            className="product-image"
          />
        </div>
        
        <div className="product-info">
          <div className="product-brand">{product.brand || 'Bibli\'O'}</div>
          <h3 className="product-name">{product.name}</h3>
          
          <div className="product-rating">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                fill={i < Math.round(product.rating || 0) ? "#FFD700" : "none"} 
                color={i < Math.round(product.rating || 0) ? "#FFD700" : "#ddd"}
              />
            ))}
            <span style={{fontSize: '0.8rem', color:'#999', marginLeft:'5px'}}>
               ({product.reviews?.length || 0})
            </span>
          </div>
        </div>
      </Link>

      <div className="product-action-footer">
        <div className="buttonPanier">
          <button 
             className="Button Blue" 
             onClick={handleAddToCart}
             disabled={isOutOfStock}
             style={{ 
                 backgroundColor: isOutOfStock ? '#ccc' : '', 
                 cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                 boxShadow: isOutOfStock ? 'none' : ''
             }}
           >
             {isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
           </button>
        </div>
      </div>

    </div>
  );
}