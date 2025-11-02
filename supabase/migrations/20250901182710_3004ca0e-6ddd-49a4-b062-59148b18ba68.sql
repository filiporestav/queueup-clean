-- Drop the problematic view and recreate it properly
DROP VIEW public.venue_public_info;

-- Create a simple view without security definer properties
CREATE VIEW public.venue_public_info AS
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

-- Set proper ownership and permissions
ALTER VIEW public.venue_public_info OWNER TO postgres;
GRANT SELECT ON public.venue_public_info TO anon, authenticated;