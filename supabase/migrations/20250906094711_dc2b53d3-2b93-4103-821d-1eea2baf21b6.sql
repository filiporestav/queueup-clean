-- Phase 1: Fix Critical Data Exposure
-- Remove the dangerous RLS policy that exposes all profile data
DROP POLICY IF EXISTS "Authenticated users can view basic venue info" ON public.profiles;

-- Create a secure view for public venue information (no sensitive data)
CREATE OR REPLACE VIEW public.venue_public_info AS 
SELECT 
  id,
  venue_name,
  logo_url,
  allow_queueing,
  enable_pricing,
  dynamic_pricing,
  static_price,
  restrict_to_playlist,
  created_at
FROM public.profiles;

-- Enable RLS on the view (though it's not strictly necessary for views)
ALTER VIEW public.venue_public_info OWNER TO postgres;

-- Phase 2: Fix Privilege Escalation - Prevent users from making themselves admin
CREATE POLICY "Users cannot update admin status" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Allow update if is_admin field is not being changed
    (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()) = NEW.is_admin
  )
);

-- Phase 3: Create security definer function to safely check admin status
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND is_admin = true
  );
$$;

-- Update admin policies to use the secure function instead of direct table access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_user_admin() OR auth.uid() = user_id);

-- Update other admin policies to use the secure function
DROP POLICY IF EXISTS "Admins can view all contact requests" ON public.contact_requests;
CREATE POLICY "Admins can view all contact requests" 
ON public.contact_requests 
FOR SELECT 
USING (public.is_user_admin());

DROP POLICY IF EXISTS "Admins can view all rejected songs" ON public.rejected_songs;  
CREATE POLICY "Admins can view all rejected songs"
ON public.rejected_songs
FOR SELECT 
USING (public.is_user_admin());

DROP POLICY IF EXISTS "Admins can view all song plays" ON public.song_plays;
CREATE POLICY "Admins can view all song plays"
ON public.song_plays  
FOR SELECT
USING (public.is_user_admin());

DROP POLICY IF EXISTS "Admins can view all song queue data" ON public.song_queue;
CREATE POLICY "Admins can view all song queue data"
ON public.song_queue
FOR SELECT  
USING (public.is_user_admin());

DROP POLICY IF EXISTS "Admins can view all revenue data" ON public.venue_revenue;
CREATE POLICY "Admins can view all revenue data"
ON public.venue_revenue
FOR SELECT
USING (public.is_user_admin());

-- Phase 4: Add audit logging table for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (public.is_user_admin());

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  target_table text DEFAULT NULL,
  target_id uuid DEFAULT NULL,
  old_data jsonb DEFAULT NULL,
  new_data jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    action_type,
    target_table,
    target_id,
    old_data,
    new_data
  );
END;
$$;