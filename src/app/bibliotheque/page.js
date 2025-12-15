'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '@/components/productCard';
import '@/styles/bibliotheque.css'; 

export default function LibraryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // 1. Récupération des données
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

  //Logique de Filtrage et Tri
  const filteredProducts = products
    .filter(product => {
      // Recherche Texte
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtre Catégorie
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      
      // Filtre Âge
      const matchesAge = selectedAge 
        ? product.ageRange && product.ageRange.includes(selectedAge.replace(' ans', '').trim())
        : true;

      return matchesSearch && matchesCategory && matchesAge;
    })
    .sort((a, b) => {
      // Logique de Tri Mises à jour
      if (sortOption === 'alpha_asc') return a.name.localeCompare(b.name);
      if (sortOption === 'alpha_desc') return b.name.localeCompare(a.name);
      if (sortOption === 'rating') return b.rating - a.rating;
  
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Extraction dynamique des catégories et âges présents en base
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  

  const availableAges = [...new Set(products.map(p => p.ageRange).filter(Boolean))].sort();

  return (
    <div className="bibliotheque-container">
      
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
              <h3>Oups, aucun jouet ne correspond à votre recherche 🧐</h3>
              <p>Essayez de modifier vos filtres.</p>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedCategory(''); setSelectedAge(''); setSortOption('newest');}}
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