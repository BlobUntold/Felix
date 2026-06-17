'use client';

import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type ProductCategory = {
 id: string;
 name: string;
 slug: string;
 description: string | null;
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

export default function ProductCategoriesPage() {
 const [categories, setCategories] = useState<ProductCategory[]>([]);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);

 const [name, setName] = useState('');
 const [slug, setSlug] = useState('');
 const [slugEditedManually, setSlugEditedManually] = useState(false);
 const [description, setDescription] = useState('');
 const [sortOrder, setSortOrder] = useState('0');

 const [statusMessage, setStatusMessage] = useState<{
 type: 'success' | 'error' | null;
 message: string;
 }>({ type: null, message: '' });

 async function loadCategories() {
 const { data, error } = await supabase
.from('product_categories')
.select('id, name, slug, description, sort_order')
.order('sort_order', { ascending: true });

 if (error) {
 setStatusMessage({
 type: 'error',
 message: error.message,
 });
 } else {
 setCategories(data || []);
 }

 setLoading(false);
 }

 useEffect(() => {
 loadCategories();
 }, []);

 useEffect(() => {
 if (!slugEditedManually) {
 setSlug(slugify(name));
 }
 }, [name, slugEditedManually]);

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();
 setSubmitting(true);
 setStatusMessage({ type: null, message: '' });

 const cleanSlug = slugify(slug || name);

 if (!name.trim()) {
 setStatusMessage({
 type: 'error',
 message: 'Category name is required.',
 });
 setSubmitting(false);
 return;
 }

 const { error } = await supabase.from('product_categories').insert({
 name: name.trim(),
 slug: cleanSlug,
 description: description.trim() || null,
 sort_order: Number(sortOrder || 0),
 });

 if (error) {
 setStatusMessage({
 type: 'error',
 message: error.message,
 });
 setSubmitting(false);
 return;
 }

 setName('');
 setSlug('');
 setSlugEditedManually(false);
 setDescription('');
 setSortOrder('0');

 setStatusMessage({
 type: 'success',
 message: 'Product category created successfully.',
 });

 await loadCategories();
 setSubmitting(false);
 }

 return (
 <main className="page-section">
 <div className="container-shell" style={{ maxWidth: 980 }}>
 <p className="eyebrow">Admin</p>
 <h1 className="section-title">Product Categories</h1>
 <p className="section-copy" style={{ marginTop: 16 }}>
 Create and manage shop product categories.
 </p>

 <div
 style={{
 display: 'grid',
 gap: 24,
 marginTop: 32,
 }}
 >
 <form className="form-stack" onSubmit={handleSubmit}>
 <div className="detail-panel">
 <p className="card-meta">New Product Category</p>

 <div className="form-field">
 <label htmlFor="name">Name</label>
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
 <label htmlFor="description">Description</label>
 <textarea
 id="description"
 rows={4}
 value={description}
 onChange={(event) => setDescription(event.target.value)}
 />
 </div>

 <div className="form-field">
 <label htmlFor="sort-order">Sort Order</label>
 <input
 id="sort-order"
 type="number"
 value={sortOrder}
 onChange={(event) => setSortOrder(event.target.value)}
 />
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

 <button type="submit" className="button-primary" disabled={submitting}>
 {submitting? 'Saving...': 'Create Category'}
 </button>
 </div>
 </form>

 <div className="detail-panel">
 <p className="card-meta">Existing Product Categories</p>

 {loading? (
 <p>Loading categories...</p>
 ): categories.length > 0? (
 <div className="detail-stack">
 {categories.map((category) => (<div key={category.id} className="info-panel">
 <div
 style={{
 display: 'flex',
 justifyContent: 'space-between',
 gap: 16,
 alignItems: 'center',
 flexWrap: 'wrap',
 }}
 >
 <div>
 <p className="card-meta">
 {category.slug} · sort {category.sort_order}
 </p>
 <h2 style={{ margin: '8px 0 0' }}>{category.name}</h2>
 {category.description? (
 <p className="section-copy" style={{ marginTop: 8 }}>
 {category.description}
 </p>
 ): null}
 </div>

 <a href={`/admin/product-categories/${category.id}`} className="button-secondary">
 Edit
 </a>
 </div>
</div>))}
 </div>
 ): (
 <p>No product categories yet.</p>
 )}
 </div>
 </div>
 </div>
 </main>
 );
}