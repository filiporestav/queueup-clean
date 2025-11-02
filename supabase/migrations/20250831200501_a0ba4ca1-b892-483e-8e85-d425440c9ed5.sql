-- Create a public policy to allow anonymous users to view venue information
-- This allows customers to access venue pages without authentication
CREATE POLICY "Allow public access to venue information" 
ON public.profiles 
FOR SELECT 
USING (true);