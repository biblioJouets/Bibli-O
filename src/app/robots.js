export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // On interdit l'accès aux pages inutiles pour le SEO (comme on a dit)
      disallow: ['/mon-compte/', '/panier/'],
    },
    sitemap: 'https://bibliojouets.fr/sitemap.xml',
  }
}