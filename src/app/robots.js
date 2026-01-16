export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/api/', 
        '/panier/', 
        '/mon-compte/', 
        '/confirmation-commande/',
        '/paiement/'
      ],
    },
    sitemap: 'https://www.bibliojouets.fr/sitemap.xml',
  }
}