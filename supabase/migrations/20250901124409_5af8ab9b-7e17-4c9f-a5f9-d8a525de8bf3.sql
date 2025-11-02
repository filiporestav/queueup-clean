-- Allow public read access to song queue so customers can see real-time updates
CREATE POLICY "Anyone can view song queue" 
ON public.song_queue 
FOR SELECT 
USING (true);