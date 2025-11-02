-- Add spotify_client_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN spotify_client_id TEXT;

-- Update the handle_new_user function to include spotify_client_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, venue_name, physical_address, email, spotify_client_id)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'venue_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'physical_address', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'spotify_client_id', '')
  );
  RETURN NEW;
END;
$function$;