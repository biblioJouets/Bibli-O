import Image from 'next/image';
import '@/styles/blogs/blogArticle.css';

export default function BlogImage({ value, alt = '' }) {
  if (!value) return null;
  return (
    <div className="block-image">
      <Image src={value} alt={alt} fill className="object-cover" sizes="1440px" />
    </div>
  );
}
