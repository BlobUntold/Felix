'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type Category = {
 id: string;
 name: string;
 slug: string;
};

type ProductStatus = 'available' | 'made_to_order' | 'draft';
type PricingMode = 'fixed' | 'from' | 'range' | 'consultation';

function slugify(value: string) {
 return value
.toLowerCase()
.trim()
.replace(/['"]/g, '')
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-+|-+$/g, '');
}

export default function NewProductPage() {
 const router = useRouter();

 const [categories, setCategories] = useState<Category[]>([]);
 const [loadingCategories, setLoadingCategories] = useState(true);
 const [submitting, setSubmitting] = useState(false);

 const [statusMessage, setStatusMessage] = useState<{
 type: 'success' | 'error' | null;
 message: string;
 }>({ type: null, message: '' });

 const [name, setName] = useState('');
 const [slug, setSlug] = useState('');
 const [slugEditedManually, setSlugEditedManually] = useState(false);
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

 const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
 const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

 useEffect(() => {
 async function loadCategories() {
 const { data, error } = await supabase
.from('product_categories')
.select('id, name, slug')
.order('sort_order', { ascending: true });

 if (error) {
 setStatusMessage({
 type: 'error',
 message: `Unable to load categories: ${error.message}`,
 });
 } else {
 setCategories(data || []);
 }

 setLoadingCategories(false);
 }

 loadCategories();
 }, []);

 useEffect(() => {
 if (!slugEditedManually) {
 setSlug(slugify(name));
 }
 }, [name, slugEditedManually]);

 const showFixedPrice = useMemo(() => pricingMode === 'fixed', [pricingMode]);
 const showFromPrice = useMemo(() => pricingMode === 'from', [pricingMode]);
 const showRangePrice = useMemo(() => pricingMode === 'range', [pricingMode]);

 function resetPriceFields(nextPricingMode: PricingMode) {
 if (nextPricingMode!== 'fixed') setFixedPrice('');
 if (nextPricingMode!== 'from') setPriceFrom('');
 if (nextPricingMode!== 'range') {
 setPriceFrom('');
 setPriceTo('');
 }
 if (nextPricingMode === 'consultation') {
 setFixedPrice('');
 setPriceFrom('');
 setPriceTo('');
 }
 }

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
 message: 'Both from and to prices are required when pricing mode is range.',
 });
 setSubmitting(false);
 return;
 }

 try {
 const initialPayload = {
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

 const { data: insertedProduct, error: insertError } = await supabase
.from('products')
.insert(initialPayload)
.select('id')
.single();

 if (insertError ||!insertedProduct) {
 throw new Error(insertError?.message || 'Unable to create product.');
 }

 const productId = insertedProduct.id;

 let finalFeaturedImageUrl = featuredImageUrl.trim() || null;

 if (featuredImageFile) {
 const featuredExt = featuredImageFile.name.split('.').pop();
 const featuredPath = `${productId}/featured-${Date.now()}.${featuredExt}`;
 finalFeaturedImageUrl = await uploadFile(featuredImageFile, featuredPath);

 const { error: featuredUpdateError } = await supabase
.from('products')
.update({ featured_image_url: finalFeaturedImageUrl })
.eq('id', productId);

 if (featuredUpdateError) {
 throw new Error(featuredUpdateError.message);
 }
 }

 if (galleryFiles.length > 0) {
 const galleryRows = [];

 for (let index = 0; index < galleryFiles.length; index += 1) {
 const file = galleryFiles[index];
 const fileExt = file.name.split('.').pop();
 const filePath = `${productId}/gallery-${Date.now()}-${index}.${fileExt}`;
 const publicUrl = await uploadFile(file, filePath);

 galleryRows.push({
 product_id: productId,
 image_url: publicUrl,
 alt_text: `${name.trim()} gallery image ${index + 1}`,
 sort_order: index + 1,
 });
 }

 const { error: galleryInsertError } = await supabase
.from('product_images')
.insert(galleryRows);

 if (galleryInsertError) {
 throw new Error(galleryInsertError.message);
 }
 }

 setStatusMessage({
 type: 'success',
 message: 'Product created successfully.',
 });

 router.push(`/admin/products/${productId}`);
 router.refresh();
 } catch (error) {
 setStatusMessage({
 type: 'error',
 message:
 error instanceof Error? error.message: 'Something went wrong while creating the product.',
 });
 } finally {
 setSubmitting(false);
 }
 }

 return (
 <main className="page-section">
 <div className="container-shell" style={{ maxWidth: 920 }}>
 <p className="eyebrow">Admin</p>
 <h1 className="section-title">New Product</h1>
 <p className="section-copy" style={{ marginTop: 16 }}>
 Create a new product with featured image and gallery uploads.
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
 onChange={(event) => {
 setSlugEditedManually(true);
 setSlug(event.target.value);
 }}
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
 disabled={loadingCategories}
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
 placeholder="Available / Made to order / By request"
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
 onChange={(event) => {
 const nextMode = event.target.value as PricingMode;
 setPricingMode(nextMode);
 resetPriceFields(nextMode);
 }}
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
 {submitting? 'Saving...': 'Create Product'}
 </button>
 </div>
 </form>
 </div>
 </main>
 );
}