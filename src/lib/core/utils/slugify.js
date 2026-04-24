/**
 * Génère un slug URL-safe à partir d'un texte.
 * Gère les caractères français (accents, cédilles, etc.)
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')                    // décompose les accents
    .replace(/[̀-ͯ]/g, '')     // supprime les diacritiques
    .replace(/[æ]/g, 'ae')
    .replace(/[œ]/g, 'oe')
    .replace(/[ø]/g, 'o')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')       // garde lettres, chiffres, espaces, tirets
    .trim()
    .replace(/[\s_]+/g, '-')            // espaces → tirets
    .replace(/-+/g, '-')               // tirets multiples → un seul
    .replace(/^-+|-+$/g, '');          // supprime tirets en début/fin
}

/**
 * Génère le slug produit : "{brandSlug}/{productSlug}"
 */
export function buildProductPath(brand, name) {
  const brandSlug = slugify(brand || 'autre');
  const productSlug = slugify(name);
  return `${brandSlug}/${productSlug}`;
}
