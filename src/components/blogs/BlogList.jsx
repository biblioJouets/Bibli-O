import '@/styles/blogs/blogArticle.css';

const ACCENTS = ['#FFD9DC', '#DFF1F9', '#FFF7D4', '#DAEEE6', '#FFE0F0'];

export default function BlogList({ value }) {
  if (!Array.isArray(value)) return null;
  return (
    <ol className="block-list">
      {value.map((item, i) => (
        <li key={i} className="block-list__item">
          <span
            className="block-list__num"
            style={{ background: ACCENTS[i % ACCENTS.length] }}
          >
            {i + 1}
          </span>
          <span className="block-list__text">{item}</span>
        </li>
      ))}
    </ol>
  );
}
