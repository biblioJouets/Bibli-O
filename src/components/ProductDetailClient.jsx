'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, FileText, Ruler, Weight, Puzzle, Package } from 'lucide-react';
import '@/styles/productDetail.css';

export default function ProductDetailClient({ product }) {
  // Gestion de la galerie d'images
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/assets/toys/jouet1.jpg']; // Image par défaut
    
  const [selectedImage, setSelectedImage] = useState(images[0]);

  // Fonction factice d'ajout au panier (en attendant le contexte global)
  const handleAddToCart = () => {
    alert(`🎁 ${product.name} a été ajouté au panier ! (Simulation)`);
    // Ici, plus tard, on appellera cartContext.addItem(product)
  };

  return (
    <div className="product-page-container">
      {/* Fil d'ariane */}
      <div className="breadcrumb">
        <Link href="/">Accueil</Link> &gt; <Link href="/bibliotheque">Bibliothèque</Link> &gt; <span>{product.name}</span>
      </div>

      <div className="product-main">
        {/* --- COLONNE GAUCHE : GALERIE --- */}
        <div className="gallery-container">
          <div className="main-image-wrapper">
            <Image 
              src={selectedImage} 
              alt={product.name} 
              fill
              className="main-image"
              priority
            />
          </div>
          
          {/* Miniatures (seulement si plusieurs images) */}
          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((img, index) => (
                <button 
                  key={index}
                  className={`thumb-btn ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <Image 
                    src={img} 
                    alt={`Vue ${index + 1}`} 
                    width={80} 
                    height={80} 
                    className="thumb-img"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- COLONNE DROITE : INFOS --- */}
        <div className="product-info">
          <div className="brand-badge">{product.brand || 'Bibli\'O'}</div>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-ref">Réf: {product.reference}</p>

          <div className="price-block">
0€ <span className="price-period">avec votre abonnement au lieu de </span> {product.price}€ </div>

          <p className="description">{product.description}</p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="tags-container">
              {product.tags.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="actions">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <ShoppingCart size={20} />
              Ajouter au panier
            </button>

            {product.manualUrl && (
              <a href={product.manualUrl} target="_blank" rel="noopener noreferrer" className="manual-btn">
                <FileText size={20} />
                Notice PDF
              </a>
            )}
          </div>

          {/* Fiche Technique */}
          <div className="specs-grid">
            <div className="spec-item">
              <Ruler className="spec-icon" size={24} />
              <div>
                <span className="spec-label">Dimensions</span>
                <span className="spec-value">
                  {product.length || 0} x {product.width || 0} x {product.height || 0} cm
                </span>
              </div>
            </div>

            <div className="spec-item">
              <Weight className="spec-icon" size={24} />
              <div>
                <span className="spec-label">Poids</span>
                <span className="spec-value">{product.weight ? `${product.weight} kg` : 'N/A'}</span>
              </div>
            </div>

            <div className="spec-item">
              <Puzzle className="spec-icon" size={24} />
              <div>
                <span className="spec-label">Pièces</span>
                <span className="spec-value">{product.pieceCount || '?'} pièces</span>
              </div>
            </div>

            <div className="spec-item">
              <Package className="spec-icon" size={24} />
              <div>
                <span className="spec-label">État</span>
                <span className="spec-value">
                  {product.condition === 'NEW' ? 'Neuf' : 
                   product.condition === 'GOOD' ? 'Très bon état' : 
                   product.condition === 'FAIR' ? 'Bon état' : product.condition}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}