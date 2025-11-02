-- Add admin flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_admin boolean NOT NULL DEFAULT false;

-- Create RLS policy for admin access to all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin = true OR auth.uid() = user_id);

-- Create RLS policy for admins to view all song queue data
CREATE POLICY "Admins can view all song queue data" 
ON public.song_queue 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create RLS policy for admins to view all revenue data
CREATE POLICY "Admins can view all revenue data" 
ON public.venue_revenue 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create RLS policy for admins to view all song plays
CREATE POLICY "Admins can view all song plays" 
ON public.song_plays 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create RLS policy for admins to view all rejected songs
CREATE POLICY "Admins can view all rejected songs" 
ON public.rejected_songs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);