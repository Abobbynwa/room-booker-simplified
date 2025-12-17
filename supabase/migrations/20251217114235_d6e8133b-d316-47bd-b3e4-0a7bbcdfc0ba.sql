-- Add policy for admin_users table (prevent public access)
CREATE POLICY "Admin users are not publicly accessible" 
ON public.admin_users 
FOR SELECT 
USING (false);