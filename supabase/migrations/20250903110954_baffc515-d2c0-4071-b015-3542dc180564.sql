-- Enable real-time updates for analytics tables
ALTER TABLE song_plays REPLICA IDENTITY FULL;
ALTER TABLE song_queue REPLICA IDENTITY FULL;
ALTER TABLE venue_revenue REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication to enable real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE song_plays;
ALTER PUBLICATION supabase_realtime ADD TABLE song_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE venue_revenue;