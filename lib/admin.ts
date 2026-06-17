import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function requireAdmin() {
	const supabase = await createSupabaseServerClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return {
			ok: false,
			user: null,
			profile: null,
			reason: 'unauthenticated',
		};
	}

	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('id, is_admin')
		.eq('id', user.id)
		.single();

	if (profileError || !profile || !profile.is_admin) {
		return {
			ok: false,
			user,
			profile: profile ?? null,
			reason: 'forbidden',
		};
	}

	return {
		ok: true,
		user,
		profile,
		reason: null,
	};
}