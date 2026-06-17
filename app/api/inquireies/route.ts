import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseServer } from '@/lib/supabase-server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
 try {
 const body = await request.json();

 const {
 name,
 email,
 phone,
 garment_type,
 event_date,
 budget,
 message,
 } = body;

 if (!name ||!email ||!message) {
 return NextResponse.json(
 { error: 'Missing required inquiry fields.' },
 { status: 400 }
 );
 }

 const { error: insertError } = await supabaseServer.from('inquiries').insert({
 name,
 email,
 phone: phone || null,
 garment_type: garment_type || null,
 event_date: event_date || null,
 budget: budget || null,
 message,
 status: 'new',
 });

 if (insertError) {
 return NextResponse.json({ error: insertError.message }, { status: 500 });
 }

 const artistEmail = process.env.ARTIST_EMAIL!;
 const fromEmail = process.env.FROM_EMAIL!;

 await resend.emails.send({
 from: fromEmail,
 to: artistEmail,
 subject: `New custom inquiry from ${name}`,
 html: `
 <h2>New Custom Inquiry</h2>
 <p><strong>Name:</strong> ${name}</p>
 <p><strong>Email:</strong> ${email}</p>
 <p><strong>Phone:</strong> ${phone || '-'}</p>
 <p><strong>Garment Type:</strong> ${garment_type || '-'}</p>
 <p><strong>Event Date:</strong> ${event_date || '-'}</p>
 <p><strong>Budget:</strong> ${budget || '-'}</p>
 <p><strong>Message:</strong><br/>${message}</p>
 `,
 });

 await resend.emails.send({
 from: fromEmail,
 to: email,
 subject: 'We received your inquiry',
 html: `
 <h2>Inquiry received</h2>
 <p>Hello ${name},</p>
 <p>We received your custom order inquiry and will be in touch soon.</p>
 <p>Thank you for reaching out.</p>
 `,
 });

 return NextResponse.json({ success: true });
 } catch {
 return NextResponse.json(
 { error: 'Something went wrong while sending the inquiry.' },
 { status: 500 }
 );
 }
}