import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type PortfolioImage = {
 id: string;
 image_url: string;
 alt_text: string | null;
};

type Testimonial = {
 client_name: string | null;
 quote: string;
 role_or_context: string | null;
};

type RelatedProduct = {
 name: string;
 slug: string;
};

type PageProps = {
 params: Promise<{ slug: string }>;
};

export default async function PortfolioItemPage({ params }: PageProps) {
 const { slug } = await params;

 const { data: item, error } = await supabase
.from('portfolio_items')
.select(`
 id,
 title,
 slug,
 description,
 related_product_id,
 testimonial_id,
 featured_image_url
 `)
.eq('slug', slug)
.single();

 if (error ||!item) {
 notFound();
 }

 const { data: images } = await supabase
.from('portfolio_images')
.select('id, image_url, alt_text')
.eq('portfolio_item_id', item.id)
.order('sort_order', { ascending: true });

 let testimonial: Testimonial | null = null;
 if (item.testimonial_id) {
 const { data } = await supabase
.from('testimonials')
.select('client_name, quote, role_or_context')
.eq('id', item.testimonial_id)
.single();

 testimonial = data;
 }

 let relatedProduct: RelatedProduct | null = null;
 if (item.related_product_id) {
 const { data } = await supabase
.from('products')
.select('name, slug')
.eq('id', item.related_product_id)
.single();

 relatedProduct = data;
 }

 return (
 <main>
 <section className="page-header">
 <div className="container-shell">
 <h1>{item.title}</h1>
 <p>{item.description || 'No description yet.'}</p>
 </div>
 </section>

 <section className="page-section">
 <div className="container-shell detail-layout">
 <div className="detail-stack">
 <div className="gallery-grid">
 {images && images.length > 0? (
 images.map((image: PortfolioImage) => (
 <div key={image.id} className="gallery-tile">
 <img src={image.image_url} alt={image.alt_text || item.title} />
 </div>
 ))
 ): item.featured_image_url? (
 <div className="gallery-tile">
 <img src={item.featured_image_url} alt={item.title} />
 </div>
 ): null}
 </div>

 {testimonial? (
 <section className="detail-panel">
 <p className="card-meta">Testimonial</p>
 <blockquote style={{ margin: 0, fontSize: '1.2rem', lineHeight: 1.6 }}>
 “{testimonial.quote}”
 </blockquote>
 <p style={{ marginTop: 16, color: 'var(--muted)' }}>
 {[testimonial.client_name, testimonial.role_or_context]
.filter(Boolean)
.join(' — ')}
 </p>
 </section>
 ): null}
 </div>

 <aside className="detail-panel">
 <p className="card-meta">Portfolio Details</p>
 <p className="section-copy">
 This piece is part of the Felix Gabino portfolio, showing a custom atelier
 approach to shape, finish, and styling.
 </p>

 <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
 {relatedProduct? (
 <Link href={`/shop/${relatedProduct.slug}`} className="button-primary">
 View Related Product
 </Link>
 ): null}

 <Link href="/custom-orders" className="button-secondary">
 Start a Custom Order
 </Link>
 </div>
 </aside>
 </div>
 </section>
 </main>
 );
}