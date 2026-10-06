import Link from 'next/link';
import BlogParagraph from './BlogParagraph';
import BlogList from './BlogList';
import BlogImage from './BlogImage';
import '@/styles/blogs/blogArticle.css';

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

function resolveHref(href) {
  if (!href || typeof href !== 'string') return '/abonnements';
  const trimmed = href.trim();
  if (!trimmed) return '/abonnements';

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    const protocol = new URL(trimmed).protocol.toLowerCase();
    if (SAFE_PROTOCOLS.has(protocol)) return trimmed;
  } catch {
    // URL relative invalide ou protocole non parseable
  }

  return '/abonnements';
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
      const isHttp = /^https?:\/\//i.test(href);
      const isMail = /^mailto:/i.test(href);
      const style = accentColor
        ? { background: accentColor, boxShadow: `0 4px 14px ${accentColor}80` }
        : undefined;

      if (isHttp || isMail) {
        return (
          <div className="block-cta">
            <a
              href={href}
              className="block-cta__btn"
              style={style}
              {...(isHttp ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
