import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';

type Product = {
	id: string;
	name: string;
	slug: string;
	short_description: string | null;
	featured_image_url: string | null;
};

type PortfolioItem = {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	featured_image_url: string | null;
};

type SiteSettings = {
	about_text?: string | null;
	home_hero_title?: string | null;
	home_hero_subtitle?: string | null;
	home_contact_text?: string | null;
	contact_email?: string | null;
	contact_phone?: string | null;
};

export default async function HomePage() {
	const supabase = await createSupabaseServerClient();

	const [{ data: products }, { data: portfolioItems }, { data: settings }] =
		await Promise.all([
			supabase
				.from('products')
				.select('id, name, slug, short_description, featured_image_url')
				.eq('is_featured', true)
				.neq('status', 'draft')
				.order('sort_order', { ascending: true })
				.limit(3),
			supabase
				.from('portfolio_items')
				.select('id, title, slug, description, featured_image_url')
				.eq('is_featured', true)
				.order('sort_order', { ascending: true })
				.limit(3),
			supabase
				.from('site_settings')
				.select(
					'about_text, home_hero_title, home_hero_subtitle, home_contact_text, contact_email, contact_phone'
				)
				.limit(1)
				.single(),
		]);

	const site = settings as SiteSettings | null;

 return (
 <main>
 <section className="hero-shell">
 <div className="container-shell hero-grid-premium">
 <div className="hero-panel hero-panel-copy">
 <p className="eyebrow">Felix Gabino</p>

 <h1 className="hero-title hero-title-premium">
 {site?.home_hero_title || 'Custom garments shaped through an artisan atelier lens.'}
 </h1>

 <p className="hero-subcopy hero-subcopy-premium">
 {site?.home_hero_subtitle ||
 'A fashion-focused atelier for bridal, evening, and custom pieces with a personal, design-led approach.'}
 </p>

 <div className="hero-actions hero-actions-premium">
 <Link href="/custom-orders" className="button-primary">
 Start a Custom Order
 </Link>
 <Link href="/portfolio" className="button-secondary">
 View Portfolio
 </Link>
 <Link href="/shop" className="button-secondary">
 Shop Pieces
 </Link>
 </div>

 <div className="hero-points">
 <div className="hero-point">
 <span className="hero-point-label">Bridal</span>
 </div>
 <div className="hero-point">
 <span className="hero-point-label">Evening</span>
 </div>
 <div className="hero-point">
 <span className="hero-point-label">Custom Work</span>
 </div>
 </div>
 </div>

 <div className="hero-panel hero-panel-image">
 <img src="/images/duo.png" alt="Felix Gabino editorial desert shoot" className="hero-main-image" />
 <div className="hero-image-overlay-card">
 <p className="card-meta">Felix Gabino</p>
 <p className="hero-overlay-copy">
 Bridal, evening, and custom garments with an artisan approach to silhouette,
 finish, and image.
 </p>
</div>
 </div>
 </div>
 </section>

 <section className="page-section">
 <div className="container-shell">
 <div className="conversion-strip">
 <div className="conversion-card">
 <p className="card-meta">Shop</p>
 <h3>Explore ready pieces</h3>
 <p className="section-copy">
 View selected garments available for purchase or inquiry.
 </p>
 <Link href="/shop" className="text-link">
 Enter shop
 </Link>
 </div>

 <div className="conversion-card">
 <p className="card-meta">Portfolio</p>
 <h3>View finished work</h3>
 <p className="section-copy">
 See bridal, evening, and custom atelier projects in more detail.
 </p>
 <Link href="/portfolio" className="text-link">
 View portfolio
 </Link>
 </div>

 <div className="conversion-card">
 <p className="card-meta">Custom Orders</p>
 <h3>Request a consultation</h3>
 <p className="section-copy">
 Start a booking or inquiry for a more personal custom process.
 </p>
 <Link href="/custom-orders" className="text-link">
 Start request
 </Link>
 </div>
 </div>
 </div>
 </section>

 <section className="page-section">
 <div className="container-shell">
 <p className="eyebrow">Featured Products</p>
 <div className="section-head">
 <h2 className="section-title">Selected pieces for the shop.</h2>
 <Link href="/shop" className="button-secondary">
 All Products
 </Link>
 </div>

 <div className="card-grid">
 {products?.map((product: Product) => (
 <Link key={product.id} href={`/shop/${product.slug}`} className="luxury-card">
 <div className="luxury-image">
 {product.featured_image_url? (
 <img src={product.featured_image_url} alt={product.name} />
 ): (
 <img src="/images/workshop.webp" alt={product.name} />
 )}
 </div>
 <div className="card-body">
 <p className="card-meta">Product</p>
 <h3 className="card-title">{product.name}</h3>
 <p className="card-copy">{product.short_description}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>

 <section className="page-section">
 <div className="container-shell">
 <p className="eyebrow">Portfolio</p>
 <div className="section-head">
 <h2 className="section-title">Work shaped by image, silhouette, and detail.</h2>
 <Link href="/portfolio" className="button-secondary">
 Full Portfolio
 </Link>
 </div>

 <div className="card-grid">
 {portfolioItems?.map((item: PortfolioItem) => (
 <Link key={item.id} href={`/portfolio/${item.slug}`} className="luxury-card">
 <div className="luxury-image">
 {item.featured_image_url? (
 <img src={item.featured_image_url} alt={item.title} />
 ): (
 <img src="/images/workshop.webp" alt={item.title} />
 )}
 </div>
 <div className="card-body">
 <p className="card-meta">Portfolio</p>
 <h3 className="card-title">{item.title}</h3>
 <p className="card-copy">{item.description}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>
 <section className="page-section">
 <div className="container-shell">
 <section className="about-background-section">
 <div className="about-background-overlay">
 <div className="about-background-content">
 <div>
 <p className="eyebrow">About</p>
 <h2 className="section-title">A boutique atelier approach.</h2>
 <p className="section-copy about-section-copy">
 {site?.about_text ||
 'Felix Gabino is a fashion atelier focused on artisan construction, sharp silhouettes, and personal design experiences.'}
 </p>
 </div>

 <div className="contact-stack">
 <div className="info-panel info-panel-overlay">
 <p className="card-meta">Contact</p>
 <p>
 {site?.home_contact_text ||
 'For custom orders, fittings, and consultations, get in touch by email or WhatsApp.'}
 </p>
 </div>

 {site?.contact_email? (
 <div className="info-panel info-panel-overlay">
 <p className="card-meta">Email</p>
 <p>{site.contact_email}</p>
 </div>
 ): null}

 {site?.contact_phone? (
 <div className="info-panel info-panel-overlay">
 <p className="card-meta">Phone</p>
 <p>{site.contact_phone}</p>
 </div>
 ): null}

 <div className="info-panel info-panel-overlay">
 <Link href="/custom-orders" className="button-primary">
 Book or Inquire
 </Link>
 </div>
 </div>
 </div>
 </div>
 </section>
 </div>
</section>
 </main>
 );
}