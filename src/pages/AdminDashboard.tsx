import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Music,
  Users,
  TrendingUp,
  List,
  AlertTriangle,
  Download,
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
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AdminStats {
  totalRevenue: number;
  totalSongsQueued: number;
  totalVenues: number;
  totalSongsPlayed: number;
  popularSongs: Array<{
    song_name: string;
    artist_name: string;
    play_count: number;
  }>;
  revenueByVenue: Array<{
    venue_name: string;
    total_revenue: number;
  }>;
  venuesByQueueCount: Array<{
    venue_name: string;
    total_songs_queued: number;
    venue_id: string;
  }>;
  songsQueuedOverTime: Array<{
    date: string;
    count: number;
  }>;
  topGenres: Array<{
    artist_name: string;
    song_count: number;
  }>;
  queueTimeDistribution: Array<{
    hour: number;
    count: number;
  }>;
  averageSongDuration: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Fetch admin analytics data
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;

      try {
        // Total revenue across all venues
        const { data: revenueData } = await supabase
          .from("venue_revenue")
          .select("amount");

        const totalRevenue =
          revenueData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

        // Total songs queued
        const { data: queueData, count: totalSongsQueued } = await supabase
          .from("song_queue")
          .select("*", { count: "exact", head: true });

        // Total venues
        const { data: venueData, count: totalVenues } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Total songs played
        const { data: playData, count: totalSongsPlayed } = await supabase
          .from("song_plays")
          .select("*", { count: "exact", head: true });

        // Most popular songs
        const { data: popularSongs } = await supabase
          .from("song_plays")
          .select("song_name, artist_name")
          .order("created_at", { ascending: false });

        const songCounts = popularSongs?.reduce((acc: any, song) => {
          const key = `${song.song_name} - ${song.artist_name}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        const popularSongsFormatted = Object.entries(songCounts || {})
          .map(([key, count]) => {
            const [song_name, artist_name] = key.split(" - ");
            return { song_name, artist_name, play_count: count as number };
          })
          .sort((a, b) => b.play_count - a.play_count)
          .slice(0, 10);

        // Revenue by venue - fetch separately to avoid join issues
        const { data: revenueByVenueRaw } = await supabase
          .from("venue_revenue")
          .select("amount, venue_id");

        const { data: allProfiles } = await supabase
          .from("profiles")
          .select("user_id, venue_name");

        const profileMap =
          allProfiles?.reduce((acc: any, profile) => {
            acc[profile.user_id] = profile.venue_name;
            return acc;
          }, {}) || {};

        const revenueByVenue = revenueByVenueRaw?.reduce((acc: any, item) => {
          const venueName = profileMap[item.venue_id] || "Unknown Venue";
          acc[venueName] = (acc[venueName] || 0) + Number(item.amount);
          return acc;
        }, {});

        const revenueByVenueFormatted = Object.entries(revenueByVenue || {})
          .map(([venue_name, total_revenue]) => ({
            venue_name,
            total_revenue: total_revenue as number,
          }))
          .sort((a, b) => b.total_revenue - a.total_revenue);

        // Songs queued over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: queueOverTime } = await supabase
          .from("song_queue")
          .select("requested_at")
          .gte("requested_at", thirtyDaysAgo.toISOString());

        const songsQueuedOverTime = queueOverTime?.reduce((acc: any, item) => {
          const date = new Date(item.requested_at).toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const songsQueuedOverTimeFormatted = Object.entries(
          songsQueuedOverTime || {}
        )
          .map(([date, count]) => ({ date, count: count as number }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Top artists/genres
        const artistCounts = popularSongs?.reduce((acc: any, song) => {
          acc[song.artist_name] = (acc[song.artist_name] || 0) + 1;
          return acc;
        }, {});

        const topGenres = Object.entries(artistCounts || {})
          .map(([artist_name, song_count]) => ({
            artist_name,
            song_count: song_count as number,
          }))
          .sort((a, b) => b.song_count - a.song_count)
          .slice(0, 8);

        // Venues by queue count
        const { data: allQueueData } = await supabase
          .from("song_plays")
          .select("venue_id");

        const queueCountByVenue = allQueueData?.reduce((acc: any, item) => {
          acc[item.venue_id] = (acc[item.venue_id] || 0) + 1;
          return acc;
        }, {});

        const venuesByQueueCount = Object.entries(queueCountByVenue || {})
          .map(([venue_id, total_songs_queued]) => ({
            venue_id,
            venue_name: profileMap[venue_id] || "Unknown Venue",
            total_songs_queued: total_songs_queued as number,
          }))
          .sort((a, b) => b.total_songs_queued - a.total_songs_queued);

        // Queue time distribution - combine historical plays and current queue
        const [{ data: queueTimeData }, { data: playedTimeData }] =
          await Promise.all([
            supabase.from("song_queue").select("requested_at"),
            supabase.from("song_plays").select("played_at"),
          ]);

        const timeDistribution: { [hour: number]: number } = {};

        // Add queue requests
        queueTimeData?.forEach((item) => {
          const hour = new Date(item.requested_at).getHours();
          timeDistribution[hour] = (timeDistribution[hour] || 0) + 1;
        });

        // Add historical plays (using played_at as request time proxy)
        playedTimeData?.forEach((item) => {
          const hour = new Date(item.played_at).getHours();
          timeDistribution[hour] = (timeDistribution[hour] || 0) + 1;
        });

        const queueTimeDistribution = Array.from({ length: 24 }, (_, hour) => ({
          hour,
          count: timeDistribution[hour] || 0,
        }));

        // Average song duration - check if duration data is available
        const { data: durationData } = await supabase
          .from("song_plays")
          .select("duration_ms")
          .not("duration_ms", "is", null);

        const averageSongDuration = durationData?.length
          ? durationData.reduce(
              (sum, item) => sum + (item.duration_ms || 0),
              0
            ) / durationData.length
          : 0;

        setStats({
          totalRevenue,
          totalSongsQueued: totalSongsQueued || 0,
          totalVenues: totalVenues || 0,
          totalSongsPlayed: totalSongsPlayed || 0,
          popularSongs: popularSongsFormatted,
          revenueByVenue: revenueByVenueFormatted,
          venuesByQueueCount,
          songsQueuedOverTime: songsQueuedOverTimeFormatted,
          topGenres,
          queueTimeDistribution,
          averageSongDuration,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };

    fetchStats();
  }, [isAdmin]);

  const exportToCSV = () => {
    if (!stats) return;

    // Prepare comprehensive data for export
    const csvData = [];

    // Add summary metrics
    csvData.push(["PLATFORM SUMMARY"]);
    csvData.push(["Metric", "Value"]);
    csvData.push(["Total Revenue", `${stats.totalRevenue.toFixed(2)} kr`]);
    csvData.push(["Total Songs Queued", stats.totalSongsQueued]);
    csvData.push(["Total Venues", stats.totalVenues]);
    csvData.push(["Total Songs Played", stats.totalSongsPlayed]);
    csvData.push([
      "Average Song Duration (ms)",
      stats.averageSongDuration.toFixed(0),
    ]);
    csvData.push([""]);

    // Revenue by venue
    csvData.push(["REVENUE BY VENUE"]);
    csvData.push(["Venue Name", "Total Revenue"]);
    stats.revenueByVenue.forEach((venue) => {
      csvData.push([venue.venue_name, `${venue.total_revenue.toFixed(2)} kr`]);
    });
    csvData.push([""]);

    // Popular songs
    csvData.push(["POPULAR SONGS"]);
    csvData.push(["Song Name", "Artist Name", "Play Count"]);
    stats.popularSongs.forEach((song) => {
      csvData.push([song.song_name, song.artist_name, song.play_count]);
    });
    csvData.push([""]);

    // Top artists
    csvData.push(["TOP ARTISTS"]);
    csvData.push(["Artist Name", "Song Count"]);
    stats.topGenres.forEach((artist) => {
      csvData.push([artist.artist_name, artist.song_count]);
    });
    csvData.push([""]);

    // Venues by queue count
    csvData.push(["VENUES BY ACTIVITY"]);
    csvData.push(["Venue Name", "Total Songs Played"]);
    stats.venuesByQueueCount.forEach((venue) => {
      csvData.push([venue.venue_name, venue.total_songs_queued]);
    });
    csvData.push([""]);

    // Queue time distribution
    csvData.push(["HOURLY REQUEST DISTRIBUTION"]);
    csvData.push(["Hour (24h)", "Request Count"]);
    stats.queueTimeDistribution.forEach((item) => {
      csvData.push([`${item.hour}:00`, item.count]);
    });
    csvData.push([""]);

    // Songs queued over time
    csvData.push(["SONGS QUEUED OVER TIME (LAST 30 DAYS)"]);
    csvData.push(["Date", "Songs Queued"]);
    stats.songsQueuedOverTime.forEach((item) => {
      csvData.push([item.date, item.count]);
    });

    // Convert to CSV string
    const csvString = csvData
      .map((row) =>
        row
          .map((field) => {
            // Handle fields that might contain commas by wrapping in quotes
            const str = String(field);
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(",")
      )
      .join("\n");

    // Create and download file
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `admin-analytics-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have admin privileges to view this dashboard.
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
    <div className="min-h-screen bg-background mt-20">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Platform-wide analytics and insights
              </p>
              <Badge variant="outline" className="mt-2">
                <Users className="w-4 h-4 mr-1" />
                Admin Access
              </Badge>
            </div>
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="shrink-0"
              disabled={!stats}
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.totalRevenue || 0).toFixed(2)} kr
              </div>
              <p className="text-xs text-muted-foreground">Across all venues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Songs Queued
              </CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalSongsQueued || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Venues
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalVenues || 0}
              </div>
              <p className="text-xs text-muted-foreground">Registered venues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Songs Played
              </CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalSongsPlayed || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total plays</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="popular">Popular Songs</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Venue</CardTitle>
                <CardDescription>
                  Total revenue generated by each venue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats?.revenueByVenue || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="venue_name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `${Number(value).toFixed(2)} kr`,
                        "Revenue",
                      ]}
                    />
                    <Bar dataKey="total_revenue" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Popular Songs</CardTitle>
                  <CardDescription>
                    Songs with the highest play count
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {stats?.popularSongs.map((song, index) => (
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
                          <Badge variant="secondary">
                            {song.play_count} plays
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Artists</CardTitle>
                  <CardDescription>
                    Artists with most songs played
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={stats?.topGenres || []}
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
                        {stats?.topGenres.map((_, index) => (
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
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Song Duration
                  </CardTitle>
                  <Music className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.averageSongDuration
                      ? `${Math.floor(
                          stats.averageSongDuration / 1000 / 60
                        )}:${Math.floor((stats.averageSongDuration / 1000) % 60)
                          .toString()
                          .padStart(2, "0")}`
                      : "0:00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minutes:Seconds
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peak Request Hours</CardTitle>
                  <CardDescription>
                    When songs were requested throughout history (current queue
                    + historical plays)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats?.queueTimeDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [value, "Songs Queued"]}
                        labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Songs Queued Over Time</CardTitle>
                <CardDescription>
                  Queue activity for the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={stats?.songsQueuedOverTime || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => `Date: ${value}`} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Venues by Queue Activity</CardTitle>
                <CardDescription>
                  All venues sorted by total songs queued throughout history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {stats?.venuesByQueueCount.map((venue, index) => (
                      <div
                        key={venue.venue_id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() =>
                          navigate(`/venue-analytics/${venue.venue_id}`)
                        }
                      >
                        <div>
                          <p className="font-medium">{venue.venue_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Click for detailed analytics
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {venue.total_songs_queued}
                          </p>
                          <Badge variant="outline">
                            <List className="w-3 h-3 mr-1" />
                            Rank #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
