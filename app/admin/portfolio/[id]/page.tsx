'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type PageProps = {
 params: Promise<{ id: string }>;
};

type PortfolioCategory = {
 id: string;
 name: string;
 slug: string;
};

type Product = {
 id: string;
 name: string;
 slug: string;
};

type Testimonial = {
 id: string;
 client_name: string | null;
 quote: string;
};

type PortfolioImage = {
 id: string;
 image_url: string;
 alt_text: string | null;
 sort_order: number;
};

type PortfolioItemRecord = {
 id: string;
 title: string;
 slug: string;
 description: string | null;
 category_id: string | null;
 related_product_id: string | null;
 testimonial_id: string | null;
 featured_image_url: string | null;
 is_featured: boolean;
 sort_order: number;
};

function slugify(value: string) {
 return value
.toLowerCase()
.trim()
.replace(/['"]/g, '')
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-+|-+$/g, '');
}

export default function EditPortfolioItemPage({ params }: PageProps) {
 const router = useRouter();

 const [portfolioId, setPortfolioId] = useState('');
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [uploadingFeatured, setUploadingFeatured] = useState(false);
 const [uploadingGallery, setUploadingGallery] = useState(false);
	const [deleting, setDeleting] = useState(false);

 const [categories, setCategories] = useState<PortfolioCategory[]>([]);
 const [products, setProducts] = useState<Product[]>([]);
 const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
 const [galleryImages, setGalleryImages] = useState<PortfolioImage[]>([]);

 const [statusMessage, setStatusMessage] = useState<{
 type: 'success' | 'error' | null;
 message: string;
 }>({ type: null, message: '' });

 const [title, setTitle] = useState('');
 const [slug, setSlug] = useState('');
 const [description, setDescription] = useState('');
 const [categoryId, setCategoryId] = useState('');
 const [relatedProductId, setRelatedProductId] = useState('');
 const [testimonialId, setTestimonialId] = useState('');
 const [featuredImageUrl, setFeaturedImageUrl] = useState('');
 const [isFeatured, setIsFeatured] = useState(false);
 const [sortOrder, setSortOrder] = useState('0');

 async function loadGalleryImages(id: string) {
 const { data, error } = await supabase
.from('portfolio_images')
.select('id, image_url, alt_text, sort_order')
.eq('portfolio_item_id', id)
.order('sort_order', { ascending: true });

 if (!error) {
 setGalleryImages(data || []);
 }
 }

 useEffect(() => {
 async function loadData() {
 const resolvedParams = await params;
 const id = resolvedParams.id;
 setPortfolioId(id);

 const [
 { data: categoryData, error: categoryError },
 { data: productData, error: productError },
 { data: testimonialData, error: testimonialError },
 { data: itemData, error: itemError },
 ] = await Promise.all([
 supabase
.from('portfolio_categories')
.select('id, name, slug')
.order('sort_order', { ascending: true }),
 supabase
.from('products')
.select('id, name, slug')
.order('name', { ascending: true }),
 supabase
.from('testimonials')
.select('id, client_name, quote')
.order('created_at', { ascending: false }),
 supabase
.from('portfolio_items')
.select(`
 id,
 title,
 slug,
 description,
 category_id,
 related_product_id,
 testimonial_id,
 featured_image_url,
 is_featured,
 sort_order
 `)
.eq('id', id)
.single(),
 ]);

 if (categoryError) {
 setStatusMessage({
 type: 'error',
 message: `Unable to load portfolio categories: ${categoryError.message}`,
 });
 } else {
 setCategories(categoryData || []);
 }

 if (productError) {
 setStatusMessage({
 type: 'error',
 message: `Unable to load products: ${productError.message}`,
 });
 } else {
 setProducts(productData || []);
 }

 if (testimonialError) {
 setStatusMessage({
 type: 'error',
 message: `Unable to load testimonials: ${testimonialError.message}`,
 });
 } else {
 setTestimonials(testimonialData || []);
 }

 if (itemError ||!itemData) {
 setStatusMessage({
 type: 'error',
 message: `Unable to load portfolio item: ${itemError?.message || 'Unknown error'}`,
 });
 setLoading(false);
 return;
 }

 const item = itemData as PortfolioItemRecord;

 setTitle(item.title || '');
 setSlug(item.slug || '');
 setDescription(item.description || '');
 setCategoryId(item.category_id || '');
 setRelatedProductId(item.related_product_id || '');
 setTestimonialId(item.testimonial_id || '');
 setFeaturedImageUrl(item.featured_image_url || '');
 setIsFeatured(item.is_featured);
 setSortOrder(String(item.sort_order?? 0));

 await loadGalleryImages(id);
 setLoading(false);
 }

 loadData();
 }, [params]);

 async function uploadFile(file: File, path: string) {
 const { error: uploadError } = await supabase.storage
.from('portfolio-images')
.upload(path, file, { upsert: true });

 if (uploadError) {
 throw new Error(uploadError.message);
 }

 const { data } = supabase.storage.from('portfolio-images').getPublicUrl(path);

 if (!data?.publicUrl) {
 throw new Error('Could not generate public URL for uploaded file.');
 }

 return data.publicUrl;
 }

// Using a simple DB delete for portfolio items (storage cleanup is best-effort elsewhere).

 async function handleFeaturedImageUpload(event: ChangeEvent<HTMLInputElement>) {
 const file = event.target.files?.[0];
 if (!file ||!portfolioId) return;

 setUploadingFeatured(true);
 setStatusMessage({ type: null, message: '' });

 try {
 const fileExt = file.name.split('.').pop();
 const filePath = `${portfolioId}/featured-${Date.now()}.${fileExt}`;
 const publicUrl = await uploadFile(file, filePath);

 setFeaturedImageUrl(publicUrl);
 setStatusMessage({
 type: 'success',
 message: 'Featured image uploaded successfully. Save the portfolio item to keep it.',
 });
 } catch (error) {
 setStatusMessage({
 type: 'error',
 message: error instanceof Error? error.message: 'Featured image upload failed.',
 });
 } finally {
 setUploadingFeatured(false);
 }
 }

 async function handleGalleryUpload(event: ChangeEvent<HTMLInputElement>) {
 const files = event.target.files;
 if (!files ||!files.length ||!portfolioId) return;

 setUploadingGallery(true);
 setStatusMessage({ type: null, message: '' });

 try {
 const startingOrder = galleryImages.length;

 for (let index = 0; index < files.length; index += 1) {
 const file = files[index];
 const fileExt = file.name.split('.').pop();
 const filePath = `${portfolioId}/gallery-${Date.now()}-${index}.${fileExt}`;
 const publicUrl = await uploadFile(file, filePath);

 const { error: insertError } = await supabase.from('portfolio_images').insert({
 portfolio_item_id: portfolioId,
 image_url: publicUrl,
 alt_text: `${title || 'Portfolio item'} gallery image ${startingOrder + index + 1}`,
 sort_order: startingOrder + index + 1,
 });

 if (insertError) {
 throw new Error(insertError.message);
 }
 }

 await loadGalleryImages(portfolioId);

 setStatusMessage({
 type: 'success',
 message: 'Gallery images uploaded successfully.',
 });
 } catch (error) {
 setStatusMessage({
 type: 'error',
 message:
 error instanceof Error? error.message: 'Gallery upload failed.',
 });
 } finally {
 setUploadingGallery(false);
 }
 }

 async function handleDeleteGalleryImage(imageId: string) {
 const { error } = await supabase
.from('portfolio_images')
.delete()
.eq('id', imageId);

 if (error) {
 setStatusMessage({
 type: 'error',
 message: `Unable to delete image: ${error.message}`,
 });
 return;
 }

 await loadGalleryImages(portfolioId);

 setStatusMessage({
 type: 'success',
 message: 'Gallery image removed.',
 });
 }

async function handleDelete() {
 const confirmed = window.confirm(
  'Delete this portfolio item? This will also remove linked gallery image records.'
 );

 if (!confirmed) return;

 setDeleting(true);
 setStatusMessage({ type: null, message: '' });

 const { error } = await supabase
  .from('portfolio_items')
  .delete()
  .eq('id', portfolioId);

 if (error) {
  setStatusMessage({ type: 'error', message: error.message });
  setDeleting(false);
  return;
 }

 router.push('/admin/portfolio');
 router.refresh();
}

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();

 setSubmitting(true);
 setStatusMessage({ type: null, message: '' });

 const cleanSlug = slugify(slug || title);

 if (!title.trim()) {
 setStatusMessage({
 type: 'error',
 message: 'Portfolio title is required.',
 });
 setSubmitting(false);
 return;
 }

 if (!cleanSlug) {
 setStatusMessage({
 type: 'error',
 message: 'A valid slug is required.',
 });
 setSubmitting(false);
 return;
 }

 const payload = {
 title: title.trim(),
 slug: cleanSlug,
 description: description.trim() || null,
 category_id: categoryId || null,
 related_product_id: relatedProductId || null,
 testimonial_id: testimonialId || null,
 featured_image_url: featuredImageUrl.trim() || null,
 is_featured: isFeatured,
 sort_order: Number(sortOrder || 0),
 };

 const { error } = await supabase
.from('portfolio_items')
.update(payload)
.eq('id', portfolioId);

 if (error) {
 setStatusMessage({
 type: 'error',
 message: error.message,
 });
 setSubmitting(false);
 return;
 }

 setStatusMessage({
 type: 'success',
 message: 'Portfolio item updated successfully.',
 });

 setSubmitting(false);
 router.refresh();
 }

 if (loading) {
 return (
 <main className="page-section">
 <div className="container-shell">
 <p>Loading portfolio item...</p>
 </div>
 </main>
 );
 }

 return (
 <main className="page-section">
 <div className="container-shell" style={{ maxWidth: 920 }}>
 <p className="eyebrow">Admin</p>
 <h1 className="section-title">Edit Portfolio Item</h1>
 <p className="section-copy" style={{ marginTop: 16 }}>
 Update portfolio details, upload multiple images, and optionally attach a related product or testimonial.
 </p>

 <form className="form-stack" onSubmit={handleSubmit} style={{ marginTop: 32 }}>
 <div className="detail-panel">
 <p className="card-meta">Basic Information</p>

 <div className="form-field">
 <label htmlFor="title">Title</label>
 <input
 id="title"
 type="text"
 value={title}
 onChange={(event) => setTitle(event.target.value)}
 required
 />
 </div>

 <div className="form-field">
 <label htmlFor="slug">Slug</label>
 <input
 id="slug"
 type="text"
 value={slug}
 onChange={(event) => setSlug(event.target.value)}
 required
 />
 </div>

 <div className="form-field">
 <label htmlFor="description">Description</label>
 <textarea
 id="description"
 rows={6}
 value={description}
 onChange={(event) => setDescription(event.target.value)}
 />
 </div>
 </div>

 <div className="detail-panel">
 <p className="card-meta">Relationships</p>

 <div className="form-field">
 <label htmlFor="category">Portfolio Category</label>
 <select
 id="category"
 value={categoryId}
 onChange={(event) => setCategoryId(event.target.value)}
 >
 <option value="">No category</option>
 {categories.map((category) => (
 <option key={category.id} value={category.id}>
 {category.name}
 </option>
 ))}
 </select>
 </div>

 <div className="form-field">
 <label htmlFor="related-product">Related Product (optional)</label>
 <select
 id="related-product"
 value={relatedProductId}
 onChange={(event) => setRelatedProductId(event.target.value)}
 >
 <option value="">No related product</option>
 {products.map((product) => (
 <option key={product.id} value={product.id}>
 {product.name}
 </option>
 ))}
 </select>
 </div>

 <div className="form-field">
 <label htmlFor="testimonial">Testimonial (optional)</label>
 <select
 id="testimonial"
 value={testimonialId}
 onChange={(event) => setTestimonialId(event.target.value)}
 >
 <option value="">No testimonial</option>
 {testimonials.map((testimonial) => (
 <option key={testimonial.id} value={testimonial.id}>
 {(testimonial.client_name || 'Unnamed client')}: {testimonial.quote.slice(0, 60)}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div className="detail-panel">
 <p className="card-meta">Featured Image</p>

 <div className="form-field">
 <label htmlFor="featured-image-upload">Upload Featured Image</label>
 <input
 id="featured-image-upload"
 type="file"
 accept="image/*"
 onChange={handleFeaturedImageUpload}
 disabled={uploadingFeatured}
 />
 </div>

 <div className="form-field">
 <label htmlFor="featured-image-url">Featured Image URL</label>
 <input
 id="featured-image-url"
 type="text"
 value={featuredImageUrl}
 onChange={(event) => setFeaturedImageUrl(event.target.value)}
 />
 </div>

 {featuredImageUrl? (
 <div className="info-panel">
 <p className="card-meta">Preview</p>
 <img
 src={featuredImageUrl}
 alt={title || 'Portfolio preview'}
 style={{ width: '100%', maxHeight: 420, objectFit: 'cover' }}
 />
 </div>
 ): null}
 </div>

 <div className="detail-panel">
 <p className="card-meta">Gallery Images</p>

 <div className="form-field">
 <label htmlFor="gallery-upload">Upload Gallery Images</label>
 <input
 id="gallery-upload"
 type="file"
 accept="image/*"
 multiple
 onChange={handleGalleryUpload}
 disabled={uploadingGallery}
 />
 </div>

 {galleryImages.length > 0? (
 <div className="card-grid">
 {galleryImages.map((image) => (
 <div key={image.id} className="detail-panel">
 <img
 src={image.image_url}
 alt={image.alt_text || 'Gallery image'}
 style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover' }}
 />
 <p className="section-copy" style={{ marginTop: 12 }}>
 {image.alt_text || 'Gallery image'}
 </p>
 <button
 type="button"
 className="button-secondary"
 style={{ marginTop: 12 }}
 onClick={() => handleDeleteGalleryImage(image.id)}
 >
 Remove
 </button>
 </div>
 ))}
 </div>
 ): (
 <p className="section-copy">No gallery images yet.</p>
 )}
 </div>

 <div className="detail-panel">
 <p className="card-meta">Presentation</p>

 <div className="form-field">
 <label htmlFor="sort-order">Sort Order</label>
 <input
 id="sort-order"
 type="number"
 value={sortOrder}
 onChange={(event) => setSortOrder(event.target.value)}
 />
 </div>

 <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
 <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
 <input
 type="checkbox"
 checked={isFeatured}
 onChange={(event) => setIsFeatured(event.target.checked)}
 />
 <span>Featured portfolio item</span>
 </label>
 </div>
 </div>

 {statusMessage.type? (
 <div
 className={
 statusMessage.type === 'success'
? 'form-status form-status-success'
: 'form-status form-status-error'
 }
 >
 {statusMessage.message}
 </div>
 ): null}

 <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
 <button type="submit" className="button-primary" disabled={submitting}>
 {submitting? 'Saving...': 'Save Portfolio Item'}
 </button>
 <button
 type="button"
 className="button-secondary"
 onClick={handleDelete}
 disabled={deleting}
 >
 {deleting ? 'Deleting...' : 'Delete Portfolio Item'}
 </button>
 </div>
 </form>
 </div>
 </main>
 );
}



