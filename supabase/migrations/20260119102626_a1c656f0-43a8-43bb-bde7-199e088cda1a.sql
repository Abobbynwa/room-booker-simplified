-- Drop and recreate the INSERT policy to ensure it works for anonymous users
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create policy for both anon and authenticated users to create bookings
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);