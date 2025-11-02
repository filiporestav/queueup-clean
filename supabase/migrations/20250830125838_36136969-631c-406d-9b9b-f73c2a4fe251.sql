-- Create tables for analytics tracking

-- Table to track songs played at venues
CREATE TABLE public.song_plays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  song_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track venue revenue
CREATE TABLE public.venue_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  source TEXT NOT NULL, -- 'song_request', 'tip', 'other'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track current queue
CREATE TABLE public.song_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  song_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  requester_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'playing', 'completed', 'rejected'
  position INTEGER,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track rejected songs
CREATE TABLE public.rejected_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  song_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  rejection_reason TEXT,
  rejected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.song_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejected_songs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for song_plays
CREATE POLICY "Venues can view their own song plays" 
ON public.song_plays 
FOR SELECT 
USING (venue_id = auth.uid());

CREATE POLICY "Venues can insert their own song plays" 
ON public.song_plays 
FOR INSERT 
WITH CHECK (venue_id = auth.uid());

-- Create RLS policies for venue_revenue
CREATE POLICY "Venues can view their own revenue" 
ON public.venue_revenue 
FOR SELECT 
USING (venue_id = auth.uid());

CREATE POLICY "Venues can insert their own revenue" 
ON public.venue_revenue 
FOR INSERT 
WITH CHECK (venue_id = auth.uid());

-- Create RLS policies for song_queue
CREATE POLICY "Venues can view their own queue" 
ON public.song_queue 
FOR SELECT 
USING (venue_id = auth.uid());

CREATE POLICY "Venues can manage their own queue" 
ON public.song_queue 
FOR ALL 
USING (venue_id = auth.uid())
WITH CHECK (venue_id = auth.uid());

-- Create RLS policies for rejected_songs
CREATE POLICY "Venues can view their own rejected songs" 
ON public.rejected_songs 
FOR SELECT 
USING (venue_id = auth.uid());

CREATE POLICY "Venues can insert their own rejected songs" 
ON public.rejected_songs 
FOR INSERT 
WITH CHECK (venue_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_song_plays_venue_id_played_at ON public.song_plays(venue_id, played_at DESC);
CREATE INDEX idx_venue_revenue_venue_id_created_at ON public.venue_revenue(venue_id, created_at DESC);
CREATE INDEX idx_song_queue_venue_id_position ON public.song_queue(venue_id, position);
CREATE INDEX idx_rejected_songs_venue_id_rejected_at ON public.rejected_songs(venue_id, rejected_at DESC);

-- Create trigger for updating song_queue updated_at
CREATE TRIGGER update_song_queue_updated_at
BEFORE UPDATE ON public.song_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();