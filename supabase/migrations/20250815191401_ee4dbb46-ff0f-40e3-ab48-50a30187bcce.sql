-- Fix the search path security issue for the function
ALTER FUNCTION public.handle_new_user() SET search_path = public;