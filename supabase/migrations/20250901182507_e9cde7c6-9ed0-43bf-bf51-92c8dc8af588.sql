-- Fix security definer view issue by recreating without security definer
DROP VIEW public.venue_public_info;

-- Recreate the view with proper security settings
CREATE VIEW public.venue_public_info 
WITH (security_barrier=true) AS
SELECT 
  id,
  venue_name,
  logo_url,
  allow_queueing,
  enable_pricing,
  dynamic_pricing,
  static_price,
  restrict_to_playlist,
  created_at
FROM public.profiles;

-- Grant select permissions on the view
GRANT SELECT ON public.venue_public_info TO anon, authenticated;

-- Fix function search path security issue for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, venue_name, physical_address, email, spotify_client_id, spotify_client_secret)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'venue_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'physical_address', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'spotify_client_id', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'spotify_client_secret', '')
  );
  RETURN NEW;
END;
$function$;