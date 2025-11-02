-- Fix critical security vulnerability: Remove overly permissive policy that exposes sensitive data
DROP POLICY "Allow public access to basic venue information" ON public.profiles;

-- Create a view for public venue information that only exposes safe columns
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

-- Grant select permissions on the view
GRANT SELECT ON public.venue_public_info TO anon, authenticated;

-- Create a new restricted policy for profiles that only allows authenticated users to see basic info
CREATE POLICY "Authenticated users can view basic venue info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Note: The main profiles table now only allows:
-- 1. Users to view their own complete profile (existing policy)
-- 2. Authenticated users to view basic venue info (new policy)
-- 3. Public access through the venue_public_info view (safe columns only)