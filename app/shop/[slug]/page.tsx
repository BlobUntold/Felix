import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Product = {
 id: string;
 name: string;
 slug: string;
 short_description: string | null;
 description: string | null;
 status: string;
 pricing_mode: string;
 fixed_price: number | null;
 price_from: number | null;
 price_to: number | null;
 availability_label: string | null;
 fabric_details: string | null;
 sizing_details: string | null;
 care_details: string | null;
 timeline_details: string | null;
 customization_details: string | null;
 featured_image_url: string | null;
};

type ProductImage = {
 id: string;
 image_url: string;
 alt_text: string | null;
};

type PageProps = {
 params: Promise<{ slug: string }>;
};

function formatPrice(product: Product) {
 if (product.pricing_mode === 'fixed' && product.fixed_price!== null) {
 return `$${product.fixed_price}`;
 }

 if (product.pricing_mode === 'from' && product.price_from!== null) {
 return `From $${product.price_from}`;
 }

 if (
 product.pricing_mode === 'range' &&
 product.price_from!== null &&
 product.price_to!== null
 ) {
 return `$${product.price_from} — $${product.price_to}`;
 }

 if (product.pricing_mode === 'consultation') {
 return 'Consultation required';
 }

 return 'Price on request';
}

export default async function ProductPage({ params }: PageProps) {
 const { slug } = await params;

 const { data: product, error } = await supabase
.from('products')
.select(`
 id,
 name,
 slug,
 short_description,
 description,
 status,
 pricing_mode,
 fixed_price,
 price_from,
 price_to,
 availability_label,
 fabric_details,
 sizing_details,
 care_details,
 timeline_details,
 customization_details,
 featured_image_url
 `)
.eq('slug', slug)
.single();

 if (error ||!product) {
 notFound();
 }

 const { data: images } = await supabase
.from('product_images')
.select('id, image_url, alt_text')
.eq('product_id', product.id)
.order('sort_order', { ascending: true });

 return (
 <main>
 <section className="page-header">
 <div className="container-shell">
 <h1>{product.name}</h1>
 <p>{product.short_description}</p>
 </div>
 </section>

 <section className="page-section">
 <div className="container-shell detail-layout">
 <div className="detail-stack">
 <div className="gallery-grid">
 {images && images.length > 0? (
 images.map((image: ProductImage) => (
 <div key={image.id} className="gallery-tile">
 <img src={image.image_url} alt={image.alt_text || product.name} />
 </div>
 ))
 ): product.featured_image_url? (
 <div className="gallery-tile">
 <img src={product.featured_image_url} alt={product.name} />
 </div>
 ): null}
 </div>

 {product.description? (
 <section className="detail-panel">
 <h2>Description</h2>
 <p className="section-copy">{product.description}</p>
 </section>
 ): null}

 <div className="info-grid">
 {product.fabric_details? (
 <section className="detail-panel">
 <h3>Fabric</h3>
 <p className="section-copy">{product.fabric_details}</p>
 </section>
 ): null}

 {product.sizing_details? (
 <section className="detail-panel">
 <h3>Sizing</h3>
 <p className="section-copy">{product.sizing_details}</p>
 </section>
 ): null}

 {product.care_details? (
 <section className="detail-panel">
 <h3>Care</h3>
 <p className="section-copy">{product.care_details}</p>
 </section>
 ): null}
 </div>

 {(product.timeline_details || product.customization_details) && (
 <div className="info-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
 {product.timeline_details? (
 <section className="detail-panel">
 <h3>Timeline</h3>
 <p className="section-copy">{product.timeline_details}</p>
 </section>
 ): null}

 {product.customization_details? (
 <section className="detail-panel">
 <h3>Customization</h3>
 <p className="section-copy">{product.customization_details}</p>
 </section>
 ): null}
 </div>
 )}
 </div>

 <aside className="detail-panel">
 <p className="card-meta">Product Details</p>
 <h2 style={{ marginTop: 0 }}>{formatPrice(product)}</h2>
 <p className="section-copy">
 {product.availability_label || product.status.replaceAll('_', ' ')}
 </p>

 <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
 <a href="/custom-orders" className="button-primary">
 Inquire
 </a>
 <a href="/portfolio" className="button-secondary">
 View Portfolio
 </a>
 </div>
 </aside>
 </div>
 </section>
 </main>
 );
}