import Link from 'next/link';
import Image from 'next/image';
import '@/styles/blogs/blogList.css';

const CAT_COLORS = {
  Éveil:    { bg: '#FFD9DC', fg: '#FF8C94' },
  Écologie: { bg: '#DAEEE6', fg: '#3DA876' },
  Conseils: { bg: '#DFF1F9', fg: '#2E96C8' },
  Hygiène:  { bg: '#FFF7D4', fg: '#C19A1B' },
};

export default function BlogCard({ article }) {
  const cat = CAT_COLORS[article.category] ?? { bg: '#F0E8E0', fg: '#8C7B7F' };
  const initials = article.author.split(' ').map((s) => s[0]).slice(0, 2).join('');

  return (
    <Link href={`/blogs/${article.slug}`} className="blog-card">
      <div className="blog-card__img-wrap">
        <div className="blog-card__img-inner">
          {article.thumbnail ? (
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 400px"
            />
          ) : (
            <div style={{ background: '#F4EFE9', width: '100%', height: '100%' }} />
          )}
        </div>
        <span className="blog-card__cat" style={{ background: cat.bg, color: cat.fg }}>
          {article.category}
        </span>
      </div>

      <div className="blog-card__body">
        <h3 className="blog-card__title">{article.title}</h3>
        {article.excerpt && (
          <p className="blog-card__excerpt">{article.excerpt}</p>
        )}

        <div className="blog-card__footer">
          <div className="blog-card__author">
            <div className="blog-card__avatar">{initials}</div>
            <div>
              <div className="blog-card__author-name">{article.author}</div>
              <div className="blog-card__author-meta">
                {article.date ?? article.createdAt}
                {article.readTime ? ` · ${article.readTime}` : ''}
              </div>
            </div>
          </div>

          <div className="blog-card__arrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
