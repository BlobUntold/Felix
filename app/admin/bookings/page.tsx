import { createSupabaseServerClient } from '@/lib/supabase-server';

type Booking = {
 id: string;
 name: string;
 email: string;
 appointment_type: string;
 preferred_date: string;
 preferred_time: string;
 status: string;
};

export default async function AdminBookingsPage() {
 const supabase = await createSupabaseServerClient();
 const { data: bookings, error } = await supabase
	.from('bookings')
	.select('id, name, email, appointment_type, preferred_date, preferred_time, status')
	.order('preferred_date', { ascending: false });

 return (
 <main className="page-section">
 <div className="container-shell">
 <p className="eyebrow">Admin</p>
 <h1 className="section-title">Bookings</h1>

 {error? (
 <div className="detail-panel" style={{ marginTop: 24 }}>
 <p>Unable to load bookings.</p>
 <p className="section-copy">{error.message}</p>
 </div>
 ): (
 <div className="detail-stack" style={{ marginTop: 24 }}>
 {bookings?.length? (
 bookings.map((booking: Booking) => (
 <div key={booking.id} className="detail-panel">
 <p className="card-meta">
 {booking.status} · {booking.appointment_type}
 </p>
 <h2 style={{ margin: '8px 0 0' }}>{booking.name}</h2>
 <p className="section-copy" style={{ marginTop: 8 }}>
 {booking.email}
 </p>
 <p className="section-copy" style={{ marginTop: 8 }}>
 {booking.preferred_date} at {booking.preferred_time}
 </p>
 </div>
 ))
 ): (
 <div className="detail-panel">
 <p>No bookings yet.</p>
 </div>
 )}
 </div>
 )}
 </div>
 </main>
 );
}