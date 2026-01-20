-- Create a function to grant admin role by email
CREATE OR REPLACE FUNCTION public.grant_admin_role_by_email(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  result_message TEXT;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  -- Check if user exists
  IF target_user_id IS NULL THEN
    RETURN 'Error: No user found with email ' || user_email;
  END IF;
  
  -- Check if user already has admin role
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin') THEN
    RETURN 'User ' || user_email || ' already has admin role';
  END IF;
  
  -- Grant admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin');
  
  RETURN 'Successfully granted admin role to ' || user_email;
END;
$$;