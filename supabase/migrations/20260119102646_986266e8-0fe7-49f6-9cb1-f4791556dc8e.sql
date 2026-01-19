-- Add payment_proof_url column to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload payment proofs (guests need to upload without auth)
CREATE POLICY "Anyone can upload payment proofs"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'payment-proofs');

-- Only admins can view payment proofs
CREATE POLICY "Admins can view payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can delete payment proofs
CREATE POLICY "Admins can delete payment proofs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));