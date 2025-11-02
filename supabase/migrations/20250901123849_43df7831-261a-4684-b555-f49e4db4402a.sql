-- Enable realtime for song_queue table
ALTER TABLE public.song_queue REPLICA IDENTITY FULL;

-- Add song_queue to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_queue;