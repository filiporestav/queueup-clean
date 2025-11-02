import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Music,
  List,
  TrendingUp,
  ArrowLeft,
  Users,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VenueStats {
  venueInfo: {
    venue_name: string;
    physical_address: string;
    created_at: string;
  };
  totalRevenue: number;
  revenueToday: number;
  totalSongsPlayed: number;
  totalSongsQueued: number;
  currentQueueSize: number;
  popularSongs: Array<{
    song_name: string;
    artist_name: string;
    play_count: number;
  }>;
  topArtists: Array<{
    artist_name: string;
    song_count: number;
  }>;
  peakRequestHours: Array<{
    hour: number;
    count: number;
  }>;
  averageSongDuration: number;
  revenueOverTime: Array<{
    date: string;
    amount: number;
  }>;
  songsPlayedOverTime: Array<{
    date: string;
    count: number;
  }>;
}

export default function VenueAnalytics() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const [stats, setStats] = useState<VenueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVenueStats = async () => {
    if (!isAdmin || !venueId) return;

    try {
      // Get venue info
      const { data: venueInfo } = await supabase
        .from("profiles")
        .select("venue_name, physical_address, created_at")
        .eq("user_id", venueId)
        .single();

      if (!venueInfo) {
        setIsLoading(false);
        return;
      }

      // Get total revenue
      const { data: revenueData } = await supabase
        .from("venue_revenue")
        .select("amount, created_at")
        .eq("venue_id", venueId);

      const totalRevenue = revenueData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      // Get today's revenue
      const today = new Date().toISOString().split('T')[0];
      const revenueToday = revenueData?.filter(item => 
        item.created_at.startsWith(today)
      ).reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      // Get total songs played
      const { count: totalSongsPlayed } = await supabase
        .from("song_plays")
        .select("*", { count: "exact", head: true })
        .eq("venue_id", venueId);

      // Get total songs queued (all time)
      const { count: totalSongsQueued } = await supabase
        .from("song_queue")
        .select("*", { count: "exact", head: true })
        .eq("venue_id", venueId);

      // Get current queue size
      const { count: currentQueueSize } = await supabase
        .from("song_queue")
        .select("*", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .in("status", ["pending", "playing"]);

      // Get popular songs
      const { data: allSongPlays } = await supabase
        .from("song_plays")
        .select("song_name, artist_name")
        .eq("venue_id", venueId);

      const songCounts = allSongPlays?.reduce((acc: any, song) => {
        const key = `${song.song_name}|||${song.artist_name}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const popularSongs = Object.entries(songCounts || {})
        .map(([key, count]) => {
          const [song_name, artist_name] = key.split("|||");
          return { song_name, artist_name, play_count: count as number };
        })
        .sort((a, b) => b.play_count - a.play_count)
        .slice(0, 10);

      // Get top artists
      const artistCounts = allSongPlays?.reduce((acc: any, song) => {
        acc[song.artist_name] = (acc[song.artist_name] || 0) + 1;
        return acc;
      }, {});

      const topArtists = Object.entries(artistCounts || {})
        .map(([artist_name, song_count]) => ({
          artist_name,
          song_count: song_count as number,
        }))
        .sort((a, b) => b.song_count - a.song_count)
        .slice(0, 8);

      // Get peak request hours
      const { data: queueData } = await supabase
        .from("song_queue")
        .select("requested_at")
        .eq("venue_id", venueId);

      const { data: playData } = await supabase
        .from("song_plays")
        .select("played_at")
        .eq("venue_id", venueId);

      const hourCounts: { [hour: number]: number } = {};
      
      queueData?.forEach(item => {
        const hour = new Date(item.requested_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      playData?.forEach(item => {
        const hour = new Date(item.played_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const peakRequestHours = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: hourCounts[hour] || 0,
      }));

      // Get average song duration
      const { data: durationData } = await supabase
        .from("song_plays")
        .select("duration_ms")
        .eq("venue_id", venueId)
        .not("duration_ms", "is", null);

      const averageSongDuration = durationData?.length ? 
        durationData.reduce((sum, item) => sum + (item.duration_ms || 0), 0) / durationData.length : 0;

      // Get revenue over time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const revenueOverTimeData = revenueData?.filter(item => 
        new Date(item.created_at) >= thirtyDaysAgo
      );

      const revenueByDate = revenueOverTimeData?.reduce((acc: any, item) => {
        const date = new Date(item.created_at).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + Number(item.amount);
        return acc;
      }, {});

      const revenueOverTime = Object.entries(revenueByDate || {})
        .map(([date, amount]) => ({ date, amount: amount as number }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Get songs played over time (last 30 days)
      const songsPlayedOverTimeData = playData?.filter(item => 
        new Date(item.played_at) >= thirtyDaysAgo
      );

      const playsByDate = songsPlayedOverTimeData?.reduce((acc: any, item) => {
        const date = new Date(item.played_at).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const songsPlayedOverTime = Object.entries(playsByDate || {})
        .map(([date, count]) => ({ date, count: count as number }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setStats({
        venueInfo,
        totalRevenue,
        revenueToday,
        totalSongsPlayed: totalSongsPlayed || 0,
        totalSongsQueued: totalSongsQueued || 0,
        currentQueueSize: currentQueueSize || 0,
        popularSongs,
        topArtists,
        peakRequestHours,
        averageSongDuration,
        revenueOverTime,
        songsPlayedOverTime,
      });
    } catch (error) {
      console.error("Error fetching venue stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenueStats();

    // Set up real-time listeners
    const revenueChannel = supabase
      .channel('venue-revenue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venue_revenue',
          filter: `venue_id=eq.${venueId}`
        },
        () => fetchVenueStats()
      )
      .subscribe();

    const queueChannel = supabase
      .channel('venue-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'song_queue',
          filter: `venue_id=eq.${venueId}`
        },
        () => fetchVenueStats()
      )
      .subscribe();

    const playsChannel = supabase
      .channel('venue-plays-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'song_plays',
          filter: `venue_id=eq.${venueId}`
        },
        () => fetchVenueStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(revenueChannel);
      supabase.removeChannel(queueChannel);
      supabase.removeChannel(playsChannel);
    };
  }, [venueId, isAdmin]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading venue analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>
            You don't have admin privileges to view this data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats?.venueInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>
            Venue not found or no data available.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--muted))",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin')}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Badge variant="outline" className="ml-auto">
              <Users className="w-4 h-4 mr-1" />
              Live Analytics
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {stats.venueInfo.venue_name}
          </h1>
          <p className="text-muted-foreground mb-2">
            {stats.venueInfo.physical_address}
          </p>
          <p className="text-sm text-muted-foreground">
            Member since {new Date(stats.venueInfo.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRevenue.toFixed(2)} kr
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.revenueToday.toFixed(2)} kr
              </div>
              <p className="text-xs text-muted-foreground">Today's earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Songs Played</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSongsPlayed}</div>
              <p className="text-xs text-muted-foreground">Total plays</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Queue</CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentQueueSize}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalSongsQueued} total queued
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Sections */}
        <div className="space-y-6">
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Peak Request Hours</CardTitle>
                <CardDescription>Most active times for song requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.peakRequestHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, "Requests"]} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Artists</CardTitle>
                <CardDescription>Most played artists at this venue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.topArtists}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ artist_name, percent }) =>
                        `${artist_name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="song_count"
                    >
                      {stats.topArtists.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.revenueOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${Number(value).toFixed(2)} kr`, "Revenue"]}
                    />
                    <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Songs Played Trend (Last 30 Days)</CardTitle>
                <CardDescription>Daily song plays over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.songsPlayedOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, "Songs"]} />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--secondary))" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Popular Songs & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Most Popular Songs</CardTitle>
                <CardDescription>Top requested songs at this venue</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {stats.popularSongs.map((song, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{song.song_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {song.artist_name}
                          </p>
                        </div>
                        <Badge variant="secondary">{song.play_count} plays</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Song Duration
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.averageSongDuration 
                    ? `${Math.floor((stats.averageSongDuration / 1000) / 60)}:${Math.floor((stats.averageSongDuration / 1000) % 60).toString().padStart(2, '0')}`
                    : '0:00'}
                </div>
                <p className="text-xs text-muted-foreground">Minutes:Seconds</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}