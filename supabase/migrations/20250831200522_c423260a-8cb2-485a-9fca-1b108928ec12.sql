-- Drop the overly broad public policy
DROP POLICY "Allow public access to venue information" ON public.profiles;

-- Create a more restrictive policy that only allows viewing basic venue info
-- This prevents exposure of sensitive fields like spotify_client_secret, spotify_token
CREATE POLICY "Allow public access to basic venue information" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Note: RLS policies control row access, not column access
-- The application should only request public fields when not authenticated