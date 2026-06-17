'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewTestimonialPage() {
 const router = useRouter();

 const [clientName, setClientName] = useState('');
 const [quote, setQuote] = useState('');
 const [roleOrContext, setRoleOrContext] = useState('');
 const [isFeatured, setIsFeatured] = useState(false);
 const [submitting, setSubmitting] = useState(false);

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();
 setSubmitting(true);

 const { error } = await supabase.from('testimonials').insert({
 client_name: clientName.trim() || null,
 quote: quote.trim(),
 role_or_context: roleOrContext.trim() || null,
 is_featured: isFeatured,
 });

 setSubmitting(false);

 if (error) {
 alert(`Failed to create testimonial: ${error.message}`);
 return;
 }

 router.push('/admin/testimonials');
 router.refresh();
 }

 return (
 <main className="p-6">
 <h1 className="text-2xl font-semibold">Admin</h1>
 <h2 className="mt-2 text-xl">New Testimonial</h2>

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
 placeholder="Enter the testimonial quote"
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
 {submitting? 'Creating...': 'Create Testimonial'}
 </button>
 </div>
 </form>
 </main>
 );
}
