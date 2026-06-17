'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

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

function slugify(value: string) {
 return value
.toLowerCase()
.trim()
.replace(/['"]/g, '')
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-+|-+$/g, '');
}

export default function NewPortfolioItemPage() {
 const router = useRouter();

 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);

 const [categories, setCategories] = useState<PortfolioCategory[]>([]);
 const [products, setProducts] = useState<Product[]>([]);
 const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

 const [statusMessage, setStatusMessage] = useState<{
 type: 'success' | 'error' | null;
 message: string;
 }>({ type: null, message: '' });

 const [title, setTitle] = useState('');
 const [slug, setSlug] = useState('');
 const [slugEditedManually, setSlugEditedManually] = useState(false);
 const [description, setDescription] = useState('');
 const [categoryId, setCategoryId] = useState('');
 const [relatedProductId, setRelatedProductId] = useState('');
 const [testimonialId, setTestimonialId] = useState('');
 const [featuredImageUrl, setFeaturedImageUrl] = useState('');
 const [isFeatured, setIsFeatured] = useState(false);
 const [sortOrder, setSortOrder] = useState('0');

 const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
 const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

 useEffect(() => {
 async function loadData() {
 const [
 { data: categoryData, error: categoryError },
 { data: productData, error: productError },
 { data: testimonialData, error: testimonialError },
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

 setLoading(false);
 }

 loadData();
 }, []);

 useEffect(() => {
 if (!slugEditedManually) {
 setSlug(slugify(title));
 }
 }, [title, slugEditedManually]);

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

 function handleFeaturedImageSelect(event: ChangeEvent<HTMLInputElement>) {
 const file = event.target.files?.[0] || null;
 setFeaturedImageFile(file);
 }

 function handleGallerySelect(event: ChangeEvent<HTMLInputElement>) {
 const files = Array.from(event.target.files || []);
 setGalleryFiles(files);
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

 try {
 const initialPayload = {
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

 const { data: insertedItem, error: insertError } = await supabase
.from('portfolio_items')
.insert(initialPayload)
.select('id')
.single();

 if (insertError ||!insertedItem) {
 throw new Error(insertError?.message || 'Unable to create portfolio item.');
 }

 const portfolioItemId = insertedItem.id;

 let finalFeaturedImageUrl = featuredImageUrl.trim() || null;

 if (featuredImageFile) {
 const featuredExt = featuredImageFile.name.split('.').pop();
 const featuredPath = `${portfolioItemId}/featured-${Date.now()}.${featuredExt}`;
 finalFeaturedImageUrl = await uploadFile(featuredImageFile, featuredPath);

 const { error: featuredUpdateError } = await supabase
.from('portfolio_items')
.update({ featured_image_url: finalFeaturedImageUrl })
.eq('id', portfolioItemId);

 if (featuredUpdateError) {
 throw new Error(featuredUpdateError.message);
 }
 }

 if (galleryFiles.length > 0) {
 const galleryRows = [];

 for (let index = 0; index < galleryFiles.length; index += 1) {
 const file = galleryFiles[index];
 const fileExt = file.name.split('.').pop();
 const filePath = `${portfolioItemId}/gallery-${Date.now()}-${index}.${fileExt}`;
 const publicUrl = await uploadFile(file, filePath);

 galleryRows.push({
 portfolio_item_id: portfolioItemId,
 image_url: publicUrl,
 alt_text: `${title.trim()} gallery image ${index + 1}`,
 sort_order: index + 1,
 });
 }

 const { error: galleryInsertError } = await supabase
.from('portfolio_images')
.insert(galleryRows);

 if (galleryInsertError) {
 throw new Error(galleryInsertError.message);
 }
 }

 setStatusMessage({
 type: 'success',
 message: 'Portfolio item created successfully.',
 });

 router.push(`/admin/portfolio/${portfolioItemId}`);
 router.refresh();
 } catch (error) {
 setStatusMessage({
 type: 'error',
 message:
 error instanceof Error
? error.message
: 'Something went wrong while creating the portfolio item.',
 });
 } finally {
 setSubmitting(false);
 }
 }

 if (loading) {
 return (
 <main className="page-section">
 <div className="container-shell">
 <p>Loading form...</p>
 </div>
 </main>
 );
 }

 return (
 <main className="page-section">
 <div className="container-shell" style={{ maxWidth: 920 }}>
 <p className="eyebrow">Admin</p>
 <h1 className="section-title">New Portfolio Item</h1>
 <p className="section-copy" style={{ marginTop: 16 }}>
 Create a portfolio item with featured image, gallery images, optional related product, and optional testimonial.
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
 onChange={(event) => {
 setSlugEditedManually(true);
 setSlug(event.target.value);
 }}
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
 <p className="card-meta">Images</p>

 <div className="form-field">
 <label htmlFor="featured-image-upload">Featured Image Upload</label>
 <input
 id="featured-image-upload"
 type="file"
 accept="image/*"
 onChange={handleFeaturedImageSelect}
 />
 </div>

 <div className="form-field">
 <label htmlFor="featured-image-url">Featured Image URL (optional)</label>
 <input
 id="featured-image-url"
 type="text"
 value={featuredImageUrl}
 onChange={(event) => setFeaturedImageUrl(event.target.value)}
 placeholder="https://..."
 />
 </div>

 <div className="form-field">
 <label htmlFor="gallery-upload">Gallery Images</label>
 <input
 id="gallery-upload"
 type="file"
 accept="image/*"
 multiple
 onChange={handleGallerySelect}
 />
 </div>

 {galleryFiles.length > 0? (
 <div className="info-panel">
 <p className="card-meta">Selected gallery files</p>
 <ul>
 {galleryFiles.map((file, index) => (
 <li key={`${file.name}-${index}`}>{file.name}</li>
 ))}
 </ul>
 </div>
 ): null}
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
 {submitting? 'Saving...': 'Create Portfolio Item'}
 </button>
 </div>
 </form>
 </div>
 </main>
 );
}