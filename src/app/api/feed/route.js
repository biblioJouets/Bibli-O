//sortie pour Google Merchant Center, flux XML pour les produits de la boutique

import { productService } from '@/lib/modules/products/product.service';

export async function GET() {
  try {
    // Récupération de tous les produits depuis la BDD
    // Assure-toi que cette méthode existe dans ton productService et renvoie tout le catalogue
    const products = await productService.getAllProducts(); 

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
      <channel>
        <title>Bibli'O Jouets</title>
        <link>https://www.bibliojouets.fr</link>
        <description>Location de jouets éco-responsables par abonnement et sans engagement.</description>
        
        ${products.map(product => {
          // On utilise le Prix Bibli'O pour l'achat, comme sur la page produit
          const currentPrice = product.biblioPrice || product.price;
          
          // GESTION CRITIQUE DU STOCK : synchronisation immédiate
          const isAvailable = product.stock > 0;
          
          // Sécurisation de l'URL
          const brandSlug = product.brand ? product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'biblio-jouets';
          const fullSlug = `${brandSlug}/${product.slug || product.id}`;
          
          return `
          <item>
            <g:id>${product.id}</g:id>
            <g:title><![CDATA[${product.name}]]></g:title>
            <g:description><![CDATA[${product.description || `Jouet ${product.name} proposé par Bibli'O Jouets.`}]]></g:description>
            <g:link>https://www.bibliojouets.fr/bibliotheque/${fullSlug}</g:link>
            <g:image_link>${product.images && product.images.length > 0 ? product.images[0] : 'https://www.bibliojouets.fr/assets/box_bj.png'}</g:image_link>
            
            <g:condition>used</g:condition>
            <g:availability>${isAvailable ? 'in_stock' : 'out_of_stock'}</g:availability>
            <g:price>${currentPrice.toFixed(2)} EUR</g:price>
            <g:brand><![CDATA[${product.brand || "Bibli'O Jouets"}]]></g:brand>
            
            <g:shipping>
              <g:country>FR</g:country>
              <g:service>Point Relais ou Domicile</g:service>
              <g:price>0.00 EUR</g:price>
            </g:shipping>
          </item>
          `;
        }).join('')}
      </channel>
    </rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        // Mise en cache courte (1h) pour ne pas pénaliser le serveur tout en gardant des stocks à jour
        'Cache-Control': 's-maxage=3600, stale-while-revalidate', 
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération du flux XML:", error);
    return new Response('Erreur lors de la génération du flux', { status: 500 });
  }
}