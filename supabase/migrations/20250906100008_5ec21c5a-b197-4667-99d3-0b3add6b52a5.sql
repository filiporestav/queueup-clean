-- Create a secure table for Spotify credentials with encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create spotify_credentials table with better security
CREATE TABLE public.spotify_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id_encrypted text,
  client_secret_encrypted text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamp with time zone,
  playlist_id text,
  restrict_to_playlist boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on spotify_credentials
ALTER TABLE public.spotify_credentials ENABLE ROW LEVEL SECURITY;

-- Create restrictive RLS policies for spotify_credentials
-- Only the owner can view their credentials
CREATE POLICY "Users can view their own spotify credentials"
ON public.spotify_credentials
FOR SELECT
USING (auth.uid() = user_id);

-- Only the owner can update their credentials
CREATE POLICY "Users can update their own spotify credentials"
ON public.spotify_credentials
FOR UPDATE
USING (auth.uid() = user_id);

-- Only the owner can insert their credentials
CREATE POLICY "Users can insert their own spotify credentials"
ON public.spotify_credentials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete their credentials
CREATE POLICY "Users can delete their own spotify credentials"
ON public.spotify_credentials
FOR DELETE
USING (auth.uid() = user_id);

-- Create functions to encrypt/decrypt credentials safely using pgcrypto
CREATE OR REPLACE FUNCTION public.encrypt_spotify_credential(credential text, user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE 
    WHEN credential IS NULL OR credential = '' THEN NULL
    ELSE pgp_sym_encrypt(credential, (user_uuid::text || '_spotify_encrypt_key'))
  END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_spotify_credential(encrypted_credential text, user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE 
    WHEN encrypted_credential IS NULL OR encrypted_credential = '' THEN NULL
    ELSE pgp_sym_decrypt(encrypted_credential, (user_uuid::text || '_spotify_encrypt_key'))
  END;
$$;

-- Migrate existing data from profiles to spotify_credentials with encryption
INSERT INTO public.spotify_credentials (
  user_id, 
  client_id_encrypted, 
  client_secret_encrypted, 
  access_token_encrypted,
  playlist_id,
  restrict_to_playlist
)
SELECT 
  user_id,
  public.encrypt_spotify_credential(spotify_client_id, user_id),
  public.encrypt_spotify_credential(spotify_client_secret, user_id),
  public.encrypt_spotify_credential(spotify_token, user_id),
  spotify_playlist_id,
  restrict_to_playlist
FROM public.profiles 
WHERE spotify_client_id IS NOT NULL OR spotify_client_secret IS NOT NULL OR spotify_token IS NOT NULL;

-- Remove sensitive Spotify columns from profiles table
ALTER TABLE public.profiles 
  DROP COLUMN spotify_client_id,
  DROP COLUMN spotify_client_secret, 
  DROP COLUMN spotify_token,
  DROP COLUMN spotify_playlist_id,
  DROP COLUMN restrict_to_playlist;

-- Create trigger for updated_at
CREATE TRIGGER update_spotify_credentials_updated_at
  BEFORE UPDATE ON public.spotify_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a secure view for accessing decrypted credentials (only for the owner)
CREATE OR REPLACE FUNCTION public.get_spotify_credentials(user_uuid uuid DEFAULT auth.uid())
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
    public.decrypt_spotify_credential(client_id_encrypted, user_uuid),
    public.decrypt_spotify_credential(client_secret_encrypted, user_uuid),
    public.decrypt_spotify_credential(access_token_encrypted, user_uuid),
    public.decrypt_spotify_credential(refresh_token_encrypted, user_uuid),
    sc.token_expires_at,
    sc.playlist_id,
    sc.restrict_to_playlist
  FROM public.spotify_credentials sc
  WHERE sc.user_id = user_uuid AND auth.uid() = user_uuid;
$$;

-- Create a function to safely update Spotify credentials
CREATE OR REPLACE FUNCTION public.update_spotify_credentials(
  user_uuid uuid,
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
  -- Only allow users to update their own credentials
  IF auth.uid() != user_uuid THEN
    RETURN FALSE;
  END IF;
  
  -- Insert or update credentials
  INSERT INTO public.spotify_credentials (
    user_id,
    client_id_encrypted,
    client_secret_encrypted,
    access_token_encrypted,
    refresh_token_encrypted,
    token_expires_at,
    playlist_id,
    restrict_to_playlist
  )
  VALUES (
    user_uuid,
    CASE WHEN client_id IS NOT NULL THEN public.encrypt_spotify_credential(client_id, user_uuid) ELSE NULL END,
    CASE WHEN client_secret IS NOT NULL THEN public.encrypt_spotify_credential(client_secret, user_uuid) ELSE NULL END,
    CASE WHEN access_token IS NOT NULL THEN public.encrypt_spotify_credential(access_token, user_uuid) ELSE NULL END,
    CASE WHEN refresh_token IS NOT NULL THEN public.encrypt_spotify_credential(refresh_token, user_uuid) ELSE NULL END,
    expires_at,
    playlist_id,
    COALESCE(restrict_playlist, false)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    client_id_encrypted = COALESCE(
      CASE WHEN client_id IS NOT NULL THEN public.encrypt_spotify_credential(client_id, user_uuid) END,
      spotify_credentials.client_id_encrypted
    ),
    client_secret_encrypted = COALESCE(
      CASE WHEN client_secret IS NOT NULL THEN public.encrypt_spotify_credential(client_secret, user_uuid) END,
      spotify_credentials.client_secret_encrypted  
    ),
    access_token_encrypted = COALESCE(
      CASE WHEN access_token IS NOT NULL THEN public.encrypt_spotify_credential(access_token, user_uuid) END,
      spotify_credentials.access_token_encrypted
    ),
    refresh_token_encrypted = COALESCE(
      CASE WHEN refresh_token IS NOT NULL THEN public.encrypt_spotify_credential(refresh_token, user_uuid) END,
      spotify_credentials.refresh_token_encrypted
    ),
    token_expires_at = COALESCE(expires_at, spotify_credentials.token_expires_at),
    playlist_id = COALESCE(playlist_id, spotify_credentials.playlist_id),
    restrict_to_playlist = COALESCE(restrict_playlist, spotify_credentials.restrict_to_playlist),
    updated_at = now();
    
  RETURN TRUE;
END;
$$;