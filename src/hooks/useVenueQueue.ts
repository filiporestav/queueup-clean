import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QueueItem {
  id: string;
  song_name: string;
  artist_name: string;
  status: string;
  position: number | null;
  requested_at: string;
  requester_name: string | null;
}

export const useVenueQueue = (venueId: string | undefined) => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    if (!venueId) return;
    
    try {
      const { data, error } = await supabase
        .from('song_queue')
        .select('id, song_name, artist_name, status, position, requested_at, requester_name')
        .eq('venue_id', venueId)
        .order('position', { ascending: true, nullsFirst: false })
        .order('requested_at', { ascending: true });

      if (error) {
        console.error('Error fetching queue:', error);
      } else {
        setQueueItems(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [venueId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!venueId) return;

    const channel = supabase
      .channel('song_queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'song_queue',
          filter: `venue_id=eq.${venueId}`
        },
        () => {
          // Refetch queue when any change happens
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId]);

  return { queueItems, loading, refetchQueue: fetchQueue };
};