-- Add spotify_client_secret field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN spotify_client_secret TEXT;