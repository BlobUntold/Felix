import { createSupabaseServerClient } from '@/lib/supabase-server';

type Inquiry = {
 id: string;
 name: string;
 email: string;
 garment_type: string | null;
 status: string;
 created_at: string;
};

export default async function AdminInquiriesPage() {
 const supabase = await createSupabaseServerClient();
 const { data: inquiries, error } = await supabase
	.from('inquiries')
	.select('id, name, email, garment_type, status, created_at')
	.order('created_at', { ascending: false });

 return (
 <main className="page-section">
 <div className="container-shell">
 <p className="eyebrow">Admin</p>
 <h1 className="section-title">Inquiries</h1>

 {error? (
 <div className="detail-panel" style={{ marginTop: 24 }}>
 <p>Unable to load inquiries.</p>
 <p className="section-copy">{error.message}</p>
 </div>
 ): (
 <div className="detail-stack" style={{ marginTop: 24 }}>
 {inquiries?.length? (
 inquiries.map((inquiry: Inquiry) => (
 <div key={inquiry.id} className="detail-panel">
 <p className="card-meta">
 {inquiry.status} · {new Date(inquiry.created_at).toLocaleDateString()}
 </p>
 <h2 style={{ margin: '8px 0 0' }}>{inquiry.name}</h2>
 <p className="section-copy" style={{ marginTop: 8 }}>
 {inquiry.email}
 </p>
 {inquiry.garment_type? (
 <p className="section-copy" style={{ marginTop: 8 }}>
 {inquiry.garment_type}
 </p>
 ): null}
 </div>
 ))
 ): (
 <div className="detail-panel">
 <p>No inquiries yet.</p>
 </div>
 )}
 </div>
 )}
 </div>
 </main>
 );
}