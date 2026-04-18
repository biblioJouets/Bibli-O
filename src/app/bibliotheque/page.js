'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import ProductCard from '@/components/productCard';
import { useCart } from '@/context/CartContext';
import '@/styles/bibliotheque.css';

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const exchangeMode    = searchParams.get('mode') === 'exchange';
  const exchangeOrderId = searchParams.get('orderId');
  const refillMode      = searchParams.get('mode') === 'refill';
  const refillOrderId   = searchParams.get('sourceOrderId');
  const refillSlots     = parseInt(searchParams.get('slots') || '0', 10);
  const { setExchangeContext, setRefillContext } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active le contexte d'échange ou de réassort dans le CartContext dès l'arrivée sur la page
  useEffect(() => {
    if (exchangeMode && exchangeOrderId) {
      setExchangeContext({ orderId: parseInt(exchangeOrderId) });
      setRefillContext(null);
    } else if (refillMode && refillOrderId && refillSlots > 0) {
      setRefillContext({ sourceOrderId: parseInt(refillOrderId), slots: refillSlots });
      setExchangeContext(null);
    } else {
      setExchangeContext(null);
      setRefillContext(null);
    }
  }, [exchangeMode, exchangeOrderId, refillMode, refillOrderId, refillSlots]); // eslint-disable-line react-hooks/exhaustive-deps

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Erreur chargement produits:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- 1. FONCTION UTILITAIRE : Convertir l'âge en nombre de mois ---
  // Cela nous permet de dire que "2 ans" (24 mois) > "18 mois"
  const getAgeInMonths = (ageString) => {
    if (!ageString) return 0; // Par défaut
    const cleanStr = ageString.toString().toLowerCase().trim();

    if (cleanStr.includes('naissance')) return 0;
    
    // Extraction du nombre
    const number = parseInt(cleanStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(number)) return 0;

    // Conversion
    if (cleanStr.includes('an')) return number * 12; // Années -> Mois
    return number; // Mois -> Mois
  };


  // --- 2. EXTRACTION DES DONNÉES POUR LES LISTES DÉROULANTES ---
  
  const categories = [...new Set(products
    .map(p => p.category ? p.category.trim() : null)
    .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  // Pour la liste déroulante, on garde le tri croissant (Naissance -> Grand)
  const availableAges = [...new Set(products
    .map(p => p.ageRange ? p.ageRange.trim() : null)
    .filter(Boolean)
  )].sort((a, b) => getAgeInMonths(a) - getAgeInMonths(b));


  // --- 3. LOGIQUE DE FILTRAGE ET TRI ---

  const filteredProducts = products
    .filter(product => {
      // A. Recherche
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // B. Catégorie
      const productCat = product.category ? product.category.trim() : '';
      const matchesCategory = selectedCategory ? productCat === selectedCategory : true;
      
      // C. Âge (La modification est ici !)
      // Si un âge est sélectionné, on garde tout ce qui est INFÉRIEUR ou ÉGAL
      let matchesAge = true;
      if (selectedAge) {
        const selectedMonths = getAgeInMonths(selectedAge);
        const productMonths = getAgeInMonths(product.ageRange);
        // Exemple : Si je choisis "18 mois" (18), je veux voir "12 mois" (12) car 12 <= 18
        matchesAge = productMonths <= selectedMonths;
      }

      return matchesSearch && matchesCategory && matchesAge;
    })
    .sort((a, b) => {
      // D. La subtilité de Tri demandée
      // Si un filtre âge est actif, on veut d'abord voir les jouets les plus proches de cet âge (Décroissant)
      if (selectedAge) {
        const ageA = getAgeInMonths(a.ageRange);
        const ageB = getAgeInMonths(b.ageRange);
        
        // Si les âges sont différents, on trie par âge décroissant (4 ans avant 3 ans)
        if (ageA !== ageB) {
          return ageB - ageA; 
        }
        // Si les âges sont identiques, on applique le tri secondaire choisi par l'utilisateur (ex: alphabétique)
      }

      // Tri standard (si pas de filtre âge ou en second critère)
      if (sortOption === 'alpha_asc') return a.name.localeCompare(b.name);
      if (sortOption === 'alpha_desc') return b.name.localeCompare(a.name);
      if (sortOption === 'rating') return b.rating - a.rating;
  
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="bibliotheque-container">

      {/* Bandeau mode échange */}
      {exchangeMode && (
        <div className="w-full bg-[#6EC1E4] text-white px-6 py-3 flex items-center justify-between gap-4 rounded-[16px] mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔄</span>
            <div>
              <p className="font-semibold text-sm leading-tight">Vous êtes en mode Échange</p>
              <p className="text-xs opacity-90">Composez votre nouvelle sélection — votre panier sera validé à 0€.</p>
            </div>
          </div>
          <a
            href="/mon-compte"
            className="text-xs underline underline-offset-2 opacity-80 hover:opacity-100 whitespace-nowrap"
          >
            Annuler
          </a>
        </div>
      )}

      <header className="catalog-header">
        <h1 className="catalog-title">Nos jouets 🧸</h1>
        <p className="catalog-subtitle">Explorez notre collection de jouets éco-responsables</p>
      </header>

      <div className="filters-bar">
        {/* Recherche */}
        <div className="search-group">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sélecteurs */}
        <div className="filter-group">
          <select 
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={selectedAge}
            onChange={(e) => setSelectedAge(e.target.value)}
          >
            <option value="">Tous les âges</option>
            {availableAges.map(age => (
              <option key={age} value={age}>{age}</option> 
            ))}
          </select>

          <select 
            className="filter-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Nouveautés</option>
            <option value="alpha_asc">De A à Z</option>
            <option value="alpha_desc">De Z à A</option>
            <option value="rating">Meilleures notes</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '50px'}}>Chargement des jouets...</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="empty-state">
              <h3>Aucun résultat pour ces critères 🧐</h3>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedCategory(''); setSelectedAge('');}}
                style={{marginTop: '1rem', color: '#6EC1E4', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}}
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}