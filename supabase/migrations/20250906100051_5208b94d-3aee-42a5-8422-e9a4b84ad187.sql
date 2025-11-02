-- Create a secure table for Spotify credentials with better access control
CREATE TABLE public.spotify_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id text,
  client_secret text,
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  playlist_id text,
  restrict_to_playlist boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on spotify_credentials
ALTER TABLE public.spotify_credentials ENABLE ROW LEVEL SECURITY;

-- Create very restrictive RLS policies - NO ADMIN ACCESS to sensitive credentials
CREATE POLICY "Users can only access their own spotify credentials"
ON public.spotify_credentials
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Migrate existing data from profiles to spotify_credentials
INSERT INTO public.spotify_credentials (
  user_id, 
  client_id, 
  client_secret, 
  access_token,
  playlist_id,
  restrict_to_playlist
)
SELECT 
  user_id,
  spotify_client_id,
  spotify_client_secret,
  spotify_token,
  spotify_playlist_id,
  COALESCE(restrict_to_playlist, false)
FROM public.profiles 
WHERE spotify_client_id IS NOT NULL OR spotify_client_secret IS NOT NULL OR spotify_token IS NOT NULL;

-- Remove sensitive Spotify columns from profiles table  
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS spotify_client_id,
  DROP COLUMN IF EXISTS spotify_client_secret, 
  DROP COLUMN IF EXISTS spotify_token,
  DROP COLUMN IF EXISTS spotify_playlist_id,
  DROP COLUMN IF EXISTS restrict_to_playlist;

-- Create trigger for updated_at
CREATE TRIGGER update_spotify_credentials_updated_at
  BEFORE UPDATE ON public.spotify_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to safely get Spotify credentials (only for the owner)
CREATE OR REPLACE FUNCTION public.get_user_spotify_credentials()
RETURNS TABLE (
  client_id text,
  client_secret text,
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  playlist_id text,
  restrict_to_playlist boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    sc.client_id,
    sc.client_secret,
    sc.access_token,
    sc.refresh_token,
    sc.token_expires_at,
    sc.playlist_id,
    sc.restrict_to_playlist
  FROM public.spotify_credentials sc
  WHERE sc.user_id = auth.uid();
$$;

-- Create a function to safely update Spotify credentials
CREATE OR REPLACE FUNCTION public.upsert_spotify_credentials(
  client_id text DEFAULT NULL,
  client_secret text DEFAULT NULL,
  access_token text DEFAULT NULL,
  refresh_token text DEFAULT NULL,
  expires_at timestamp with time zone DEFAULT NULL,
  playlist_id text DEFAULT NULL,
  restrict_playlist boolean DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Only authenticated users can update credentials
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Insert or update credentials
  INSERT INTO public.spotify_credentials (
    user_id,
    client_id,
    client_secret,
    access_token,
    refresh_token,
    token_expires_at,
    playlist_id,
    restrict_to_playlist
  )
  VALUES (
    auth.uid(),
    client_id,
    client_secret,
    access_token,
    refresh_token,
    expires_at,
    COALESCE(restrict_playlist, false)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    client_id = COALESCE(EXCLUDED.client_id, spotify_credentials.client_id),
    client_secret = COALESCE(EXCLUDED.client_secret, spotify_credentials.client_secret),
    access_token = COALESCE(EXCLUDED.access_token, spotify_credentials.access_token),
    refresh_token = COALESCE(EXCLUDED.refresh_token, spotify_credentials.refresh_token),
    token_expires_at = COALESCE(EXCLUDED.token_expires_at, spotify_credentials.token_expires_at),
    playlist_id = COALESCE(EXCLUDED.playlist_id, spotify_credentials.playlist_id),
    restrict_to_playlist = COALESCE(EXCLUDED.restrict_to_playlist, spotify_credentials.restrict_to_playlist),
    updated_at = now();
    
  RETURN TRUE;
END;
$$;