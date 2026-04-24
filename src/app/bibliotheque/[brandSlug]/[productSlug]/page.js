import { productService } from '@/lib/modules/products/product.service';
import ProductDetailClient from '@/components/ProductDetailClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { brandSlug, productSlug } = await params;
  const fullSlug = `${brandSlug}/${productSlug}`;
  const product = await productService.getBySlug(fullSlug);

  if (!product) {
    return { title: "Jouet introuvable | Bibli'O Jouets" };
  }

  const title = `${product.name} - Location jouet ${product.brand || ''} | Bibli'O Jouets`.trim();
  const description = product.description
    ? product.description.substring(0, 160)
    : `Louez ${product.name} de ${product.brand || "Bibli'O Jouets"} — jouets de qualité en location pour enfants.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brand,
      product.category,
      'location jouet',
      'jouet enfant',
      'bibliothèque jouets',
      product.ageRange,
    ].filter(Boolean),
    alternates: {
      canonical: `/bibliotheque/${fullSlug}`,
    },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: product.images && product.images.length > 0
        ? [{ url: product.images[0], alt: product.name }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const { brandSlug, productSlug } = await params;
  const fullSlug = `${brandSlug}/${productSlug}`;
  const product = await productService.getBySlug(fullSlug);

  if (!product) {
    notFound();
  }

  const isAvailable = product.stock > 0;
  const reviewCount = product.reviews ? product.reviews.length : 0;
  const ratingValue = product.rating || 5;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images && product.images.length > 0 ? product.images : [],
    brand: {
      '@type': 'Brand',
      name: product.brand || "Bibli'O Jouets",
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      availability: isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/UsedCondition',
      seller: {
        '@type': 'Organization',
        name: "Bibli'O Jouets",
        url: 'https://www.bibliojouets.fr',
      },
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue,
        reviewCount,
        bestRating: '5',
        worstRating: '1',
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
