-- Enable realtime for analytics tables
ALTER TABLE public.song_plays REPLICA IDENTITY FULL;
ALTER TABLE public.song_queue REPLICA IDENTITY FULL;
ALTER TABLE public.venue_revenue REPLICA IDENTITY FULL;
ALTER TABLE public.rejected_songs REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_plays;
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_revenue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rejected_songs;