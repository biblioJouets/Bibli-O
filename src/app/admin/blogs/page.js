'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ARTICLES } from '@/data/articles';

const CAT_COLORS = {
  Éveil:    { bg: '#FFD9DC', fg: '#FF8C94' },
  Écologie: { bg: '#DAEEE6', fg: '#3DA876' },
  Conseils: { bg: '#DFF1F9', fg: '#2E96C8' },
  Hygiène:  { bg: '#FFF7D4', fg: '#C19A1B' },
};

const FILTER_STYLES = {
  Tous:     { bg: '#FFFFFF', radius: '45% 55% 60% 40% / 50% 60% 40% 50%', shadow: 'rgba(46,29,33,.15)' },
  Éveil:    { bg: '#FFD9DC', radius: '55% 45% 50% 50% / 40% 60% 40% 60%', shadow: 'rgba(255,140,148,.45)' },
  Écologie: { bg: '#DAEEE6', radius: '40% 60% 65% 35% / 55% 45% 60% 40%', shadow: 'rgba(136,212,171,.45)' },
  Conseils: { bg: '#DFF1F9', radius: '60% 40% 35% 65% / 45% 55% 45% 55%', shadow: 'rgba(110,193,228,.45)' },
  Hygiène:  { bg: '#FFF7D4', radius: '50% 50% 60% 40% / 60% 40% 50% 50%', shadow: 'rgba(255,226,100,.55)' },
};

function CategoryFilter({ active, onChange }) {
  const cats = ['Tous', 'Éveil', 'Écologie', 'Conseils', 'Hygiène'];
  return (
    <div className="flex gap-3 flex-wrap justify-center items-center">
      {cats.map((c) => {
        const s = FILTER_STYLES[c];
        const isActive = c === active;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              background: s.bg,
              borderRadius: s.radius,
              boxShadow: isActive
                ? `0 6px 24px ${s.shadow}, inset 0 0 0 1px #2E1D21`
                : `0 4px 14px ${s.shadow}`,
              transform: isActive ? 'translateY(-2px)' : 'none',
            }}
            className="px-6 py-3 font-bold text-[15px] text-bj-text cursor-pointer transition-all duration-200"
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

function ArticleCard({ article }) {
  const cat = CAT_COLORS[article.cat];
  const initials = article.author.split(' ').map((s) => s[0]).slice(0, 2).join('');

  return (
    <div className="bg-white rounded-[25px] overflow-hidden shadow-[0_4px_24px_rgba(46,29,33,.06)] flex flex-col h-full">
      <div className="relative" style={{ aspectRatio: '16/10', padding: 12 }}>
        <div className="relative h-full rounded-[20px] overflow-hidden">
          <Image
            src={article.img}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
        <span
          className="absolute top-[22px] left-[22px] px-3 py-1.5 rounded-full font-bold text-xs tracking-wide"
          style={{ background: cat.bg, color: cat.fg }}
        >
          {article.cat}
        </span>
      </div>

      <div className="px-5 pb-5 pt-2 flex flex-col gap-2.5 flex-1">
        <h3 className="m-0 font-bold text-[1.15rem] leading-snug text-bj-text">
          {article.title}
        </h3>
        <p className="m-0 text-[.88rem] leading-relaxed text-[#5C4A4F]">
          {article.excerpt}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFF7EB] flex items-center justify-center font-bold text-xs text-bj-text">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-bj-text">{article.author}</div>
              <div className="text-[11px] text-[#8C7B7F]">{article.date} · {article.read}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/blogs/${article.slug}`}
              target="_blank"
              className="w-9 h-9 rounded-full bg-[#6EC1E4] flex items-center justify-center text-white shadow-[0_4px_10px_rgba(110,193,228,.5)] transition-transform hover:scale-110 shrink-0"
              title="Voir l'article"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </Link>
            <button
              className="w-9 h-9 rounded-full bg-[#FFD9DC] flex items-center justify-center text-[#FF8C94] shadow-[0_4px_10px_rgba(255,140,148,.3)] transition-transform hover:scale-110 shrink-0"
              title="Modifier"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogsPage() {
  const [filter, setFilter] = useState('Tous');

  const list = filter === 'Tous' ? ARTICLES : ARTICLES.filter((a) => a.cat === filter);

  return (
    <div className="bg-[#FFFAF4] min-h-screen pb-20 px-[4vw] pt-8">

      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="m-0 font-bold text-[1.8rem] text-bj-text">Gestion des articles</h1>
          <p className="m-0 text-[#8C7B7F] text-sm mt-1">{ARTICLES.length} articles · données de démo</p>
        </div>
        <button
          className="px-6 py-3 bg-[#FF8C94] text-white rounded-[50px] font-bold text-[14px] shadow-[0_4px_14px_rgba(255,140,148,.45)] transition-transform hover:-translate-y-0.5"
          onClick={() => alert('TODO: ouvrir le builder')}
        >
          + Nouvel article
        </button>
      </div>

      <div className="mb-8">
        <CategoryFilter active={filter} onChange={setFilter} />
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {list.map((a) => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  );
}
