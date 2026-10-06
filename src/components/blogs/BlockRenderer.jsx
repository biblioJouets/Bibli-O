import Link from 'next/link';
import BlogParagraph from './BlogParagraph';
import BlogList from './BlogList';
import BlogImage from './BlogImage';
import '@/styles/blogs/blogArticle.css';

function resolveHref(href) {
  if (!href || typeof href !== 'string') return '/abonnements';
  const trimmed = href.trim();
  return trimmed || '/abonnements';
}

export default function BlockRenderer({ block, accentColor }) {
  switch (block.type) {
    case 'h':
      return <h2 className="block-heading">{block.value}</h2>;

    case 'p':
      return <BlogParagraph value={block.value} />;

    case 'q':
      return (
        <blockquote className="block-quote">
          <div
            className="block-quote__mark"
            style={accentColor ? { background: accentColor } : undefined}
          >
            &ldquo;
          </div>
          <p className="block-quote__text">{block.value}</p>
        </blockquote>
      );

    case 'l':
      return <BlogList value={block.value} />;

    case 'i':
      return <BlogImage value={block.value} />;

    case 'b': {
      const href = resolveHref(block.href);
      const isExternal = /^https?:\/\//i.test(href);
      const style = accentColor
        ? { background: accentColor, boxShadow: `0 4px 14px ${accentColor}80` }
        : undefined;

      if (isExternal) {
        return (
          <div className="block-cta">
            <a
              href={href}
              className="block-cta__btn"
              style={style}
              target="_blank"
              rel="noopener noreferrer"
            >
              {block.value}
            </a>
          </div>
        );
      }

      return (
        <div className="block-cta">
          <Link href={href} className="block-cta__btn" style={style}>
            {block.value}
          </Link>
        </div>
      );
    }

    default:
      return null;
  }
}
