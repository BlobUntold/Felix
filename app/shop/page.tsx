import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Product = {
 id: string;
 name: string;
 slug: string;
 short_description: string | null;
 status: string;
 pricing_mode: string;
 featured_image_url: string | null;
};

function formatPricingLabel(product: Product) {
 switch (product.pricing_mode) {
 case 'fixed':
 return 'Fixed Price';
 case 'from':
 return 'From Price';
 case 'range':
 return 'Range Price';
 case 'consultation':
 return 'Consultation';
 default:
 return product.pricing_mode;
 }
}

export default async function ShopPage() {
 const { data: products, error } = await supabase
.from('products')
.select('id, name, slug, short_description, status, pricing_mode, featured_image_url')
.neq('status', 'draft')
.order('sort_order', { ascending: true });

 if (error) {
 return (
 <main className="container-shell page-section">
 <p>Unable to load shop items.</p>
 </main>
 );
 }

 return (
 <main>
 <section className="page-header">
 <div className="container-shell">
 <h1>Shop</h1>
 <p>
 A curated selection of garments shaped by atelier construction, bold silhouette,
 and a minimal luxury point of view.
 </p>
 </div>
 </section>

 <section className="page-section">
 <div className="container-shell">
 <div className="card-grid">
 {products?.map((product: Product) => (
 <Link key={product.id} href={`/shop/${product.slug}`} className="luxury-card">
 <div className="luxury-image">
 {product.featured_image_url? (
 <img src={product.featured_image_url} alt={product.name} />
 ): null}
 </div>

 <div className="card-body">
 <p className="card-meta">
 {product.status.replaceAll('_', ' ')} · {formatPricingLabel(product)}
 </p>
 <h2 className="card-title">{product.name}</h2>
 <p className="card-copy">{product.short_description}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>
 </main>
 );
}