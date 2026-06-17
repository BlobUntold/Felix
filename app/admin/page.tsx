import Link from 'next/link';

export default function AdminPage() {
 return (
 <main className="page-section">
 <div className="container-shell">
 <p className="eyebrow">Admin</p>
 <h1 className="section-title">Dashboard</h1>
 <p className="section-copy">
 Manage products, categories, portfolio items, inquiries, and bookings.
 </p>

 <div className="card-grid" style={{ marginTop: 32 }}>
 <Link href="/admin/products" className="luxury-card">
 <div className="card-body">
 <p className="card-meta">Admin</p>
 <h2 className="card-title">Products</h2>
 <p className="card-copy">Create, edit, and organize shop products.</p>
 </div>
 </Link>

 <Link href="/admin/product-categories" className="luxury-card">
 <div className="card-body">
 <p className="card-meta">Admin</p>
 <h2 className="card-title">Product Categories</h2>
 <p className="card-copy">Manage categories for shop products.</p>
 </div>
 </Link>

 <Link href="/admin/portfolio" className="luxury-card">
 <div className="card-body">
 <p className="card-meta">Admin</p>
 <h2 className="card-title">Portfolio</h2>
 <p className="card-copy">Manage portfolio entries and featured work.</p>
 </div>
 </Link>

 <Link href="/admin/portfolio-categories" className="luxury-card">
 <div className="card-body">
 <p className="card-meta">Admin</p>
 <h2 className="card-title">Portfolio Categories</h2>
 <p className="card-copy">Manage categories for portfolio sections.</p>
 </div>
 </Link>

 <Link href="/admin/inquiries" className="luxury-card">
 <div className="card-body">
 <p className="card-meta">Admin</p>
 <h2 className="card-title">Inquiries</h2>
 <p className="card-copy">Review custom order inquiries from clients.</p>
 </div>
 </Link>

 <Link href="/admin/bookings" className="luxury-card">
 <div className="card-body">
 <p className="card-meta">Admin</p>
 <h2 className="card-title">Bookings</h2>
 <p className="card-copy">Review appointment requests and statuses.</p>
 </div>
 </Link>



  <Link href="/admin/testimonials" className="luxury-card">
 <div className="card-body">
 <p className="card-meta">Admin</p>
 <h2 className="card-title">Testimonials</h2>
 <p className="card-copy">Manage client testimonials and featured quotes.</p>
 </div>
 </Link>
 </div>
 </div>
 </main>
 );
}