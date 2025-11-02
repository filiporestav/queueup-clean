import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Music, DollarSign, Clock, XCircle, TrendingUp, Users, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface SongPlay {
  id: string;
  song_name: string;
  artist_name: string;
  played_at: string;
}

interface Revenue {
  id: string;
  amount: number;
  currency: string;
  source: string;
  description: string;
  created_at: string;
}

interface QueueItem {
  id: string;
  song_name: string;
  artist_name: string;
  requester_name: string;
  status: string;
  position: number;
  requested_at: string;
}

interface RejectedSong {
  id: string;
  song_name: string;
  artist_name: string;
  rejection_reason: string;
  rejected_at: string;
}

interface WeeklyStats {
  totalPlays: number;
  totalRevenue: number;
  topSongs: { song_name: string; artist_name: string; play_count: number }[];
  recentActivity: SongPlay[];
}

interface AllTimeStats {
  totalPlaysAllTime: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalPlays: 0,
    totalRevenue: 0,
    topSongs: [],
    recentActivity: []
  });
  const [allTimeStats, setAllTimeStats] = useState<AllTimeStats>({
    totalPlaysAllTime: 0
  });
  const [currentQueue, setCurrentQueue] = useState<QueueItem[]>([]);
  const [rejectedSongs, setRejectedSongs] = useState<RejectedSong[]>([]);
  const [recentRevenue, setRecentRevenue] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      
      // Set up Spotify playback sync interval
      const syncSpotifyPlayback = async () => {
        try {
          await supabase.functions.invoke('sync-spotify-playback', {
            body: { venueId: user.id }
          });
        } catch (error) {
          console.error('Error syncing Spotify playback:', error);
        }
      };

      // Sync immediately and then every 10 seconds
      syncSpotifyPlayback();
      const spotifySync = setInterval(syncSpotifyPlayback, 10000);
      
      // Set up real-time subscriptions
      const songPlaysChannel = supabase
        .channel('song-plays-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'song_plays',
            filter: `venue_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Song plays INSERT received:', payload);
            fetchAnalytics();
          }
        )
        .subscribe((status) => {
          console.log('Song plays subscription status:', status);
        });

      const revenueChannel = supabase
        .channel('revenue-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'venue_revenue',
            filter: `venue_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Revenue INSERT received:', payload);
            fetchAnalytics();
          }
        )
        .subscribe((status) => {
          console.log('Revenue subscription status:', status);
        });

       // Add queue channel
      const queueChannel = supabase
        .channel('queue-changes')
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'song_queue',
            filter: `venue_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Queue DELETE received:', payload);
            fetchCurrentQueue();
            fetchAnalytics();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'song_queue',
            filter: `venue_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Queue UPDATE received:', payload);
            fetchCurrentQueue();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'song_queue',
            filter: `venue_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Queue INSERT received:', payload);
            fetchCurrentQueue();
          }
        )
        .subscribe((status) => {
          console.log('Queue subscription status:', status);
        });

      // Add rejected songs subscription
      const rejectedSongsChannel = supabase
        .channel('rejected-songs-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'rejected_songs',
            filter: `venue_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Rejected songs INSERT received:', payload);
            fetchAnalytics();
          }
        )
        .subscribe((status) => {
          console.log('Rejected songs subscription status:', status);
        });

      return () => {
        clearInterval(spotifySync);
        supabase.removeChannel(songPlaysChannel);
        supabase.removeChannel(revenueChannel);
        supabase.removeChannel(queueChannel);
        supabase.removeChannel(rejectedSongsChannel);
      };
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Get date range for this week
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);

      // Fetch song plays for the week
      const { data: songPlays, error: playsError } = await supabase
        .from("song_plays")
        .select("*")
        .eq("venue_id", user.id)
        .gte("played_at", weekStart.toISOString())
        .order("played_at", { ascending: false });

      if (playsError) throw playsError;

      // Fetch all-time song plays count
      const { count: allTimePlays, error: allTimeError } = await supabase
        .from("song_plays")
        .select("*", { count: 'exact', head: true })
        .eq("venue_id", user.id);

      if (allTimeError) throw allTimeError;

      // Fetch revenue for the week
      const { data: revenue, error: revenueError } = await supabase
        .from("venue_revenue")
        .select("*")
        .eq("venue_id", user.id)
        .gte("created_at", weekStart.toISOString())
        .order("created_at", { ascending: false });

      if (revenueError) throw revenueError;

      // Fetch recent rejected songs
      const { data: rejected, error: rejectedError } = await supabase
        .from("rejected_songs")
        .select("*")
        .eq("venue_id", user.id)
        .order("rejected_at", { ascending: false })
        .limit(10);

      if (rejectedError) throw rejectedError;

      // Process data for weekly stats
      const totalRevenue = revenue?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      
      // Calculate top songs
      const songCounts: { [key: string]: { song_name: string; artist_name: string; count: number } } = {};
      songPlays?.forEach(play => {
        const key = `${play.song_name}-${play.artist_name}`;
        if (!songCounts[key]) {
          songCounts[key] = { song_name: play.song_name, artist_name: play.artist_name, count: 0 };
        }
        songCounts[key].count++;
      });

      const topSongs = Object.values(songCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(({ song_name, artist_name, count }) => ({ song_name, artist_name, play_count: count }));

      setWeeklyStats({
        totalPlays: songPlays?.length || 0,
        totalRevenue,
        topSongs,
        recentActivity: songPlays?.slice(0, 10) || []
      });

      setAllTimeStats({
        totalPlaysAllTime: allTimePlays || 0
      });

      setRejectedSongs(rejected || []);
      setRecentRevenue(revenue?.slice(0, 10) || []);

    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda analysdata",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentQueue = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("song_queue")
        .select("*")
        .eq("venue_id", user.id)
        .in("status", ["pending", "playing"])
        .order("position", { ascending: true });

      if (error) throw error;
      setCurrentQueue(data || []);
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  };

  useEffect(() => {
    fetchCurrentQueue();
  }, [user]);

  const handleSongAction = async (queueItemId: string, action: 'completed' | 'reject') => {
    if (!user) return;

    try {
      if (action === 'reject') {
        const response = await supabase.functions.invoke('reject-song', {
          body: { 
            queueItemId, 
            venueId: user.id,
            rejectionReason: 'Rejected by venue'
          }
        });

        if (response.error) throw response.error;

        toast({
          title: "Låt nekad",
          description: response.data?.message || "Låten har nekats",
        });
      } else {
        const response = await supabase.functions.invoke('update-song-status', {
          body: { 
            queueItemId, 
            status: action,
            venueId: user.id
          }
        });

        if (response.error) throw response.error;

        toast({
          title: "Låt slutförd",
          description: response.data?.message || "Låten har markerats som slutförd",
        });
      }

      // No need to manually refresh - real-time subscriptions will handle it
    } catch (error) {
      console.error(`Error ${action} song:`, error);
      toast({
        title: "Fel",
        description: action === 'reject' ? "Kunde inte neka låt" : "Kunde inte slutföra låt",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 pt-20">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Laddar analysdata...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 pt-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Veckoanalys
          </h1>
          <p className="text-lg text-muted-foreground">
            Dina lokals prestanda
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Denna vecka</CardTitle>
              <Music className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyStats.totalPlays}</div>
              <p className="text-xs text-muted-foreground">Låtar spelade</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totalt</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allTimeStats.totalPlaysAllTime}</div>
              <p className="text-xs text-muted-foreground">Totalt antal låtar</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intäkter</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyStats.totalRevenue.toFixed(2)} kr</div>
              <p className="text-xs text-muted-foreground">Denna vecka</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktuell kö</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentQueue.length}</div>
              <p className="text-xs text-muted-foreground">Väntande låtar</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nekade</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedSongs.length}</div>
              <p className="text-xs text-muted-foreground">Låtar nekade</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Songs & Current Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Topp låtar denna vecka
              </CardTitle>
              <CardDescription>Mest spelade låtar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyStats.topSongs.length > 0 ? (
                  weeklyStats.topSongs.map((song, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{song.song_name}</p>
                          <p className="text-sm text-muted-foreground">{song.artist_name}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{song.play_count} spelningar</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">Inga låtar denna vecka</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Aktuell kö
              </CardTitle>
              <CardDescription>Låtar som väntar på att spelas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentQueue.length > 0 ? (
                  currentQueue.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm">
                          {item.position}
                        </div>
                        <div>
                          <p className="font-medium">{item.song_name}</p>
                          <p className="text-sm text-muted-foreground">{item.artist_name}</p>
                           {item.requester_name && (
                             <p className="text-xs text-muted-foreground">Begärd av {item.requester_name}</p>
                           )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Badge variant={item.status === 'playing' ? 'default' : 'secondary'}>
                           {item.status === 'playing' ? 'Spelar' : item.status === 'pending' ? 'Väntande' : item.status}
                         </Badge>
                        <div className="flex gap-1">
                          {item.status === 'playing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSongAction(item.id, 'completed')}
                              className="h-8 w-8 p-0"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSongAction(item.id, 'reject')}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">Inga köade låtar</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                Senaste aktivitet
              </CardTitle>
              <CardDescription>Senaste spelade låtar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyStats.recentActivity.length > 0 ? (
                  weeklyStats.recentActivity.map((play) => (
                    <div key={play.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{play.song_name}</p>
                        <p className="text-sm text-muted-foreground">{play.artist_name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(play.played_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">Ingen aktivitet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Senaste intäkter
              </CardTitle>
              <CardDescription>Senaste intjäningar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRevenue.length > 0 ? (
                  recentRevenue.map((revenue) => (
                    <div key={revenue.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{revenue.amount} kr</p>
                        <p className="text-sm text-muted-foreground capitalize">{revenue.source}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">+{revenue.amount} kr</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(revenue.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">Inga intäkter</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rejected Songs */}
        {rejectedSongs.length > 0 && (
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Nekade låtar
              </CardTitle>
              <CardDescription>Låtar som nekades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rejectedSongs.slice(0, 6).map((song) => (
                  <div key={song.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{song.song_name}</p>
                      <p className="text-sm text-muted-foreground">{song.artist_name}</p>
                      {song.rejection_reason && (
                        <p className="text-xs text-destructive mt-1">{song.rejection_reason}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(song.rejected_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}