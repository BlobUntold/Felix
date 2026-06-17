import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';

type PortfolioItem = {
 id: string;
 title: string;
 slug: string;
 is_featured: boolean;
};

export default async function AdminPortfolioPage() {
 const supabase = await createSupabaseServerClient();
 const { data: items, error } = await supabase
	.from('portfolio_items')
	.select('id, title, slug, is_featured')
	.order('sort_order', { ascending: true });

 return (
 <main className="page-section">
 <div className="container-shell">
 <div className="section-head">
 <div>
 <p className="eyebrow">Admin</p>
 <h1 className="section-title">Portfolio</h1>
 </div>

 <Link href="/admin/portfolio/new" className="button-primary">
 New Portfolio Item
 </Link>
 </div>

 {error? (
 <div className="detail-panel">
 <p>Unable to load portfolio items.</p>
 <p className="section-copy">{error.message}</p>
 </div>
 ): (
 <div className="detail-stack">
 {items?.length? (
 items.map((item: PortfolioItem) => (
 <div key={item.id} className="detail-panel">
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
 {item.is_featured? 'featured': 'portfolio item'}
 </p>
 <h2 style={{ margin: '8px 0 0' }}>{item.title}</h2>
 <p className="section-copy" style={{ marginTop: 8 }}>
 /portfolio/{item.slug}
 </p>
 </div>

 <Link
 href={`/admin/portfolio/${item.id}`}
 className="button-secondary"
 >
 Edit
 </Link>
 </div>
 </div>
 ))
 ): (
 <div className="detail-panel">
 <p>No portfolio items yet.</p>
 </div>
 )}
 </div>
 )}
 </div>
 </main>
 );
}