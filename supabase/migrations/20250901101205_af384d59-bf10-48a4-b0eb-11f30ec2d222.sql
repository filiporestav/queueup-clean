-- Add playlist functionality to profiles table
ALTER TABLE public.profiles 
ADD COLUMN restrict_to_playlist boolean DEFAULT false,
ADD COLUMN spotify_playlist_id text;