'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from "@/context/CartContext";
import { ShoppingCart, FileText, Ruler, Weight, Puzzle, Package, XCircle, Check, Star } from 'lucide-react';
import '@/styles/productDetail.css';

export default function ProductDetailClient({ product }) {
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/assets/toys/jouet1.jpg'];
    
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const { addToCart } = useCart();

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if(!isOutOfStock) { 
      addToCart(product.id, 1);
    }
  };

  return (
    <div className="product-page-container">
      <div className="breadcrumb">
        <Link href="/">Accueil</Link> &gt; <Link href="/bibliotheque">Bibliothèque</Link> &gt; <span>{product.name}</span>
      </div>

      <div className="product-main">
        {/* --- COLONNE GAUCHE --- */}
        <div className="left-column">
          <div className="gallery-container">
            <div className="main-image-wrapper" style={{ opacity: isOutOfStock ? 0.6 : 1 }}>
              {isOutOfStock && (
                  <div className="out-of-stock-overlay" style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      zIndex: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '1rem 2rem', 
                      borderRadius: '10px', fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center', whiteSpace: 'nowrap'
                  }}>
                      MOMENTANÉMENT LOUÉ
                  </div>
              )}
              <Image src={selectedImage} alt={product.name} fill className="main-image" priority unoptimized />
            </div>
            
            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((img, index) => (
                  <button key={index} className={`thumb-btn ${selectedImage === img ? 'active' : ''}`} onClick={() => setSelectedImage(img)}>
                    <Image src={img} alt={`Vue ${index + 1}`} width={80} height={80} className="thumb-img" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {product.highlights && product.highlights.length > 0 && (
            <div className="product-highlights-section" style={{ marginTop: '2rem' }}>
              <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#88D4AB', marginBottom: '1rem'}}>
                Les + du produit
              </h3>
              <ul style={{listStyle: 'none', padding: 0}}>
                {product.highlights.map((point, index) => (
                  <li key={index} style={{display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px', color: '#555', lineHeight: '1.5'}}>
                    <Check size={20} color="#88D4AB" style={{flexShrink: 0, marginTop: '2px'}} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* --- COLONNE DROITE --- */}
        <div className="product-info">
          <div className="brand-badge">{product.brand || 'Bibli\'O'}</div>
          
          {/* NOUVEAU : Notation sous la marque */}
          <div className="product-rating-detail">
            <div style={{display: 'flex'}}>
                {[...Array(5)].map((_, i) => (
                <Star 
                    key={i} 
                    size={20} 
                    fill={i < Math.round(product.rating || 0) ? "#ffe264" : "none"} 
                    color={i < Math.round(product.rating || 0) ? "#ffe264" : "#ddd"} 
                />
                ))}
            </div>
            <span className="review-count">({product.reviews?.length || 0} avis)</span>
          </div>

          <h1 className="product-title">{product.name}</h1>
          <p className="product-ref">Réf: {product.reference}</p>

          <div className="price-block">
            {isOutOfStock ? (
                <span style={{ color: '#999', fontSize: '1.1rem', fontWeight: 'normal' }}>
                   Ce jouet est actuellement chez une autre famille 🏠
                </span>
            ) : (
                <>0€ <span className="price-period">avec votre abonnement au lieu de </span> {product.price}€</>
            )}
          </div>

          <div className="description" style={{ whiteSpace: 'pre-wrap' }}>
            {product.description}
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="tags-container">
              {product.tags.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>
          )}

          <div className="actions">
            {isOutOfStock ? (
                <button disabled className="add-to-cart-btn" style={{ backgroundColor: '#ccc', cursor: 'not-allowed', transform: 'none' }}>
                    <XCircle size={20} /> Indisponible
                </button>
            ) : (
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    <ShoppingCart size={20} /> Ajouter au panier
                </button>
            )}

            {product.manualUrl && (
              <a href={product.manualUrl} target="_blank" rel="noopener noreferrer" className="manual-btn">
                <FileText size={20} /> Notice PDF
              </a>
            )}
          </div>

          <div className="specs-grid">
            <div className="spec-item"><Ruler className="spec-icon" size={24} /><div><span className="spec-label">Dimensions</span><span className="spec-value">{product.length || 0} x {product.width || 0} x {product.height || 0} cm</span></div></div>
            <div className="spec-item"><Weight className="spec-icon" size={24} /><div><span className="spec-label">Poids</span><span className="spec-value">{product.weight ? `${product.weight} kg` : 'N/A'}</span></div></div>
            <div className="spec-item"><Puzzle className="spec-icon" size={24} /><div><span className="spec-label">Pièces</span><span className="spec-value">{product.pieceCount || '?'} pièces</span></div></div>
            <div className="spec-item"><Package className="spec-icon" size={24} /><div><span className="spec-label">État</span><span className="spec-value">{product.condition === 'NEW' ? 'Neuf' : product.condition === 'GOOD' ? 'Très bon état' : product.condition === 'FAIR' ? 'Bon état' : product.condition}</span></div></div>
          </div>
        </div>
      </div>

      {/* --- NOUVEAU : SECTION DES AVIS EN BAS DE PAGE --- */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="product-reviews-section">
          <h2>Ce que nos parents testeurs en pensent</h2>
          <div className="reviews-grid">
            {product.reviews.map((review, idx) => (
              <div key={idx} className="toy-review-card">
                <div className="toy-review-header">
                  <span className="toy-review-author">{review.authorName || 'Abonné(e)'}</span>
                  <div className="toy-review-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} size={16} 
                        fill={i < review.rating ? "#ffe264" : "none"} 
                        color={i < review.rating ? "#ffe264" : "#ddd"} 
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="toy-review-comment">"{review.comment}"</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}