-- Allow authenticated users to call is_admin() via Supabase RPC
-- Required for admin login verification in the browser client
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
