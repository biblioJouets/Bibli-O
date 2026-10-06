import Link from 'next/link';
import BlogCard from '@/components/blogs/BlogCard';
import '@/styles/blogPresentation.css';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Section immersive « Le Mag' » — 3 derniers articles publiés.
 * @param {{ articles?: Array<Record<string, unknown>> }} props
 */
export default function BlogPresentation({ articles = [] }) {
  const posts = articles.slice(0, 3).map((article) => ({
    ...article,
    date: formatDate(article.createdAt),
  }));

  return (
    <section
      className="blog-presentation"
      aria-labelledby="blog-presentation-title"
    >
      <div className="blog-presentation__inner">
        <header className="text-center mb-8 md:mb-10">
          <h2 className="blog-presentation__title" id="blog-presentation-title">
            Conseils, éveil &amp; <span>écologie</span>
          </h2>
          <p className="blog-presentation__subtitle">
            Découvrez nos derniers articles pour accompagner le jeu, gagner de la place
            et adopter des gestes plus doux au quotidien. Louez, Jouez, Échangez&nbsp;!
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="blog-presentation__empty">
            <p className="m-0 mb-4">Les premiers articles arrivent très bientôt.</p>
            <Link href="/blogs" className="blog-presentation__cta">
              Découvrir Le Mag&apos;
            </Link>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none m-0 p-0">
              {posts.map((article) => (
                <li key={article.id}>
                  <BlogCard article={article} />
                </li>
              ))}
            </ul>

            <div className="text-center">
              <Link href="/blogs" className="blog-presentation__cta">
                Tous les articles
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
