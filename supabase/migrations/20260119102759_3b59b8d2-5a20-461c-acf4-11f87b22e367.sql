-- Drop existing function first then recreate with new signature
DROP FUNCTION IF EXISTS public.get_booking_by_reference(text);

-- Recreate the RPC function with payment_proof_url
CREATE FUNCTION public.get_booking_by_reference(ref_number text)
RETURNS TABLE (
  id uuid,
  reference_number text,
  room_id uuid,
  guest_name text,
  guest_email text,
  guest_phone text,
  check_in_date date,
  check_out_date date,
  total_amount integer,
  booking_status public.booking_status,
  payment_status public.payment_status,
  payment_method text,
  special_requests text,
  payment_proof_url text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.reference_number,
    b.room_id,
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
    b.payment_proof_url,
    b.created_at
  FROM bookings b
  WHERE b.reference_number = ref_number;
END;
$$;

-- Create RPC function to update payment proof (allows guest to upload proof without auth)
CREATE OR REPLACE FUNCTION public.update_booking_payment_proof(ref_number text, proof_url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE bookings
  SET payment_proof_url = proof_url
  WHERE reference_number = ref_number;
  
  RETURN FOUND;
END;
$$;