-- Fix the function search path security warnings
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND is_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.prevent_admin_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- If user is trying to change their admin status and they're not already an admin
  IF OLD.is_admin != NEW.is_admin AND NOT OLD.is_admin THEN
    -- Only allow if the person making the change is already an admin
    IF NOT public.is_user_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only administrators can grant admin privileges';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remove any potentially problematic security definer views
DROP VIEW IF EXISTS public.venue_public_info CASCADE;

-- Create a proper function instead of a security definer view
CREATE OR REPLACE FUNCTION public.get_venue_public_info(venue_uuid uuid)
RETURNS TABLE (
  id uuid,
  venue_name text,
  logo_url text,
  allow_queueing boolean,
  enable_pricing boolean,
  dynamic_pricing boolean,
  static_price numeric,
  restrict_to_playlist boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT 
    p.id,
    p.venue_name,
    p.logo_url,
    p.allow_queueing,
    p.enable_pricing,
    p.dynamic_pricing,
    p.static_price,
    p.restrict_to_playlist,
    p.created_at
  FROM public.profiles p
  WHERE p.id = venue_uuid;
$$;