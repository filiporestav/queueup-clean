-- Add allow_queueing field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN allow_queueing BOOLEAN NOT NULL DEFAULT true;