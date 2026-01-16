// src/app/sitemap.js
import { productService } from "@/lib/modules/products/product.service"; // CORRECTION ICI

export default async function sitemap() {
  const baseUrl = "https://www.bibliojouets.fr";

  // 1. Définir vos pages statiques manuellement
  const staticRoutes = [
    "", // Accueil
    "/abonnements",
    "/bibliotheque",
    "/a-propos",
    "/contact",
    "/faq",
    "/fonctionnement",
    "/inscription",
    "/connexion",
    "/mentions-legales",
    "/politique-confidentialite",
    "/conditions-generales-de-vente",
    "/conditions-generales-utilisation",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === "" ? 1 : 0.8,
  }));

  // 2. Récupérer les produits dynamiques depuis la BDD
  let productRoutes = [];
  try {
    // CORRECTION ICI : on utilise productService.getAll()
    const products = await productService.getAll(); 
    
    productRoutes = products.map((product) => ({
      url: `${baseUrl}/bibliotheque/${product.id}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Erreur lors de la génération du sitemap produits:", error);
  }

  // 3. Fusionner le tout
  return [...staticRoutes, ...productRoutes];
}