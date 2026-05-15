import Link from 'next/link';
import BlogParagraph from './BlogParagraph';
import BlogList from './BlogList';
import BlogImage from './BlogImage';
import '@/styles/blogs/blogArticle.css';

const ACCENTS = ['#FFD9DC', '#DFF1F9', '#FFF7D4', '#DAEEE6', '#FFE0F0'];

export default function BlockRenderer({ block, index }) {
  switch (block.type) {
    case 'h':
      return <h2 className="block-heading">{block.value}</h2>;

    case 'p':
      return <BlogParagraph value={block.value} />;

    case 'q':
      return (
        <blockquote className="block-quote">
          <div className="block-quote__mark">&ldquo;</div>
          <p className="block-quote__text">{block.value}</p>
        </blockquote>
      );

    case 'l':
      return <BlogList value={block.value} />;

    case 'i':
      return <BlogImage value={block.value} />;

    case 'b':
      return (
        <div className="block-cta">
          <Link href="/abonnements" className="block-cta__btn">
            {block.value}
          </Link>
        </div>
      );

    default:
      return null;
  }
}
