-- Create a profiles table linked to Supabase auth.users
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Example: mark an existing user as admin
-- Replace <user-uuid> with the user's auth.users.id
-- INSERT INTO profiles (id, full_name, is_admin)
--   VALUES ('<user-uuid>', 'Admin User', true)
--   ON CONFLICT (id) DO UPDATE SET is_admin = true;

-- Example: remove admin
-- UPDATE profiles SET is_admin = false WHERE id = '<user-uuid>';
