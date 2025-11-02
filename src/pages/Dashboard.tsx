import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  BarChart3,
  DollarSign,
  Upload,
  Music,
  RefreshCw,
  Play,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import QRCodeGenerator from "@/components/QRCodeGenerator";

interface Profile {
  id: string;
  venue_name: string;
  physical_address: string;
  email: string;
  enable_pricing: boolean;
  dynamic_pricing: boolean;
  static_price: number;
  logo_url: string | null;
  allow_queueing: boolean;
  is_admin: boolean;
  created_at: string;
}

interface SpotifyCredentials {
  client_id: string | null;
  client_secret: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  playlist_id: string | null;
  restrict_to_playlist: boolean;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [spotifyCredentials, setSpotifyCredentials] =
    useState<SpotifyCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSpotifyCredentials = async () => {
      try {
        const { data, error } = await supabase.rpc(
          "get_user_spotify_credentials"
        );

        if (error) {
          console.error("Error fetching Spotify credentials:", error);
          return;
        }

        setSpotifyCredentials(data?.[0] || null);
      } catch (error) {
        console.error("Error fetching Spotify credentials:", error);
      }
    };

    fetchProfile();
    fetchSpotifyCredentials();
  }, [user, navigate]);

  // Auto sync Spotify playback every 10 seconds
  useEffect(() => {
    if (!spotifyCredentials?.access_token || !user) return;

    const autoSync = async () => {
      try {
        const response = await supabase.functions.invoke(
          "sync-spotify-playback",
          {
            body: { venueId: user.id },
          }
        );

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
  }, [spotifyCredentials?.access_token, user]);

  const connectSpotify = () => {
    if (!spotifyCredentials?.client_id) {
      alert(
        "Please configure your Spotify Client ID and Secret first in your venue settings."
      );
      return;
    }

    const redirectUri = `https://gfxostamwwzyvjsarwaa.supabase.co/functions/v1/spotify-callback`;
    const scope = "user-modify-playback-state user-read-playback-state";
    const spotifyAuthUrl =
      `https://accounts.spotify.com/authorize?` +
      `client_id=${spotifyCredentials.client_id}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${encodeURIComponent(user?.id || "")}`;

    // Open popup and handle window focus to refresh page when connection is complete
    const popup = window.open(
      spotifyAuthUrl,
      "spotify-auth",
      "width=600,height=700"
    );

    // Check periodically if popup is closed to refresh the page
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        // Refresh profile data after connection
        window.location.reload();
      }
    }, 1000);
  };

  const disconnectSpotify = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("spotify_credentials")
        .update({
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error disconnecting Spotify:", error);
        toast({
          title: "Error",
          description: "Failed to disconnect Spotify account.",
          variant: "destructive",
        });
      } else {
        // Refresh credentials to get updated state with preserved client_id/client_secret
        const { data } = await supabase.rpc("get_user_spotify_credentials");
        setSpotifyCredentials(data?.[0] || null);
        toast({
          title: "Disconnected",
          description: "Successfully disconnected from Spotify.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An error occurred while disconnecting from Spotify.",
        variant: "destructive",
      });
    }
  };

  const updatePricingSetting = async (
    field: string,
    value: boolean | number | string
  ) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating pricing setting:", error);
      } else {
        setProfile({ ...profile, [field]: value });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || !event.target.files[0] || !user) return;

    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/logo.${fileExt}`;

    try {
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("venue-logos")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading logo:", uploadError);
        return;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from("venue-logos")
        .getPublicUrl(fileName);

      // Update the profile with the logo URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ logo_url: data.publicUrl })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
      } else {
        setProfile({ ...profile!, logo_url: data.publicUrl });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const updateSpotifySettings = async (
    field: string,
    value: boolean | string
  ) => {
    if (!user) return;

    try {
      const updates: any = {};
      if (field === "restrict_to_playlist") updates.restrict_playlist = value;
      if (field === "playlist_id") updates.playlist_id = value;
      if (field === "client_id") updates.client_id = value;
      if (field === "client_secret") updates.client_secret = value;

      const { error } = await supabase.rpc(
        "upsert_spotify_credentials",
        updates
      );

      if (error) {
        console.error("RPC Error updating Spotify settings:", error);
        toast({
          title: "Error",
          description: `Failed to update Spotify settings: ${
            error.message || error.details || "Unknown error"
          }`,
          variant: "destructive",
        });
      } else {
        // Update local state
        setSpotifyCredentials({
          ...spotifyCredentials!,
          [field]: value,
        });
        toast({
          title: "Settings updated",
          description: "Spotify settings have been updated successfully",
        });
      }
    } catch (error) {
      console.error("Catch Error:", error);
      toast({
        title: "Error",
        description: `Unexpected error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  const syncSpotifyPlayback = async () => {
    if (!user || !spotifyCredentials?.access_token) {
      toast({
        title: "Spotify Not Connected",
        description: "Please connect to Spotify first to sync playback status.",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    try {
      const response = await supabase.functions.invoke(
        "sync-spotify-playback",
        {
          body: { venueId: user.id },
        }
      );

      const { data, error } = response;

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Playback Synced",
          description:
            data.message || "Successfully synced with Spotify playback.",
        });
      } else {
        toast({
          title: "Sync Failed",
          description: data.error || "Failed to sync with Spotify.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error syncing playback:", error);
      toast({
        title: "Sync Error",
        description: "An error occurred while syncing with Spotify.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Profil hittades inte</CardTitle>
            <CardDescription>
              Vi kunde inte hitta din profil. Vänligen logga in igen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")}>
              Tillbaka till inloggning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mt-20">
      <div className="container mx-auto max-w-6xl px-4 pt-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">{profile.venue_name}</h1>
          <p className="text-muted-foreground">Hantera din lokal</p>
        </div>

        {/* Quick Status Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {/* Spotify Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    spotifyCredentials?.access_token
                      ? "bg-green-500/10"
                      : "bg-red-500/10"
                  )}
                >
                  <Music
                    className={cn(
                      "h-5 w-5",
                      spotifyCredentials?.access_token
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Spotify</p>
                  <p className="text-xs text-muted-foreground">
                    {spotifyCredentials?.access_token
                      ? "Ansluten"
                      : "Ej ansluten"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Queue Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    profile.allow_queueing
                      ? "bg-green-500/10"
                      : "bg-amber-500/10"
                  )}
                >
                  <Clock
                    className={cn(
                      "h-5 w-5",
                      profile.allow_queueing
                        ? "text-green-600 dark:text-green-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Kö</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.allow_queueing ? "Aktiv" : "Inaktiv"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Prissättning</p>
                  <p className="text-xs text-muted-foreground">Kommer snart</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Link */}
          <Card
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate("/analytics")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Analys</p>
                  <p className="text-xs text-muted-foreground">Visa data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Quick Actions - Most Common Settings */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Snabbinställningar</CardTitle>
              <CardDescription>
                De vanligaste inställningarna för din lokal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="font-medium text-base">
                    Tillåt låtförfrågningar
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Låt gäster begära låtar via QR-kod
                  </p>
                </div>
                <Switch
                  checked={profile.allow_queueing}
                  onCheckedChange={(checked) =>
                    updatePricingSetting("allow_queueing", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="font-medium text-base">
                    Begränsa till spellista
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Endast låtar från din Spotify-spellista
                  </p>
                </div>
                <Switch
                  checked={spotifyCredentials?.restrict_to_playlist || false}
                  onCheckedChange={(checked) =>
                    updateSpotifySettings("restrict_to_playlist", checked)
                  }
                />
              </div>

              {spotifyCredentials?.restrict_to_playlist && (
                <div className="space-y-2 pt-2 pl-4">
                  <Label className="text-sm">Spotify Playlist ID</Label>
                  <Input
                    value={spotifyCredentials?.playlist_id || ""}
                    onChange={(e) =>
                      updateSpotifySettings("playlist_id", e.target.value)
                    }
                    placeholder="t.ex., 37i9dQZF1DXcBWIGoYBM5M"
                  />
                  <p className="text-xs text-muted-foreground">
                    Hitta ID i din Spotify-URL: spotify.com/playlist/[ID]
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Venue & QR Code - Compact */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Venue Info - Compact */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Lokalinfo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Namn</p>
                  <p className="text-sm font-medium">{profile.venue_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Adress</p>
                  <p className="text-sm font-medium">
                    {profile.physical_address}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-post</p>
                  <p className="text-sm font-medium truncate">
                    {profile.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* QR Code - Compact */}
            <div className="md:col-span-2">
              <QRCodeGenerator
                venueId={user?.id || ""}
                venueName={profile.venue_name}
                logoUrl={profile.logo_url || undefined}
              />
            </div>
          </div>

          {/* Spotify Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Spotify-integration</CardTitle>
              <CardDescription>
                Konfigurera och anslut ditt Spotify-konto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Credentials */}
                <div className="space-y-4">
                  <div>
                    <Label>Client ID</Label>
                    <Input
                      value={spotifyCredentials?.client_id || ""}
                      onChange={(e) =>
                        updateSpotifySettings("client_id", e.target.value)
                      }
                      placeholder="Ange Spotify Client ID"
                    />
                  </div>
                  <div>
                    <Label>Client Secret</Label>
                    <Input
                      type="password"
                      value={spotifyCredentials?.client_secret || ""}
                      onChange={(e) =>
                        updateSpotifySettings("client_secret", e.target.value)
                      }
                      placeholder="Ange Spotify Client Secret"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hämta credentials från{" "}
                    <a
                      href="https://developer.spotify.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Spotify Developer Dashboard
                    </a>
                  </p>
                </div>

                {/* Connection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {spotifyCredentials?.access_token ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {spotifyCredentials?.access_token
                          ? "Ansluten"
                          : "Ej ansluten"}
                      </span>
                    </div>
                  </div>

                  {!spotifyCredentials?.access_token ? (
                    <Button
                      onClick={connectSpotify}
                      disabled={
                        !spotifyCredentials?.client_id ||
                        !spotifyCredentials?.client_secret
                      }
                      className="w-full"
                    >
                      Anslut Spotify
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={connectSpotify}
                        variant="outline"
                        className="w-full"
                      >
                        Byt konto
                      </Button>
                      <Button
                        onClick={disconnectSpotify}
                        variant="destructive"
                        className="w-full"
                      >
                        Koppla från
                      </Button>
                    </div>
                  )}

                  {spotifyCredentials?.access_token && (
                    <>
                      <Separator />
                      <Button
                        onClick={syncSpotifyPlayback}
                        disabled={syncing}
                        variant="secondary"
                        className="w-full"
                      >
                        {syncing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Synkar...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Synka nu
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Auto-synk var 10:e sekund
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Ytterligare inställningar
              </CardTitle>
              <CardDescription>Logotyp och övriga funktioner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logotyp</Label>
                <div className="flex items-center gap-4">
                  {profile.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt="Venue logo"
                      className="w-16 h-16 object-contain bg-white border-2 rounded-lg p-2"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted border-2 border-dashed rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {profile.logo_url ? "Anpassad logotyp" : "Ingen logotyp"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fyrkantig bild rekommenderas
                    </p>
                  </div>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
              </div>

              <Separator />

              <div className="opacity-50">
                <Label className="text-muted-foreground">Prissättning</Label>
                <p className="text-xs text-muted-foreground">Kommer snart</p>
                <Badge variant="outline" className="mt-2">
                  Beta
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
