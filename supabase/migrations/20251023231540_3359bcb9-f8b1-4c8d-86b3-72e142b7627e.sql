-- Fix trigger to use user_roles table instead of profiles.role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles without role
  INSERT INTO public.profiles (user_id, name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email)
  );
  
  -- Insert role into user_roles (default to 'player')
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.app_role, 'player')
  );
  
  -- Insert into scores
  INSERT INTO public.scores (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column to have search_path set
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;