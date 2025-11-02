-- Fix get_venue_public_info to work with either profiles.id or profiles.user_id
-- and to source restrict_to_playlist from spotify_credentials

CREATE OR REPLACE FUNCTION public.get_venue_public_info(venue_uuid uuid)
RETURNS TABLE(
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
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT 
    p.id,
    p.venue_name,
    p.logo_url,
    p.allow_queueing,
    p.enable_pricing,
    p.dynamic_pricing,
    p.static_price,
    COALESCE(sc.restrict_to_playlist, false) AS restrict_to_playlist,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.spotify_credentials sc ON sc.user_id = p.user_id
  WHERE p.id = venue_uuid OR p.user_id = venue_uuid;
$function$;