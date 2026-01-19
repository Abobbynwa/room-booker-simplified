-- Fix 1: Add admin-only write policies for rooms table
CREATE POLICY "Admins can update rooms"
ON public.rooms
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert rooms"
ON public.rooms
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rooms"
ON public.rooms
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Add database constraints for booking data validation
-- Date range validation (check_out must be after check_in)
ALTER TABLE public.bookings ADD CONSTRAINT bookings_valid_dates 
  CHECK (check_out_date > check_in_date);

-- Positive amount
ALTER TABLE public.bookings ADD CONSTRAINT bookings_positive_amount 
  CHECK (total_amount > 0);

-- Guest name not empty
ALTER TABLE public.bookings ADD CONSTRAINT bookings_guest_name_not_empty 
  CHECK (length(trim(guest_name)) > 0);

-- Fix 3: Create trigger to validate booking pricing matches room price
CREATE OR REPLACE FUNCTION public.validate_booking_pricing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  room_price INTEGER;
  nights INTEGER;
  expected_amount INTEGER;
BEGIN
  -- Get room price
  SELECT price_per_night INTO room_price
  FROM rooms WHERE id = NEW.room_id;
  
  IF room_price IS NULL THEN
    RAISE EXCEPTION 'Invalid room_id: room does not exist';
  END IF;
  
  -- Calculate expected amount
  nights := NEW.check_out_date - NEW.check_in_date;
  expected_amount := room_price * nights;
  
  -- Validate amount (allow small tolerance for rounding)
  IF ABS(NEW.total_amount - expected_amount) > 100 THEN
    RAISE EXCEPTION 'Invalid booking amount. Expected: %, Got: %', expected_amount, NEW.total_amount;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_booking_pricing_trigger
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.validate_booking_pricing();

-- Fix 4: Create trigger to prevent double-booking
CREATE OR REPLACE FUNCTION public.prevent_double_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE room_id = NEW.room_id
      AND booking_status IN ('pending', 'confirmed')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
        (NEW.check_in_date, NEW.check_out_date) OVERLAPS (check_in_date, check_out_date)
      )
  ) THEN
    RAISE EXCEPTION 'Room is already booked for these dates';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_double_booking_trigger
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.prevent_double_booking();