import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';

type Product = {
 id: string;
 name: string;
 slug: string;
 status: string;
 pricing_mode: string;
 is_featured: boolean;
};

export default async function AdminProductsPage() {
 const supabase = await createSupabaseServerClient();
 const { data: products, error } = await supabase
	.from('products')
	.select('id, name, slug, status, pricing_mode, is_featured')
	.order('sort_order', { ascending: true });

 return (
 <main className="page-section">
 <div className="container-shell">
 <div className="section-head">
 <div>
 <p className="eyebrow">Admin</p>
 <h1 className="section-title">Products</h1>
 </div>

 <Link href="/admin/products/new" className="button-primary">
 New Product
 </Link>
 </div>

 {error? (
 <div className="detail-panel">
 <p>Unable to load products.</p>
 <p className="section-copy">{error.message}</p>
 </div>
 ): (
 <div className="detail-stack">
 {products?.length? (
 products.map((product: Product) => (
 <div key={product.id} className="detail-panel">
 <div
 style={{
 display: 'flex',
 justifyContent: 'space-between',
 gap: 16,
 alignItems: 'center',
 flexWrap: 'wrap',
 }}
 >
 <div>
 <p className="card-meta">
 {product.status} · {product.pricing_mode}
 {product.is_featured? ' · featured': ''}
 </p>
 <h2 style={{ margin: '8px 0 0' }}>{product.name}</h2>
 <p className="section-copy" style={{ marginTop: 8 }}>
 /shop/{product.slug}
 </p>
 </div>

 <Link
 href={`/admin/products/${product.id}`}
 className="button-secondary"
 >
 Edit
 </Link>
 </div>
 </div>
 ))
 ): (
 <div className="detail-panel">
 <p>No products yet.</p>
 </div>
 )}
 </div>
 )}
 </div>
 </main>
 );
}