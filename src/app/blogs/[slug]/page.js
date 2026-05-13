'use client';

import Image from 'next/image';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Données placeholder
// TODO: replace with getArticleBySlug(params.slug)
// ---------------------------------------------------------------------------
const ARTICLE = {
  slug: '5-jeux-motricite-fine-bebe',
  cat: 'Éveil',
  title: "5 jeux pour développer la motricité fine de bébé",
  excerpt: "Avant 2 ans, les petites mains n'arrêtent pas. Voici notre sélection de jouets en bois qui transforment chaque attrape en victoire.",
  img: '/assets/imageEnfant.webp',
  author: "L'équipe Bibli'o",
  authorInitials: 'LB',
  date: '15 avril 2026',
  readTime: '5 min',
  blocks: [
    { type: 'p', value: "Vers 6 mois, votre bébé commence à attraper, lâcher, retourner. Cette motricité fine ne se développe pas toute seule — elle a besoin d'objets aux textures, poids et formes variés. Et c'est précisément là que les jouets en bois bien pensés font des miracles." },
    { type: 'h', value: 'Pourquoi le bois plutôt que le plastique ?' },
    { type: 'p', value: "Le bois a un poids réel. Quand bébé attrape un cube en hêtre, son cerveau enregistre la masse, la rugosité, la chaleur. Le plastique creux, lui, glisse et ne « parle » pas à la main." },
    { type: 'q', value: "Un jouet bien pensé devient l'extension de la main de l'enfant — et c'est par cette main qu'il découvre le monde." },
    { type: 'h', value: 'Notre sélection en 5 jouets' },
    { type: 'l', value: ["La boîte à formes", "L'arc-en-ciel à empiler", "Le xylophone", "Le tableau d'activités", "Les anneaux à enfiler"] },
    { type: 'b', value: 'Voir le catalogue' },
  ],
};

const RECOMMENDED = [
  { name: 'Boîte à formes Janod', brand: 'Janod', price: '4€/mois', age: '12-36 mois', img: '/assets/logo/janod.webp' },
  { name: 'Xylophone arc-en-ciel', brand: 'Hape', price: '5€/mois', age: '18-48 mois', img: '/assets/logo/Hape.webp' },
  { name: "Jeu d'empilage en bois", brand: 'Little Dutch', price: '3€/mois', age: '6-24 mois', img: '/assets/logo/littledutch.webp' },
];

const CAT_COLORS = {
  Éveil:    { bg: '#FFD9DC', fg: '#FF8C94' },
  Écologie: { bg: '#DAEEE6', fg: '#3DA876' },
  Conseils: { bg: '#DFF1F9', fg: '#2E96C8' },
  Hygiène:  { bg: '#FFF7D4', fg: '#C19A1B' },
};

const BLOCK_ACCENT = ['#FFD9DC', '#DFF1F9', '#FFF7D4', '#DAEEE6', '#FFE0F0'];

function RenderBlock({ block, index }) {
  switch (block.type) {
    case 'h':
      return (
        <h2 className="font-bold text-[1.7rem] mt-9 mb-3 text-bj-text leading-snug">
          {block.value}
        </h2>
      );
    case 'p':
      return <p className="leading-[1.75] text-bj-text">{block.value}</p>;
    case 'q':
      return (
        <blockquote className="my-8 px-7 py-6 bg-[#DFF1F9] rounded-[25px] relative">
          <div className="absolute -top-3.5 left-6 w-9 h-9 rounded-full bg-[#6EC1E4] flex items-center justify-center text-white font-black text-[22px]">
            &ldquo;
          </div>
          <p className="m-0 font-semibold text-[1.2rem] leading-[1.45] text-bj-text">
            {block.value}
          </p>
        </blockquote>
      );
    case 'l':
      return (
        <ol className="p-0 m-0 list-none flex flex-col gap-4">
          {block.value.map((item, i) => (
            <li key={i} className="flex gap-4 items-start">
              <div
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] text-bj-text"
                style={{ background: BLOCK_ACCENT[i % BLOCK_ACCENT.length] }}
              >
                {i + 1}
              </div>
              <span className="leading-relaxed pt-1.5">{item}</span>
            </li>
          ))}
        </ol>
      );
    case 'i':
      return (
        <div className="relative h-56 rounded-[20px] overflow-hidden my-2">
          <Image src={block.value} alt="" fill className="object-cover" sizes="720px" />
        </div>
      );
    case 'b':
      return (
        <div className="flex justify-center my-4">
          <Link
            href="/abonnement"
            className="px-7 py-3 bg-[#FF8C94] text-white rounded-full font-bold text-[15px] shadow-[0_4px_14px_rgba(255,140,148,.5)] transition-transform hover:-translate-y-0.5"
          >
            {block.value}
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export default function ArticleDetailPage({ params }) {
  // TODO: replace with getArticleBySlug(params.slug)
  const article = ARTICLE;
  const cat = CAT_COLORS[article.cat];

  return (
    <div className="bg-[#FFFAF4] w-full pb-20">

      <nav className="px-[6vw] pt-6 pb-0 text-sm text-[#8C7B7F] flex gap-2 items-center flex-wrap">
        <Link href="/blogs" className="hover:text-bj-text transition-colors">Blog</Link>
        <span>›</span>
        <span className="cursor-pointer hover:text-bj-text transition-colors">{article.cat}</span>
        <span>›</span>
        <span className="text-bj-text font-medium truncate max-w-xs">{article.title}</span>
      </nav>

      <header className="px-[6vw] pt-8">
        <div className="max-w-[820px] mx-auto text-center">
          <span
            className="inline-block px-4 py-2 rounded-full font-bold text-[13px] tracking-widest uppercase"
            style={{ background: cat.bg, color: cat.fg }}
          >
            {article.cat}
          </span>

          <h1
            className="mt-4 mb-4 font-bold leading-[1.18] text-bj-text"
            style={{ fontSize: 'clamp(2rem, 4.4vw, 3rem)' }}
          >
            {article.title}
          </h1>
          <p className="m-0 text-[1.15rem] leading-relaxed text-[#5C4A4F]">
            {article.excerpt}
          </p>

          <div className="flex gap-4 items-center justify-center mt-6 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-full bg-[#FFD9DC] flex items-center justify-center font-bold text-sm text-[#FF8C94]">
                {article.authorInitials}
              </div>
              <div className="text-left leading-tight">
                <div className="text-sm font-bold text-bj-text">{article.author}</div>
                <div className="text-xs text-[#8C7B7F]">{article.date}</div>
              </div>
            </div>
            <span className="text-[#E0D2C2]">·</span>
            <span className="text-[13px] text-[#8C7B7F] flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {article.readTime} de lecture
            </span>
          </div>
        </div>

        <div
          className="mt-9 rounded-[25px] overflow-hidden relative shadow-[0_14px_36px_rgba(46,29,33,.10)]"
          style={{ height: 'min(46vw, 460px)' }}
        >
          <Image
            src={article.img}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div
            className="absolute -top-10 -right-10 w-48 h-40 bg-[#FFE264] opacity-45 blur-[28px]"
            style={{ borderRadius: '60% 40% 30% 70% / 60% 70% 30% 40%' }}
          />
        </div>
      </header>

      <div className="grid justify-center px-[6vw] pt-10" style={{ gridTemplateColumns: 'minmax(0, 720px)' }}>
        <article className="text-[1.05rem] leading-[1.75] text-bj-text flex flex-col gap-4">
          {article.blocks.map((block, i) => (
            <RenderBlock key={i} block={block} index={i} />
          ))}
        </article>
      </div>

      <section className="px-[6vw] mt-16 bg-[#FFF7EB]">
        <div className="max-w-[1180px] mx-auto py-10">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 bg-[#DAEEE6] text-[#3DA876] rounded-full font-bold text-xs tracking-widest uppercase mb-3">
              À louer dès maintenant
            </span>
            <h2 className="m-0 font-bold text-[2rem] text-bj-text">
              Les jouets de cet article
            </h2>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {RECOMMENDED.map((p) => (
              <div key={p.name} className="bg-white rounded-[25px] p-3.5 shadow-[0_4px_20px_rgba(46,29,33,.06)] flex flex-col gap-2.5">
                <div className="relative aspect-square rounded-[18px] overflow-hidden bg-[#F4F1EC]">
                  <Image src={p.img} alt={p.name} fill className="object-cover" sizes="280px" />
                </div>
                <div className="px-1.5 pb-2">
                  <div className="text-[11px] text-[#8C7B7F] uppercase tracking-wider">{p.brand}</div>
                  <div className="font-bold text-[1rem] text-bj-text mt-1 mb-2 leading-snug">{p.name}</div>
                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <div className="text-[13px] font-bold text-[#FF8C94]">{p.price}</div>
                      <div className="text-[11px] text-[#8C7B7F]">{p.age}</div>
                    </div>
                    <button className="w-9 h-9 rounded-full bg-[#88D4AB] flex items-center justify-center text-white shadow-[0_4px_10px_rgba(136,212,171,.5)] transition-transform hover:scale-110 shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link
              href="/bibliotheque"
              className="px-7 py-3.5 bg-[#6EC1E4] text-white rounded-full font-bold text-[15px] shadow-[0_4px_14px_rgba(110,193,228,.5)] transition-transform hover:-translate-y-0.5"
            >
              Voir tout le catalogue →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
