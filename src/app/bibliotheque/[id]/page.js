// src/app/bibliotheque/[id]/page.js
import { productService } from '@/lib/modules/products/product.service';
import ProductDetailClient from '@/components/ProductDetailClient';
import { notFound } from 'next/navigation';

// --- 1. Génération des Métadonnées SEO (Titre & Description) ---
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await productService.getById(id);

  if (!product) {
    return { title: "Jouet introuvable | Bibli'O Jouets" };
  }

  return {
    title: `${product.name} - Location de jouet`,
    description: product.description 
      ? product.description.substring(0, 160) 
      : `Louez le jouet ${product.name} chez Bibli'O Jouets.`,
    openGraph: {
      title: product.name,
      description: product.description ? product.description.substring(0, 160) : '',
      images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
    },
  };
}

// --- 2. Composant de Page avec Données Structurées (JSON-LD) ---
export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await productService.getById(id);

  if (!product) {
    notFound();
  }

  // --- Préparation du JSON-LD ---
  // On calcule la disponibilité
  const isAvailable = product.stock > 0;
  
  // On calcule le nombre d'avis (si reviews est inclus dans votre service)
  const reviewCount = product.reviews ? product.reviews.length : 0;
  // La note moyenne (assurez-vous que product.rating est bien rempli, sinon on met une valeur par défaut)
  const ratingValue = product.rating || 5; 

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images && product.images.length > 0 ? product.images : [],
    // La marque (optionnel mais recommandé)
    brand: {
      '@type': 'Brand',
      name: product.brand || "Bibli'O Jouets"
    },
    // OFFRE : Uniquement la disponibilité (pas de prix)
    offers: {
      '@type': 'Offer',
      availability: isAvailable 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/UsedCondition', // Car c'est de la location/seconde main
    },
  };

  // Ajout conditionnel des avis (seulement s'il y en a)
  if (reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      reviewCount: reviewCount,
      bestRating: "5",
      worstRating: "1"
    };
  }

  return (
    <>
      {/* Injection du script JSON-LD pour Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Affichage visuel du composant */}
      <ProductDetailClient product={product} />
    </>
  );
}