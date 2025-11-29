'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '@/components/productCard';
import '@/styles/bibliotheque.css'; // Import du CSS

export default function LibraryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // 1. Récupération des données au chargement
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // On récupère tout le catalogue (idéal pour < 100 produits)
        // Pour un gros catalogue, il faudrait passer les filtres à l'API
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

  // 2. Logique de Filtrage et Tri (Frontend)
  const filteredProducts = products
    .filter(product => {
      // Filtre Recherche Texte (Nom ou Marque)
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtre Catégorie
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      
      // Filtre Âge
      const matchesAge = selectedAge ? product.ageRange === selectedAge : true;

      return matchesSearch && matchesCategory && matchesAge;
    })
    .sort((a, b) => {
      // Logique de Tri
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      if (sortOption === 'rating') return b.rating - a.rating;
      // Par défaut : Plus récent (ID ou Date)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Liste des catégories uniques pour le select (calculé dynamiquement)
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const ageRanges = ["0-1 an", "1-2 ans","2-3 ans", "3-4 ans", "4-5 ans", "5-6 ans", "6-7 ans", "7-8 ans"]; 

  return (
    <div className="bibliotheque-container">
      
      {/* En-tête */}
      <header className="catalog-header">
        <h1 className="catalog-title">Notre Ludothèque 🧸</h1>
        <p className="catalog-subtitle">Explorez notre collection de jouets éco-responsables</p>
      </header>

      {/* Barre de Filtres */}
      <div className="filters-bar">
        {/* Recherche */}
        <div className="search-group">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un jeu, une marque..." 
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
            {ageRanges.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Nouveautés</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="rating">Meilleures notes</option>
          </select>
        </div>
      </div>

      {/* Grille de Produits */}
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
              <h3>Oups, aucun jouet ne correspond à votre recherche 🧐</h3>
              <p>Essayez de modifier vos filtres.</p>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedCategory(''); setSelectedAge('');}}
                style={{marginTop: '1rem', color: '#6EC1E4', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}