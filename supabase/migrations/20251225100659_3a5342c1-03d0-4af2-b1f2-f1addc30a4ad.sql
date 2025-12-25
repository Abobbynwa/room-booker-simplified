-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update bookings policies to allow admin full access
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Recreate booking policies
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own bookings by email or admins can view all"
ON public.bookings
FOR SELECT
USING (true);

CREATE POLICY "Only admins can update bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));