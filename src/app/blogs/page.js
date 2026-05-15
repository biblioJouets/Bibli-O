'use client';

import { useState, useEffect } from 'react';
import BlogCard from '@/components/blogs/BlogCard';
import '@/styles/blogs/blogList.css';

const CATEGORIES = ['Tous', 'Éveil', 'Écologie', 'Conseils', 'Hygiène'];

const FILTER_STYLES = {
  Tous:     { bg: '#FFFFFF', radius: '45% 55% 60% 40% / 50% 60% 40% 50%', shadow: 'rgba(46,29,33,.15)' },
  Éveil:    { bg: '#FFD9DC', radius: '55% 45% 50% 50% / 40% 60% 40% 60%', shadow: 'rgba(255,140,148,.45)' },
  Écologie: { bg: '#DAEEE6', radius: '40% 60% 65% 35% / 55% 45% 60% 40%', shadow: 'rgba(136,212,171,.45)' },
  Conseils: { bg: '#DFF1F9', radius: '60% 40% 35% 65% / 45% 55% 45% 55%', shadow: 'rgba(110,193,228,.45)' },
  Hygiène:  { bg: '#FFF7D4', radius: '50% 50% 60% 40% / 60% 40% 50% 50%', shadow: 'rgba(255,226,100,.55)' },
};

const PAGE_SIZE = 6;

export default function BlogsPage() {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('Tous');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch('/api/blogs')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setArticles(data); })
      .catch(() => {});
  }, []);

  const filtered = filter === 'Tous' ? articles : articles.filter((a) => a.category === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (cat) => {
    setFilter(cat);
    setPage(1);
  };

  return (
    <div className="blog-page">

      {/* Hero */}
      <header className="blog-hero">
        <div className="blog-hero__blob blog-hero__blob--tl" />
        <div className="blog-hero__blob blog-hero__blob--tr" />
        <div className="blog-hero__blob blog-hero__blob--bc" />

        <div className="blog-hero__inner">
          <span className="blog-hero__badge">📚 Le journal</span>
          <h1 className="blog-hero__title">
            Le blog de <span>Bibli&apos;o Jouets</span>
          </h1>
          <p className="blog-hero__subtitle">
            Conseils d&apos;experts de la petite enfance, écologie au quotidien et
            astuces pour accompagner le développement de votre enfant —{' '}
            <strong>par notre équipe et des parents comme vous</strong>.
          </p>
        </div>
      </header>

      {/* Filtres */}
      <div className="blog-filters">
        <div className="blog-filters__row">
          {CATEGORIES.map((c) => {
            const s = FILTER_STYLES[c];
            const isActive = c === filter;
            return (
              <button
                key={c}
                className="blog-filter-btn"
                onClick={() => handleFilter(c)}
                style={{
                  background: s.bg,
                  borderRadius: s.radius,
                  boxShadow: isActive
                    ? `0 6px 22px ${s.shadow}, inset 0 0 0 3px #2E1D21`
                    : `0 4px 14px ${s.shadow}`,
                  transform: isActive ? 'translateY(-2px)' : 'none',
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille */}
      {paginated.length === 0 ? (
        <div className="blog-empty">
          {articles.length === 0
            ? 'Chargement des articles...'
            : 'Aucun article dans cette catégorie.'}
        </div>
      ) : (
        <div className="blog-grid">
          {paginated.map((a) => (
            <BlogCard key={a.id} article={a} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="blog-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`blog-pagination__btn ${n === page ? 'blog-pagination__btn--active' : 'blog-pagination__btn--inactive'}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          {page < totalPages && (
            <button className="blog-pagination__next" onClick={() => setPage((p) => p + 1)}>
              Suivant
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
