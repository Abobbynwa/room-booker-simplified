-- Drop the overly permissive SELECT policy on bookings
DROP POLICY IF EXISTS "Users can view their own bookings by email or admins can view all" ON public.bookings;

-- Create admin-only SELECT policy for bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create a SECURITY DEFINER function for reference-based booking lookup
-- This allows guests to look up their booking by reference number without exposing all booking data
CREATE OR REPLACE FUNCTION public.get_booking_by_reference(ref_number text)
RETURNS TABLE (
  id uuid,
  reference_number text,
  guest_name text,
  guest_email text,
  guest_phone text,
  check_in_date date,
  check_out_date date,
  total_amount integer,
  booking_status booking_status,
  payment_status payment_status,
  payment_method text,
  special_requests text,
  room_id uuid,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    b.id, 
    b.reference_number, 
    b.guest_name, 
    b.guest_email, 
    b.guest_phone,
    b.check_in_date, 
    b.check_out_date, 
    b.total_amount,
    b.booking_status, 
    b.payment_status,
    b.payment_method,
    b.special_requests,
    b.room_id,
    b.created_at
  FROM bookings b
  WHERE b.reference_number = ref_number
  LIMIT 1;
$$;