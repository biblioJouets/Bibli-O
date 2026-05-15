'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BlockRenderer from '@/components/blogs/BlockRenderer';
import '@/styles/blogs/blogArticle.css';

const CAT_COLORS = {
  Éveil:    { bg: '#FFD9DC', fg: '#FF8C94' },
  Écologie: { bg: '#DAEEE6', fg: '#3DA876' },
  Conseils: { bg: '#DFF1F9', fg: '#2E96C8' },
  Hygiène:  { bg: '#FFF7D4', fg: '#C19A1B' },
};

function authorInitials(name = '') {
  return name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
}

export default function ArticleDetailPage({ params }) {
  const { slug } = use(params);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blogs/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setArticle(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="article-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#8C7B7F', fontSize: '1rem' }}>Chargement de l&apos;article...</div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="article-page" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <h1 style={{ color: '#2E1D21', marginBottom: '1rem' }}>Article introuvable</h1>
        <Link href="/blogs" style={{ color: '#6EC1E4', fontWeight: 700, textDecoration: 'none' }}>
          ← Retour au blog
        </Link>
      </div>
    );
  }

  const cat = CAT_COLORS[article.category] ?? { bg: '#F0E8E0', fg: '#8C7B7F' };
  const blocks = Array.isArray(article.content) ? article.content : [];
  const initials = authorInitials(article.author);
  const dateStr = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="article-page">

      {/* Fil d'Ariane */}
      <nav className="article-breadcrumb">
        <Link href="/blogs">Blog</Link>
        <span>›</span>
        <span style={{ cursor: 'pointer' }}>{article.category}</span>
        <span>›</span>
        <span className="article-breadcrumb__current">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="article-header">
        <div className="article-header__inner">
          <span className="article-cat-badge" style={{ background: cat.bg, color: cat.fg }}>
            {article.category}
          </span>

          <h1 className="article-title">{article.title}</h1>

          {article.excerpt && (
            <p className="article-excerpt">{article.excerpt}</p>
          )}

          <div className="article-meta">
            <div className="article-meta__author">
              <div className="article-meta__avatar">{initials}</div>
              <div>
                <div className="article-meta__name">{article.author}</div>
                <div className="article-meta__date">{dateStr}</div>
              </div>
            </div>
            {article.readTime && (
              <>
                <span className="article-meta__dot">·</span>
                <span className="article-meta__read">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {article.readTime} de lecture
                </span>
              </>
            )}
          </div>
        </div>

        {/* Image à la une */}
        {article.thumbnail && (
          <div className="article-hero-img">
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            <div className="article-hero-img__blob" />
          </div>
        )}
      </header>

      {/* Corps — blocs JSON du builder */}
      <div className="article-body-wrap">
        <article className="article-body">
          {blocks.length === 0 ? (
            <p style={{ color: '#8C7B7F', fontStyle: 'italic' }}>Aucun contenu pour cet article.</p>
          ) : (
            blocks.map((block, i) => (
              <BlockRenderer key={block.id ?? i} block={block} index={i} />
            ))
          )}
        </article>
      </div>

      {/* Footer navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 6vw 0' }}>
        <Link
          href="/blogs"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.875rem 1.75rem', background: '#6EC1E4', color: '#fff',
            borderRadius: '50px', fontWeight: 700, fontSize: '0.95rem',
            textDecoration: 'none', boxShadow: '0 4px 14px rgba(110,193,228,.5)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Tous les articles
        </Link>
      </div>
    </div>
  );
}
