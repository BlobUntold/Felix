import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';

type Testimonial = {
 id: string;
 client_name: string | null;
 quote: string;
 role_or_context: string | null;
 is_featured: boolean;
};

export default async function AdminTestimonialsPage() {
 const supabase = await createSupabaseServerClient();
 const { data: testimonials, error } = await supabase
	.from('testimonials')
	.select('id, client_name, quote, role_or_context, is_featured')
	.order('created_at', { ascending: false });

 return (
 <section className="page-section">
 <div className="container-shell">
 <div
 style={{
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 gap: '16px',
 flexWrap: 'wrap',
 marginBottom: '24px',
 }}
 >
 <div>
 <p className="card-meta">Admin</p>
 <h1>Testimonials</h1>
 </div>

 <Link
 href="/admin/testimonials/new"
 style={{
 display: 'inline-flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '12px 16px',
 border: '1px solid var(--border)',
 background: 'var(--card)',
 textTransform: 'uppercase',
 letterSpacing: '0.12em',
 fontSize: '0.82rem',
 }}
 >
 New Testimonial
 </Link>
 </div>

 {error? (
 <div className="detail-panel form-status-error">
 <div className="form-status-inner">
 <div className="form-status-icon">!</div>
 <div>
 <p className="form-status-title">Unable to load testimonials</p>
 <p className="form-status-message">{error.message}</p>
 </div>
 </div>
 </div>
 ): testimonials?.length? (
 <div className="form-stack">
 {testimonials.map((testimonial: Testimonial) => (
 <div key={testimonial.id} className="detail-panel">
 <p className="card-meta">
 {testimonial.is_featured? 'Featured': 'Standard'}
 {testimonial.role_or_context
? ` · ${testimonial.role_or_context}`
: ''}
 </p>

 <h2>{testimonial.client_name || 'Unnamed client'}</h2>

 <p
 style={{
 marginTop: '16px',
 lineHeight: 1.8,
 color: 'var(--muted)',
 whiteSpace: 'pre-wrap',
 }}
 >
 {testimonial.quote}
 </p>

 <div
 style={{
 display: 'flex',
 gap: '16px',
 flexWrap: 'wrap',
 marginTop: '20px',
 }}
 >
 <Link
 href={`/admin/testimonials/${testimonial.id}`}
 style={{
 textTransform: 'uppercase',
 letterSpacing: '0.12em',
 fontSize: '0.82rem',
 }}
 >
 Edit
 </Link>
 </div>
 </div>
 ))}
 </div>
 ): (
 <div className="detail-panel">
 <p style={{ margin: 0, color: 'var(--muted)' }}>
 No testimonials yet.
 </p>
 </div>
 )}
 </div>
 </section>
 );
}