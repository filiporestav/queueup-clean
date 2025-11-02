-- Enable realtime for song_queue table (set replica identity)
ALTER TABLE public.song_queue REPLICA IDENTITY FULL;