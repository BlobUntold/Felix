'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type PageProps = {
 params: Promise<{ id: string }>;
};

type Category = {
 id: string;
 name: string;
 slug: string;
};

type ProductStatus = 'available' | 'made_to_order' | 'draft';
type PricingMode = 'fixed' | 'from' | 'range' | 'consultation';

type ProductRecord = {
 id: string;
 name: string;
 slug: string;
 short_description: string | null;
 description: string | null;
 category_id: string | null;
 status: ProductStatus;
 pricing_mode: PricingMode;
 fixed_price: number | null;
 price_from: number | null;
 price_to: number | null;
 availability_label: string | null;
 featured_image_url: string | null;
 is_featured: boolean;
 allow_inquiry: boolean;
 allow_direct_purchase: boolean;
 sort_order: number;
};

type ProductImage = {
 id: string;
 image_url: string;
 alt_text: string | null;
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

export default function EditProductPage({ params }: PageProps) {
 const router = useRouter();

 const [productId, setProductId] = useState('');
 const [categories, setCategories] = useState<Category[]>([]);
 const [galleryImages, setGalleryImages] = useState<ProductImage[]>([]);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [uploadingImage, setUploadingImage] = useState(false);
 const [uploadingGallery, setUploadingGallery] = useState(false);
 const [deleting, setDeleting] = useState(false);

 const [statusMessage, setStatusMessage] = useState<{
 type: 'success' | 'error' | null;
 message: string;
 }>({ type: null, message: '' });

 const [name, setName] = useState('');
 const [slug, setSlug] = useState('');
 const [shortDescription, setShortDescription] = useState('');
 const [description, setDescription] = useState('');
 const [categoryId, setCategoryId] = useState('');
 const [status, setStatus] = useState<ProductStatus>('draft');
 const [pricingMode, setPricingMode] = useState<PricingMode>('fixed');
 const [fixedPrice, setFixedPrice] = useState('');
 const [priceFrom, setPriceFrom] = useState('');
 const [priceTo, setPriceTo] = useState('');
 const [availabilityLabel, setAvailabilityLabel] = useState('');
 const [featuredImageUrl, setFeaturedImageUrl] = useState('');
 const [isFeatured, setIsFeatured] = useState(false);
 const [allowInquiry, setAllowInquiry] = useState(true);
 const [allowDirectPurchase, setAllowDirectPurchase] = useState(false);
 const [sortOrder, setSortOrder] = useState('0');

 async function loadGalleryImages(id: string) {
 const { data, error } = await supabase
.from('product_images')
.select('id, image_url, alt_text, sort_order')
.eq('product_id', id)
.order('sort_order', { ascending: true });

 if (!error) {
 setGalleryImages(data || []);
 }
 }

 useEffect(() => {
 async function loadData() {
 const resolvedParams = await params;
 const id = resolvedParams.id;
 setProductId(id);

 const [
 { data: categoryData, error: categoryError },
 { data: productData, error: productError },
 ] = await Promise.all([
 supabase
.from('product_categories')
.select('id, name, slug')
.order('sort_order', { ascending: true }),
 supabase
.from('products')
.select(`
 id,
 name,
 slug,
 short_description,
 description,
 category_id,
 status,
 pricing_mode,
 fixed_price,
 price_from,
 price_to,
 availability_label,
 featured_image_url,
 is_featured,
 allow_inquiry,
 allow_direct_purchase,
 sort_order
 `)
.eq('id', id)
.single(),
 ]);

 if (categoryError) {
 setStatusMessage({
 type: 'error',
 message: `Unable to load categories: ${categoryError.message}`,
 });
 } else {
 setCategories(categoryData || []);
 }

 if (productError ||!productData) {
 setStatusMessage({
 type: 'error',
 message: `Unable to load product: ${productError?.message || 'Unknown error'}`,
 });
 setLoading(false);
 return;
 }

 const product = productData as ProductRecord;

 setName(product.name || '');
 setSlug(product.slug || '');
 setShortDescription(product.short_description || '');
 setDescription(product.description || '');
 setCategoryId(product.category_id || '');
 setStatus(product.status);
 setPricingMode(product.pricing_mode);
 setFixedPrice(product.fixed_price!== null? String(product.fixed_price): '');
 setPriceFrom(product.price_from!== null? String(product.price_from): '');
 setPriceTo(product.price_to!== null? String(product.price_to): '');
 setAvailabilityLabel(product.availability_label || '');
 setFeaturedImageUrl(product.featured_image_url || '');
 setIsFeatured(product.is_featured);
 setAllowInquiry(product.allow_inquiry);
 setAllowDirectPurchase(product.allow_direct_purchase);
 setSortOrder(String(product.sort_order?? 0));

 await loadGalleryImages(id);
 setLoading(false);
 }

 loadData();
 }, [params]);

 const showFixedPrice = useMemo(() => pricingMode === 'fixed', [pricingMode]);
 const showFromPrice = useMemo(() => pricingMode === 'from', [pricingMode]);
 const showRangePrice = useMemo(() => pricingMode === 'range', [pricingMode]);

 async function uploadFile(file: File, path: string) {
 const { error: uploadError } = await supabase.storage
.from('product-images')
.upload(path, file, { upsert: true });

 if (uploadError) {
 throw new Error(uploadError.message);
 }

 const { data } = supabase.storage.from('product-images').getPublicUrl(path);

 if (!data?.publicUrl) {
 throw new Error('Could not generate public URL for uploaded file.');
 }

 return data.publicUrl;
 }

 async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
 const file = event.target.files?.[0];
 if (!file ||!productId) return;

 setUploadingImage(true);
 setStatusMessage({ type: null, message: '' });

 try {
 const fileExt = file.name.split('.').pop();
 const filePath = `${productId}/featured-${Date.now()}.${fileExt}`;
 const publicUrl = await uploadFile(file, filePath);

 setFeaturedImageUrl(publicUrl);
 setStatusMessage({
 type: 'success',
 message: 'Featured image uploaded successfully. Save the product to keep it.',
 });
 } catch (error) {
 setStatusMessage({
 type: 'error',
 message: error instanceof Error? error.message: 'Image upload failed.',
 });
 } finally {
 setUploadingImage(false);
 }
 }

 async function handleGalleryUpload(event: ChangeEvent<HTMLInputElement>) {
 const files = event.target.files;
 if (!files ||!files.length ||!productId) return;

 setUploadingGallery(true);
 setStatusMessage({ type: null, message: '' });

 try {
 const startingOrder = galleryImages.length;

 for (let index = 0; index < files.length; index += 1) {
 const file = files[index];
 const fileExt = file.name.split('.').pop();
 const filePath = `${productId}/gallery-${Date.now()}-${index}.${fileExt}`;
 const publicUrl = await uploadFile(file, filePath);

 const { error: insertError } = await supabase.from('product_images').insert({
 product_id: productId,
 image_url: publicUrl,
 alt_text: `${name || 'Product'} gallery image ${startingOrder + index + 1}`,
 sort_order: startingOrder + index + 1,
 });

 if (insertError) {
 throw new Error(insertError.message);
 }
 }

 await loadGalleryImages(productId);

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
.from('product_images')
.delete()
.eq('id', imageId);

 if (error) {
 setStatusMessage({
 type: 'error',
 message: `Unable to delete image: ${error.message}`,
 });
 return;
 }

 await loadGalleryImages(productId);

 setStatusMessage({
 type: 'success',
 message: 'Gallery image removed.',
 });
 }

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();

 setSubmitting(true);
 setStatusMessage({ type: null, message: '' });

 const cleanSlug = slugify(slug || name);

 if (!name.trim()) {
 setStatusMessage({
 type: 'error',
 message: 'Product name is required.',
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

 if (pricingMode === 'fixed' &&!fixedPrice) {
 setStatusMessage({
 type: 'error',
 message: 'Fixed price is required when pricing mode is fixed.',
 });
 setSubmitting(false);
 return;
 }

 if (pricingMode === 'from' &&!priceFrom) {
 setStatusMessage({
 type: 'error',
 message: 'From price is required when pricing mode is from.',
 });
 setSubmitting(false);
 return;
 }

 if (pricingMode === 'range' && (!priceFrom ||!priceTo)) {
 setStatusMessage({
 type: 'error',
 message: 'Both range prices are required.',
 });
 setSubmitting(false);
 return;
 }

 const payload = {
 name: name.trim(),
 slug: cleanSlug,
 short_description: shortDescription.trim() || null,
 description: description.trim() || null,
 category_id: categoryId || null,
 status,
 pricing_mode: pricingMode,
 fixed_price: pricingMode === 'fixed'? Number(fixedPrice): null,
 price_from:
 pricingMode === 'from' || pricingMode === 'range'
? Number(priceFrom)
: null,
 price_to: pricingMode === 'range'? Number(priceTo): null,
 availability_label: availabilityLabel.trim() || null,
 featured_image_url: featuredImageUrl.trim() || null,
 is_featured: isFeatured,
 allow_inquiry: allowInquiry,
 allow_direct_purchase: allowDirectPurchase,
 sort_order: Number(sortOrder || 0),
 };

 const { error } = await supabase
.from('products')
.update(payload)
.eq('id', productId);

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
 message: 'Product updated successfully.',
 });

 setSubmitting(false);
 router.refresh();
 }

 async function handleDeleteProduct() {
 const confirmed = window.confirm(
 'Delete this product? This will also remove linked product image records.'
 );

 if (!confirmed) return;

 setDeleting(true);
 setStatusMessage({ type: null, message: '' });

 const { error } = await supabase
.from('products')
.delete()
.eq('id', productId);

 if (error) {
 setStatusMessage({
 type: 'error',
 message: error.message,
 });
 setDeleting(false);
 return;
 }

 router.push('/admin/products');
 router.refresh();
 }

 if (loading) {
 return (
 <main className="page-section">
 <div className="container-shell">
 <p>Loading product...</p>
 </div>
 </main>
 );
 }

 return (
 <main className="page-section">
 <div className="container-shell" style={{ maxWidth: 920 }}>
 <p className="eyebrow">Admin</p>
 <h1 className="section-title">Edit Product</h1>
 <p className="section-copy" style={{ marginTop: 16 }}>
 Update the product details, upload a featured image, and manage gallery images.
 </p>

 <form className="form-stack" onSubmit={handleSubmit} style={{ marginTop: 32 }}>
 <div className="detail-panel">
 <p className="card-meta">Basic Information</p>

 <div className="form-field">
 <label htmlFor="name">Product Name</label>
 <input
 id="name"
 type="text"
 value={name}
 onChange={(event) => setName(event.target.value)}
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
 <label htmlFor="short-description">Short Description</label>
 <textarea
 id="short-description"
 rows={3}
 value={shortDescription}
 onChange={(event) => setShortDescription(event.target.value)}
 />
 </div>

 <div className="form-field">
 <label htmlFor="description">Full Description</label>
 <textarea
 id="description"
 rows={6}
 value={description}
 onChange={(event) => setDescription(event.target.value)}
 />
 </div>
 </div>

 <div className="detail-panel">
 <p className="card-meta">Category and Status</p>

 <div className="form-field">
 <label htmlFor="category">Category</label>
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
 <label htmlFor="status">Status</label>
 <select
 id="status"
 value={status}
 onChange={(event) => setStatus(event.target.value as ProductStatus)}
 >
 <option value="available">Available</option>
 <option value="made_to_order">Made to Order</option>
 <option value="draft">Draft</option>
 </select>
 </div>

 <div className="form-field">
 <label htmlFor="availability-label">Availability Label</label>
 <input
 id="availability-label"
 type="text"
 value={availabilityLabel}
 onChange={(event) => setAvailabilityLabel(event.target.value)}
 />
 </div>
 </div>

 <div className="detail-panel">
 <p className="card-meta">Pricing</p>

 <div className="form-field">
 <label htmlFor="pricing-mode">Pricing Mode</label>
 <select
 id="pricing-mode"
 value={pricingMode}
 onChange={(event) => setPricingMode(event.target.value as PricingMode)}
 >
 <option value="fixed">Fixed Price</option>
 <option value="from">From Price</option>
 <option value="range">Range Price</option>
 <option value="consultation">Consultation Only</option>
 </select>
 </div>

 {showFixedPrice? (
 <div className="form-field">
 <label htmlFor="fixed-price">Fixed Price</label>
 <input
 id="fixed-price"
 type="number"
 min="0"
 step="0.01"
 value={fixedPrice}
 onChange={(event) => setFixedPrice(event.target.value)}
 />
 </div>
 ): null}

 {showFromPrice? (
 <div className="form-field">
 <label htmlFor="price-from">From Price</label>
 <input
 id="price-from"
 type="number"
 min="0"
 step="0.01"
 value={priceFrom}
 onChange={(event) => setPriceFrom(event.target.value)}
 />
 </div>
 ): null}

 {showRangePrice? (
 <>
 <div className="form-field">
 <label htmlFor="range-from">Range From</label>
 <input
 id="range-from"
 type="number"
 min="0"
 step="0.01"
 value={priceFrom}
 onChange={(event) => setPriceFrom(event.target.value)}
 />
 </div>

 <div className="form-field">
 <label htmlFor="range-to">Range To</label>
 <input
 id="range-to"
 type="number"
 min="0"
 step="0.01"
 value={priceTo}
 onChange={(event) => setPriceTo(event.target.value)}
 />
 </div>
 </>
 ): null}
 </div>

 <div className="detail-panel">
 <p className="card-meta">Featured Image</p>

 <div className="form-field">
 <label htmlFor="image-upload">Upload Featured Image</label>
 <input
 id="image-upload"
 type="file"
 accept="image/*"
 onChange={handleImageUpload}
 disabled={uploadingImage}
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
 alt={name || 'Product preview'}
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
 <span>Featured product</span>
 </label>

 <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
 <input
 type="checkbox"
 checked={allowInquiry}
 onChange={(event) => setAllowInquiry(event.target.checked)}
 />
 <span>Allow inquiry</span>
 </label>

 <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
 <input
 type="checkbox"
 checked={allowDirectPurchase}
 onChange={(event) => setAllowDirectPurchase(event.target.checked)}
 />
 <span>Allow direct purchase</span>
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
 {submitting? 'Saving...': 'Save Product'}
 </button>

 <button
 type="button"
 className="button-secondary"
 onClick={handleDeleteProduct}
 disabled={deleting}
 >
 {deleting? 'Deleting...': 'Delete Product'}
 </button>
 </div>
 </form>
 </div>
 </main>
 );
}