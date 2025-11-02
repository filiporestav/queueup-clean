-- Add pricing settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN enable_pricing BOOLEAN DEFAULT false,
ADD COLUMN dynamic_pricing BOOLEAN DEFAULT true,
ADD COLUMN static_price NUMERIC DEFAULT 0.99;