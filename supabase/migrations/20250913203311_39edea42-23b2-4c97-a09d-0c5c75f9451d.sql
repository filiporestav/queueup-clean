-- Fix broken upsert_spotify_credentials function (VALUES had fewer items than target columns)
CREATE OR REPLACE FUNCTION public.upsert_spotify_credentials(
  client_id text DEFAULT NULL::text,
  client_secret text DEFAULT NULL::text,
  access_token text DEFAULT NULL::text,
  refresh_token text DEFAULT NULL::text,
  expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone,
  playlist_id text DEFAULT NULL::text,
  restrict_playlist boolean DEFAULT NULL::boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Only authenticated users can update credentials
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Insert or update credentials (fix: include playlist_id in VALUES list)
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
    playlist_id,
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
$function$;