-- Add started_playing_at field to song_queue table to track when songs begin playing
ALTER TABLE public.song_queue 
ADD COLUMN started_playing_at TIMESTAMP WITH TIME ZONE;