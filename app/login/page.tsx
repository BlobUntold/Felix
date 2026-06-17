'use client';

import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [errorMessage, setErrorMessage] = useState('');

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();

 if (submitting) return;

 setSubmitting(true);
 setErrorMessage('');

 const { error } = await supabase.auth.signInWithPassword({
 email: email.trim(),
 password,
 });

 if (error) {
 setErrorMessage(error.message);
 setSubmitting(false);
 return;
 }

 window.location.href = '/admin';
 }

 return (
 <section className="page-section">
 <div className="container-shell" style={{ maxWidth: '560px' }}>
 <div className="detail-panel">
 <p className="card-meta">Admin Access</p>
 <h1>Log In</h1>

 <p
 style={{
 marginTop: '12px',
 color: 'var(--muted)',
 lineHeight: 1.7,
 }}
 >
 Sign in to access the admin area.
 </p>

 <form
 onSubmit={handleSubmit}
 className="form-stack"
 style={{ marginTop: '24px' }}
 >
 <div>
 <label
 htmlFor="email"
 style={{
 display: 'block',
 marginBottom: '8px',
 fontSize: '0.92rem',
 }}
 >
 Email
 </label>
 <input
 id="email"
 type="email"
 value={email}
 onChange={(event) => setEmail(event.target.value)}
 required
 autoComplete="email"
 style={{
 width: '100%',
 padding: '12px 14px',
 border: '1px solid var(--border)',
 background: 'var(--card)',
 color: 'inherit',
 }}
 />
 </div>

 <div>
 <label
 htmlFor="password"
 style={{
 display: 'block',
 marginBottom: '8px',
 fontSize: '0.92rem',
 }}
 >
 Password
 </label>
 <input
 id="password"
 type="password"
 value={password}
 onChange={(event) => setPassword(event.target.value)}
 required
 autoComplete="current-password"
 style={{
 width: '100%',
 padding: '12px 14px',
 border: '1px solid var(--border)',
 background: 'var(--card)',
 color: 'inherit',
 }}
 />
 </div>

 {errorMessage? (
 <div className="detail-panel form-status-error">
 <div className="form-status-inner">
 <div className="form-status-icon">!</div>
 <div>
 <p className="form-status-title">Login failed</p>
 <p className="form-status-message">{errorMessage}</p>
 </div>
 </div>
 </div>
 ): null}

 <button
 type="submit"
 disabled={submitting}
 style={{
 padding: '12px 16px',
 border: '1px solid var(--border)',
 background: 'var(--card)',
 color: 'inherit',
 textTransform: 'uppercase',
 letterSpacing: '0.12em',
 fontSize: '0.82rem',
 cursor: submitting? 'not-allowed': 'pointer',
 }}
 >
 {submitting? 'Signing In...': 'Log In'}
 </button>
 </form>
 </div>
 </div>
 </section>
 );
}