// src/app/bibliotheque/[id]/page.js
import { productService } from '@/lib/modules/products/product.service';
import ProductDetailClient from '@/components/ProductDetailClient';
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }) {
  // 1. Attendre les params (Obligatoire Next.js 15+)
  const { id } = await params;

  // 2. Récupérer le produit en base de données
  // Note: getById attend un ID, assurez-vous que la BDD a bien un ID correspondant
  const product = await productService.getById(id);

  // 3. Gestion 404 si le produit n'existe pas
  if (!product) {
    notFound();
  }

  // 4. Passer les données au Client Component pour l'affichage
  return <ProductDetailClient product={product} />;
}