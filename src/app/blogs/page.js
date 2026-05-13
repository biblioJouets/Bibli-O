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
                ? `0 6px 22px ${s.shadow}, inset 0 0 0 3px #2E1D21`
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
    <Link href={`/blogs/${article.slug}`}>
      <article className="bg-white rounded-[25px] overflow-hidden shadow-[0_4px_24px_rgba(46,29,33,.06)] flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(46,29,33,.10)] cursor-pointer h-full">
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
          <h3 className="m-0 font-bold text-[1.25rem] leading-snug text-bj-text">
            {article.title}
          </h3>
          <p className="m-0 text-[.92rem] leading-relaxed text-[#5C4A4F]">
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

            <div className="w-10 h-10 rounded-full bg-[#6EC1E4] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(110,193,228,.6)] transition-transform duration-200 hover:translate-x-0.5 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogsPage() {
  const [filter, setFilter] = useState('Tous');
  const [page, setPage] = useState(1);

  const list = filter === 'Tous' ? ARTICLES : ARTICLES.filter((a) => a.cat === filter);

  return (
    <div className="bg-[#FFFAF4] min-h-screen mt-2 pt-16 pb-20">

      <header className="relative px-[6vw] pt-16 pb-12 overflow-hidden">
        <div className="absolute -top-16 -left-20 w-72 h-60 bg-[#DFF1F9] opacity-70 blur-[40px]" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 50% 60%' }} />
        <div className="absolute -top-10 -right-16 w-80 h-72 bg-[#FFD9DC] opacity-60 blur-[50px]" style={{ borderRadius: '60% 40% 30% 70% / 60% 70% 30% 40%' }} />
        <div className="absolute -bottom-8 left-[40%] w-60 h-48 bg-[#FFF7D4] opacity-60 blur-[35px]" style={{ borderRadius: '50% 50% 60% 40% / 60% 40% 50% 50%' }} />

        <div className="relative text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 bg-[rgba(110,193,228,.18)] text-[#2E96C8] rounded-full font-bold text-sm tracking-widest uppercase mb-4">
            📚 Le journal
          </span>
          <h1 className="m-0 font-bold leading-tight text-bj-text" style={{ fontSize: 'clamp(2.2rem, 4.6vw, 3.4rem)' }}>
            Le blog de <span className="text-[#FF8C94]">Bibli&apos;o Jouets</span>
          </h1>
          <p className="mt-4 mx-auto max-w-xl text-[1.1rem] leading-relaxed text-[#5C4A4F]">
            Conseils d&apos;experts de la petite enfance, écologie au quotidien et
            astuces pour accompagner le développement de votre enfant —{' '}
            <strong>par notre équipe et des parents comme vous</strong>.
          </p>
        </div>
      </header>

      <div className="px-[6vw] pb-8">
        <CategoryFilter active={filter} onChange={(c) => { setFilter(c); setPage(1); }} />
      </div>

      <div className="px-[6vw] grid gap-7" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))' }}>
        {list.map((a) => <ArticleCard key={a.id} article={a} />)}
      </div>

      {/* TODO: replace with server-side pagination */}
      <div className="flex justify-center gap-2.5 mt-12">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className="w-11 h-11 rounded-full font-bold text-[15px] flex items-center justify-center transition-all"
            style={{
              background: page === n ? '#FF8C94' : 'white',
              color: page === n ? 'white' : '#2E1D21',
              boxShadow: page === n ? '0 4px 14px rgba(255,140,148,.55)' : '0 2px 8px rgba(46,29,33,.08)',
            }}
          >
            {n}
          </button>
        ))}
        <button className="h-11 px-5 rounded-full bg-white font-bold text-sm text-bj-text flex items-center gap-1.5 shadow-[0_2px_8px_rgba(46,29,33,.08)]">
          Suivant
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
