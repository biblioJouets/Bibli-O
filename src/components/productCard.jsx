// src/components/ProductCard.jsx
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import ButtonBlue from './ButtonBlue'; // Votre bouton existant

export default function ProductCard({ product }) {
  // Gestion de l'image par défaut si aucune image n'est fournie
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/assets/toys/jouet1.jpg'; // Image fallback

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <span className="product-badge">{product.ageRange || 'Tout âge'}</span>
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
        
        {/* Affichage des étoiles */}
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

        <div className="product-price">
          <div className="price-tag">
            {product.price}€ <span className="price-period">/mois</span>
          </div>
          <Link href={`/bibliotheque/${product.id}`}>
             {/* On utilise une version "petite" ou lien simple pour ne pas surcharger */}
             <span style={{color: '#FF8C94', fontWeight: 'bold', fontSize: '0.9rem'}}>
               Voir →
             </span>
          </Link>
        </div>
      </div>
    </div>
  );
}