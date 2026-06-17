import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export default async function AdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const supabase = await createSupabaseServerClient();

 const {
 data: { user },
 error: userError,
 } = await supabase.auth.getUser();

 if (userError ||!user) {
 redirect('/login');
 }

 const { data: profile, error: profileError } = await supabase
.from('profiles')
.select('is_admin')
.eq('id', user.id)
.single();

 if (profileError ||!profile ||!profile.is_admin) {
 redirect('/');
 }

 return <>{children}</>;
}