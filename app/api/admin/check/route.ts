import { createClient } from '@supabase/supabase-js';

// This route must run on the server. It uses the Supabase Service Role key
// (set SUPABASE_SERVICE_ROLE_KEY in your environment) to verify a user's token
// and check the `profiles.is_admin` flag.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing token' }), { status: 401 });
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    const user = userData.user;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return new Response(JSON.stringify({ admin: false }), { status: 403 });
    }

    if (!profile.is_admin) {
      return new Response(JSON.stringify({ admin: false }), { status: 403 });
    }

    return new Response(JSON.stringify({ admin: true, user: { id: user.id, email: user.email } }), {
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 });
  }
}
