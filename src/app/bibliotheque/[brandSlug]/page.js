// Gère les anciennes URLs numériques /bibliotheque/93 → redirect vers /bibliotheque/marque/jouet
import { productService } from '@/lib/modules/products/product.service';
import { notFound, redirect } from 'next/navigation';

export default async function BrandOrLegacyPage({ params }) {
  const { brandSlug } = await params;

  // Si c'est un ID numérique, c'est une ancienne URL — on redirige
  if (/^\d+$/.test(brandSlug)) {
    const product = await productService.getById(brandSlug);

    if (!product) notFound();

    if (product.slug) {
      redirect(`/bibliotheque/${product.slug}`);
    }

    notFound();
  }

  // Si c'est un slug de marque sans slug de produit, on redirige vers la bibliothèque filtrée
  redirect(`/bibliotheque`);
}
