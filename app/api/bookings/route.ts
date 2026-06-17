import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const {
			name,
			email,
			phone,
			appointment_type,
			preferred_date,
			preferred_time,
			message,
		} = body;

		if (!name || !email || !appointment_type || !preferred_date || !preferred_time) {
			return NextResponse.json(
				{ error: 'Missing required booking fields.' },
				{ status: 400 }
			);
		}

		const supabase = await createSupabaseServerClient();

		const { error: insertError } = await supabase.from('bookings').insert({
			name,
			email,
			phone: phone || null,
			appointment_type,
			preferred_date,
			preferred_time,
			message: message || null,
			status: 'pending',
		});

		if (insertError) {
			return NextResponse.json({ error: insertError.message }, { status: 500 });
		}

		const artistEmail = process.env.ARTIST_EMAIL!;
		const fromEmail = process.env.FROM_EMAIL!;

		await resend.emails.send({
			from: fromEmail,
			to: artistEmail,
			subject: `New booking request from ${name}`,
			html: `
				<h2>New Booking Request</h2>
				<p><strong>Name:</strong> ${name}</p>
				<p><strong>Email:</strong> ${email}</p>
				<p><strong>Phone:</strong> ${phone || '-'}</p>
				<p><strong>Appointment Type:</strong> ${appointment_type}</p>
				<p><strong>Preferred Date:</strong> ${preferred_date}</p>
				<p><strong>Preferred Time:</strong> ${preferred_time}</p>
				<p><strong>Message:</strong><br/>${message || '-'}</p>
			`,
		});

		await resend.emails.send({
			from: fromEmail,
			to: email,
			subject: 'We received your booking request',
			html: `
				<h2>Booking request received</h2>
				<p>Hello ${name},</p>
				<p>We received your booking request.</p>
				<p>Your requested appointment:</p>
				<ul>
					<li><strong>Type:</strong> ${appointment_type}</li>
					<li><strong>Date:</strong> ${preferred_date}</li>
					<li><strong>Time:</strong> ${preferred_time}</li>
				</ul>
				<p>This is not yet a final confirmation. The artist will review your request and follow up.</p>
			`,
		});

		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json(
			{ error: 'Something went wrong while creating the booking.' },
			{ status: 500 }
		);
	}
}