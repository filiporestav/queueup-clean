import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Clock, User } from "lucide-react";
import { useVenueQueue } from "@/hooks/useVenueQueue";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VenueQueueProps {
  venueId: string | undefined;
  venueAllowsQueueing?: boolean;
}

export const VenueQueue = ({ venueId, venueAllowsQueueing = true }: VenueQueueProps) => {
  const { queueItems, loading } = useVenueQueue(venueId);

  // Auto sync Spotify playback every 10 seconds
  useEffect(() => {
    if (!venueId) return;

    const autoSync = async () => {
      try {
        const response = await supabase.functions.invoke("sync-spotify-playback", {
          body: { venueId },
        });

        const { data, error } = response;
        if (error) {
          console.error("Auto sync error:", error);
        }
      } catch (error) {
        console.error("Auto sync error:", error);
      }
    };

    // Run initial sync
    autoSync();

    // Set up interval for continuous syncing
    const interval = setInterval(autoSync, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [venueId]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'playing':
        return <Badge variant="default" className="bg-primary text-primary-foreground">🎵 Spelar</Badge>;
      case 'pending':
        return <Badge variant="secondary">⏳ I kö</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Nuvarande kö
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Laddar...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Nuvarande kö ({queueItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {queueItems.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="bg-muted/30 rounded-full p-6 w-fit mx-auto mb-6">
              <Music className="h-16 w-16 text-muted-foreground/60" />
            </div>
            {!venueAllowsQueueing ? (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">Queue Currently Disabled</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  The venue is not accepting song requests at this time. Check back later!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">No Songs in Queue</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Be the first to request a song and get the party started! 🎵
                </p>
              </div>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {queueItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 border border-border rounded-lg transition-colors ${
                    item.status === 'playing' 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {item.position || index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{item.song_name}</h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {item.artist_name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.requested_at)}
                      </span>
                      {item.requester_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.requester_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};