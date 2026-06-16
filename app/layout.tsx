import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
 title: 'Felix Gabino',
 description: 'Artisan tailoring with an edgy, modern voice.',
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en">
 <body>
 <header className="site-header">
 <div className="container-shell site-header-inner">
 <Link href="/" className="brand-link" aria-label="Felix Gabino home">
 <img src="/images/logo.png" alt="Felix Gabino" className="site-logo" />
 </Link>

 <nav className="site-nav">
 <Link href="/">Home</Link>
 <Link href="/shop">Shop</Link>
 <Link href="/portfolio">Portfolio</Link>
 <Link href="/custom-orders">Custom Orders</Link>
 <Link href="/admin">Admin</Link>
 </nav>
 </div>
 </header>

 {children}

 <footer className="footer-shell">
 <div className="container-shell">
 <p>Felix Gabino — custom garments, evening pieces, and atelier craftsmanship.</p>
 </div>
 </footer>
 </body>
 </html>
 );
}