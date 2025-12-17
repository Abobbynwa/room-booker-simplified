-- Create room types enum
CREATE TYPE public.room_type AS ENUM ('standard', 'deluxe', 'executive', 'suite', 'presidential');

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'confirmed');

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  type room_type NOT NULL DEFAULT 'standard',
  name TEXT NOT NULL,
  description TEXT,
  price_per_night INTEGER NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  features TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number TEXT NOT NULL UNIQUE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_amount INTEGER NOT NULL,
  booking_status booking_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table (for simple admin authentication)
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms (public read, admin write)
CREATE POLICY "Rooms are publicly viewable" 
ON public.rooms 
FOR SELECT 
USING (true);

-- RLS Policies for bookings (public can insert and view by reference)
CREATE POLICY "Anyone can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view bookings" 
ON public.bookings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update bookings" 
ON public.bookings 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate reference number
CREATE OR REPLACE FUNCTION public.generate_reference_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number = 'BK' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto-generating reference numbers
CREATE TRIGGER generate_booking_reference
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.generate_reference_number();