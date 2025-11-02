-- Phase 1: Fix Critical Data Exposure
-- Remove the dangerous RLS policy that exposes all profile data
DROP POLICY IF EXISTS "Authenticated users can view basic venue info" ON public.profiles;

-- Phase 2: Create security definer function to safely check admin status
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

-- Phase 3: Fix Privilege Escalation - Create trigger to prevent admin status changes
CREATE OR REPLACE FUNCTION public.prevent_admin_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If user is trying to change their admin status and they're not already an admin
  IF OLD.is_admin != NEW.is_admin AND NOT OLD.is_admin THEN
    -- Only allow if the person making the change is already an admin
    IF NOT public.is_user_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only administrators can grant admin privileges';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the trigger to profiles table
DROP TRIGGER IF EXISTS prevent_admin_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_admin_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_escalation();

-- Phase 4: Update admin policies to use the secure function
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

-- Phase 5: Add audit logging table for sensitive operations
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