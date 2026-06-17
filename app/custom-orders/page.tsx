'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

export default function CustomOrdersPage() {
 const bookingFormRef = useRef<HTMLFormElement>(null);
 const inquiryFormRef = useRef<HTMLFormElement>(null);

 const [bookingLoading, setBookingLoading] = useState(false);
 const [bookingStatus, setBookingStatus] = useState<{
 type: 'success' | 'error' | null;
 message: string;
 }>({ type: null, message: '' });

 const [inquiryLoading, setInquiryLoading] = useState(false);
 const [inquiryStatus, setInquiryStatus] = useState<{
 type: 'success' | 'error' | null;
 message: string;
 }>({ type: null, message: '' });

 async function handleBookingSubmit(formData: FormData) {
 setBookingLoading(true);
 setBookingStatus({ type: null, message: '' });

 const payload = {
 name: formData.get('name'),
 email: formData.get('email'),
 phone: formData.get('phone'),
 appointment_type: formData.get('appointment_type'),
 preferred_date: formData.get('preferred_date'),
 preferred_time: formData.get('preferred_time'),
 message: formData.get('message'),
 };

 try {
 const response = await fetch('/api/bookings', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });

 const result = await response.json();

 if (!response.ok) {
 throw new Error(result.error || 'Unable to send booking request.');
 }

 bookingFormRef.current?.reset();

 setBookingStatus({
 type: 'success',
 message:
 'Your booking request has been received. A confirmation email has been sent, and the artist will review your request before confirming the appointment.',
 });
 } catch (error) {
 setBookingStatus({
 type: 'error',
 message:
 error instanceof Error
? error.message
: 'Something went wrong while sending your booking request.',
 });
 } finally {
 setBookingLoading(false);
 }
 }

 async function handleInquirySubmit(formData: FormData) {
 setInquiryLoading(true);
 setInquiryStatus({ type: null, message: '' });

 const payload = {
 name: formData.get('name'),
 email: formData.get('email'),
 phone: formData.get('phone'),
 garment_type: formData.get('garment_type'),
 event_date: formData.get('event_date'),
 budget: formData.get('budget'),
 message: formData.get('message'),
 };

 try {
 const response = await fetch('/api/inquiries', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });

 const result = await response.json();

 if (!response.ok) {
 throw new Error(result.error || 'Unable to send inquiry.');
 }

 inquiryFormRef.current?.reset();

 setInquiryStatus({
 type: 'success',
 message:
 'Your inquiry has been sent successfully. A confirmation email has been sent, and the artist will be in touch soon.',
 });
 } catch (error) {
 setInquiryStatus({
 type: 'error',
 message:
 error instanceof Error
? error.message
: 'Something went wrong while sending your inquiry.',
 });
 } finally {
 setInquiryLoading(false);
 }
 }

 return (
 <main>
 <section className="page-header">
 <div className="container-shell">
 <h1>Custom Orders</h1>
 <p>
 A personal atelier process for custom garments, fittings, and design-led
 appointments shaped around silhouette, detail, and finish.
 </p>
 </div>
 </section>

 <section className="page-section">
 <div className="container-shell detail-layout">
 <div className="detail-stack">
 <section className="detail-panel">
 <p className="card-meta">Custom Work</p>
 <h2 className="section-title">A more personal way to create a garment.</h2>
 <p className="section-copy">
 Felix Gabino offers a custom process for clients looking for bridal,
 evening, and made-to-order pieces with a more individual atelier approach.
 The goal is to shape each garment around the person, the occasion, and the
 visual direction of the piece.
 </p>
 </section>

 <div className="info-grid">
 <section className="detail-panel">
 <p className="card-meta">Step 01</p>
 <h3>Initial Inquiry</h3>
 <p className="section-copy">
 Share the type of garment, occasion, preferred timeline, and any early
 design direction.
 </p>
 </section>

 <section className="detail-panel">
 <p className="card-meta">Step 02</p>
 <h3>Consultation</h3>
 <p className="section-copy">
 Review fit, silhouette, fabric direction, and custom details in a more
 focused appointment setting.
 </p>
 </section>

 <section className="detail-panel">
 <p className="card-meta">Step 03</p>
 <h3>Development</h3>
 <p className="section-copy">
 Move into fittings, refinement, and final garment development once the
 project is approved.
 </p>
 </section>
 </div>

 <section className="detail-panel">
 <p className="card-meta">Appointments</p>
 <h2>Booking Types</h2>
 <div className="info-grid">
 <div className="info-panel">
 <h3>Consultation</h3>
 <p className="section-copy">
 For custom orders, early design direction, and first conversations.
 </p>
 </div>
 <div className="info-panel">
 <h3>Fitting</h3>
 <p className="section-copy">
 For pieces already in progress that need shape or sizing refinement.
 </p>
 </div>
 <div className="info-panel">
 <h3>Design Discussion</h3>
 <p className="section-copy">
 For clients who want to explore silhouette, finish, and construction
 ideas before moving forward.
 </p>
 </div>
 </div>
 </section>
 </div>

 <aside className="detail-stack">
 <section className="detail-panel">
 <p className="card-meta">Booking Request</p>
 <form
 ref={bookingFormRef}
 className="form-stack"
 action={async (formData) => {
 await handleBookingSubmit(formData);
 }}
 >
 <div className="form-field">
 <label htmlFor="booking-name">Name</label>
 <input id="booking-name" name="name" type="text" required />
 </div>

 <div className="form-field">
 <label htmlFor="booking-email">Email</label>
 <input id="booking-email" name="email" type="email" required />
 </div>

 <div className="form-field">
 <label htmlFor="booking-phone">Phone</label>
 <input id="booking-phone" name="phone" type="text" />
 </div>

 <div className="form-field">
 <label htmlFor="appointment-type">Appointment Type</label>
 <select id="appointment-type" name="appointment_type" defaultValue="" required>
 <option value="" disabled>
 Select an appointment type
 </option>
 <option value="Consultation">Consultation</option>
 <option value="Fitting">Fitting</option>
 <option value="Design Discussion">Design Discussion</option>
 <option value="Alteration Appointment">Alteration Appointment</option>
 </select>
 </div>

 <div className="form-field">
 <label htmlFor="preferred-date">Preferred Date</label>
 <input id="preferred-date" name="preferred_date" type="date" required />
 </div>

 <div className="form-field">
 <label htmlFor="preferred-time">Preferred Time</label>
 <input id="preferred-time" name="preferred_time" type="time" required />
 </div>

 <div className="form-field">
 <label htmlFor="booking-message">Message</label>
 <textarea id="booking-message" name="message" rows={5} />
 </div>

 <button type="submit" className="button-primary" disabled={bookingLoading}>
 {bookingLoading? 'Sending request...': 'Request Booking'}
 </button>

 {bookingStatus.type && (
 <div
 className={
 bookingStatus.type === 'success'
? 'form-status form-status-success'
: 'form-status form-status-error'
 }
 >
 <div className="form-status-inner">
 <div className="form-status-icon" aria-hidden="true">
 {bookingStatus.type === 'success'? '✓': '!'}
 </div>
 <div>
 <p className="form-status-title">
 {bookingStatus.type === 'success'
? 'Booking request received'
: 'There was a problem'}
 </p>
 <p className="form-status-message">{bookingStatus.message}</p>
 </div>
 </div>
 </div>
)}
 </form>
 </section>

 <section className="detail-panel">
 <p className="card-meta">Custom Order Inquiry</p>
 <form
 ref={inquiryFormRef}
 className="form-stack"
 action={async (formData) => {
 await handleInquirySubmit(formData);
 }}
 >
 <div className="form-field">
 <label htmlFor="inquiry-name">Name</label>
 <input id="inquiry-name" name="name" type="text" required />
 </div>

 <div className="form-field">
 <label htmlFor="inquiry-email">Email</label>
 <input id="inquiry-email" name="email" type="email" required />
 </div>

 <div className="form-field">
 <label htmlFor="inquiry-phone">Phone</label>
 <input id="inquiry-phone" name="phone" type="text" />
 </div>

 <div className="form-field">
 <label htmlFor="garment-type">Garment Type</label>
 <input id="garment-type" name="garment_type" type="text" />
 </div>

 <div className="form-field">
 <label htmlFor="event-date">Event Date</label>
 <input id="event-date" name="event_date" type="date" />
 </div>

 <div className="form-field">
 <label htmlFor="budget">Budget</label>
 <input id="budget" name="budget" type="text" />
 </div>

 <div className="form-field">
 <label htmlFor="inquiry-message">Message</label>
 <textarea id="inquiry-message" name="message" rows={6} required />
 </div>

 <button type="submit" className="button-secondary" disabled={inquiryLoading}>
 {inquiryLoading? 'Sending inquiry...': 'Send Inquiry'}
 </button>

{inquiryStatus.type && (
 <div
 className={
 inquiryStatus.type === 'success'
? 'form-status form-status-success'
: 'form-status form-status-error'
 }
 >
 <div className="form-status-inner">
 <div className="form-status-icon" aria-hidden="true">
 {inquiryStatus.type === 'success'? '✓': '!'}
 </div>
 <div>
 <p className="form-status-title">
 {inquiryStatus.type === 'success'
? 'Inquiry sent successfully'
: 'There was a problem'}
 </p>
 <p className="form-status-message">{inquiryStatus.message}</p>
 </div>
 </div>
 </div>
)}
 </form>
 </section>

 <section className="detail-panel">
 <p className="card-meta">Related</p>
 <div className="hero-actions">
 <Link href="/portfolio" className="button-secondary">
 View Portfolio
 </Link>
 <Link href="/shop" className="button-secondary">
 Explore Shop
 </Link>
 </div>
 </section>
 </aside>
 </div>
 </section>
 </main>
 );
}