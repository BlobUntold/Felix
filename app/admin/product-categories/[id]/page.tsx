'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type PageProps = {
 params: Promise<{ id: string }>;
};

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

export default function EditProductCategoryPage({ params }: PageProps) {
 const router = useRouter();

 const [categoryId, setCategoryId] = useState('');
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [deleting, setDeleting] = useState(false);

 const [name, setName] = useState('');
 const [slug, setSlug] = useState('');
 const [description, setDescription] = useState('');
 const [sortOrder, setSortOrder] = useState('0');

 const [statusMessage, setStatusMessage] = useState<{
 type: 'success' | 'error' | null;
 message: string;
 }>({ type: null, message: '' });

 useEffect(() => {
 async function loadCategory() {
 const resolvedParams = await params;
 const id = resolvedParams.id;
 setCategoryId(id);

 const { data, error } = await supabase
.from('product_categories')
.select('id, name, slug, description, sort_order')
.eq('id', id)
.single();

 if (error ||!data) {
 setStatusMessage({
 type: 'error',
 message: error?.message || 'Unable to load category.',
 });
 setLoading(false);
 return;
 }

 const category = data as ProductCategory;
 setName(category.name || '');
 setSlug(category.slug || '');
 setDescription(category.description || '');
 setSortOrder(String(category.sort_order?? 0));
 setLoading(false);
 }

 loadCategory();
 }, [params]);

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();
 setSubmitting(true);
 setStatusMessage({ type: null, message: '' });

 if (!name.trim()) {
 setStatusMessage({
 type: 'error',
 message: 'Category name is required.',
 });
 setSubmitting(false);
 return;
 }

 const cleanSlug = slugify(slug || name);

 const { error } = await supabase
.from('product_categories')
.update({
 name: name.trim(),
 slug: cleanSlug,
 description: description.trim() || null,
 sort_order: Number(sortOrder || 0),
 })
.eq('id', categoryId);

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
 message: 'Product category updated successfully.',
 });

 setSubmitting(false);
 router.refresh();
 }

 async function handleDelete() {
 const confirmed = window.confirm(
 'Delete this product category? Products using it may lose their category link.'
 );

 if (!confirmed) return;

 setDeleting(true);
 setStatusMessage({ type: null, message: '' });

 const { error } = await supabase
.from('product_categories')
.delete()
.eq('id', categoryId);

 if (error) {
 setStatusMessage({
 type: 'error',
 message: error.message,
 });
 setDeleting(false);
 return;
 }

 router.push('/admin/product-categories');
 router.refresh();
 }

 if (loading) {
 return (
 <main className="page-section">
 <div className="container-shell">
 <p>Loading category...</p>
 </div>
 </main>
 );
 }

 return (
 <main className="page-section">
 <div className="container-shell" style={{ maxWidth: 820 }}>
 <p className="eyebrow">Admin</p>
 <h1 className="section-title">Edit Product Category</h1>

 <form className="form-stack" onSubmit={handleSubmit} style={{ marginTop: 32 }}>
 <div className="detail-panel">
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
 onChange={(event) => setSlug(event.target.value)}
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

 <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
 <button type="submit" className="button-primary" disabled={submitting}>
 {submitting? 'Saving...': 'Save Category'}
 </button>

 <button
 type="button"
 className="button-secondary"
 onClick={handleDelete}
 disabled={deleting}
 >
 {deleting? 'Deleting...': 'Delete Category'}
 </button>
 </div>
 </div>
 </form>
 </div>
 </main>
 );
}