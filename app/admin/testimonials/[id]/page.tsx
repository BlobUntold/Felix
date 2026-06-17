'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

type Testimonial = {
 id: string;
 client_name: string | null;
 quote: string;
 role_or_context: string | null;
 is_featured: boolean;
};

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditTestimonialPage() {
 const router = useRouter();
 const params = useParams();
 const id = params.id as string;

 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [deleting, setDeleting] = useState(false);

 const [clientName, setClientName] = useState('');
 const [quote, setQuote] = useState('');
 const [roleOrContext, setRoleOrContext] = useState('');
 const [isFeatured, setIsFeatured] = useState(false);

 useEffect(() => {
 loadTestimonial();
 }, [id]);

 async function loadTestimonial() {
 setLoading(true);

 const { data, error } = await supabase
.from('testimonials')
.select('*')
.eq('id', id)
.single();

 if (error ||!data) {
 alert(`Failed to load testimonial: ${error?.message || 'Not found'}`);
 router.push('/admin/testimonials');
 return;
 }

 const testimonial = data as Testimonial;

 setClientName(testimonial.client_name || '');
 setQuote(testimonial.quote || '');
 setRoleOrContext(testimonial.role_or_context || '');
 setIsFeatured(testimonial.is_featured || false);
 setLoading(false);
 }

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();
 setSubmitting(true);

 const { error } = await supabase
.from('testimonials')
.update({
 client_name: clientName.trim() || null,
 quote: quote.trim(),
 role_or_context: roleOrContext.trim() || null,
 is_featured: isFeatured,
 updated_at: new Date().toISOString(),
 })
.eq('id', id);

 setSubmitting(false);

 if (error) {
 alert(`Failed to update testimonial: ${error.message}`);
 return;
 }

 router.push('/admin/testimonials');
 router.refresh();
 }

 async function handleDelete() {
 const confirmed = window.confirm('Delete this testimonial?');
 if (!confirmed) return;

 setDeleting(true);

 const { error } = await supabase
.from('testimonials')
.delete()
.eq('id', id);

 setDeleting(false);

 if (error) {
 alert(`Failed to delete testimonial: ${error.message}`);
 return;
 }

 router.push('/admin/testimonials');
 router.refresh();
 }

 if (loading) {
 return (
 <main className="p-6">
 <h1 className="text-2xl font-semibold">Admin</h1>
 <h2 className="mt-2 text-xl">Edit Testimonial</h2>
 <p className="mt-6 text-sm text-gray-600">Loading...</p>
 </main>
 );
 }

 return (
 <main className="p-6">
 <div className="flex items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-semibold">Admin</h1>
 <h2 className="mt-2 text-xl">Edit Testimonial</h2>
 </div>

 <Link
 href="/admin/testimonials"
 className="rounded-md border border-gray-300 px-4 py-2 text-sm"
 >
 Back
 </Link>
 </div>

 <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5">
 <div>
 <label className="mb-2 block text-sm font-medium">Client Name</label>
 <input
 type="text"
 value={clientName}
 onChange={(event) => setClientName(event.target.value)}
 className="w-full rounded-md border border-gray-300 px-4 py-3"
 placeholder="Optional"
 />
 </div>

 <div>
 <label htmlFor="quote" className="mb-2 block text-sm font-medium">Quote</label>
 <textarea
 id="quote"
 value={quote}
 onChange={(event) => setQuote(event.target.value)}
 className="min-h-[160px] w-full rounded-md border border-gray-300 px-4 py-3"
 required
 />
 </div>

 <div>
 <label className="mb-2 block text-sm font-medium">Role or Context</label>
 <input
 type="text"
 value={roleOrContext}
 onChange={(event) => setRoleOrContext(event.target.value)}
 className="w-full rounded-md border border-gray-300 px-4 py-3"
 placeholder="Optional"
 />
 </div>

 <label className="flex items-center gap-3 text-sm">
 <input
 type="checkbox"
 checked={isFeatured}
 onChange={(event) => setIsFeatured(event.target.checked)}
 />
 Featured testimonial
 </label>

 <div className="flex gap-3">
 <button
 type="submit"
 disabled={submitting ||!quote.trim()}
 className="rounded-md bg-black px-5 py-3 text-sm text-white disabled:opacity-50"
 >
 {submitting? 'Saving...': 'Save Changes'}
 </button>

 <button
 type="button"
 onClick={handleDelete}
 disabled={deleting}
 className="rounded-md border border-red-300 px-5 py-3 text-sm text-red-600 disabled:opacity-50"
 >
 {deleting? 'Deleting...': 'Delete'}
 </button>
 </div>
 </form>
 </main>
 );
}
