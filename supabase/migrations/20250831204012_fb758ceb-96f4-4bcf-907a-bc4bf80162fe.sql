-- Add logo storage and profile logo field
ALTER TABLE public.profiles ADD COLUMN logo_url TEXT;

-- Create storage bucket for venue logos
INSERT INTO storage.buckets (id, name, public) VALUES ('venue-logos', 'venue-logos', true);

-- Storage policies for venue logos
CREATE POLICY "Users can view all venue logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'venue-logos');

CREATE POLICY "Users can upload their own venue logo" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'venue-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own venue logo" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'venue-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own venue logo" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'venue-logos' AND auth.uid()::text = (storage.foldername(name))[1]);