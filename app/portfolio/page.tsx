import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type PortfolioItem = {
 id: string;
 title: string;
 slug: string;
 description: string | null;
 is_featured: boolean;
 featured_image_url: string | null;
};

export default async function PortfolioPage() {
 const { data: items, error } = await supabase
.from('portfolio_items')
.select('id, title, slug, description, is_featured, featured_image_url')
.order('sort_order', { ascending: true });

 if (error) {
 return (
 <main className="container-shell page-section">
 <p>Unable to load portfolio items.</p>
 </main>
 );
 }

 return (
 <main>
 <section className="page-header">
 <div className="container-shell">
 <h1>Portfolio</h1>
 <p>
 Selected work across bridal, evening, and custom atelier projects with an
 emphasis on silhouette, image, and detail.
 </p>
 </div>
 </section>

 <section className="page-section">
 <div className="container-shell">
 <div className="card-grid">
 {items?.map((item: PortfolioItem) => (
 <Link key={item.id} href={`/portfolio/${item.slug}`} className="luxury-card">
 <div className="luxury-image">
 {item.featured_image_url? (
 <img src={item.featured_image_url} alt={item.title} />
 ): null}
 </div>

 <div className="card-body">
 <p className="card-meta">
 {item.is_featured? 'Featured Portfolio': 'Portfolio'}
 </p>
 <h2 className="card-title">{item.title}</h2>
 <p className="card-copy">{item.description}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>
 </main>
 );
}