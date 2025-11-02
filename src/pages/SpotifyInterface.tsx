import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Music,
  Search,
  Plus,
  Minus,
  ShoppingCart,
  X,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VenueQueue } from "@/components/VenueQueue";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  preview_url: string | null;
  explicit: boolean;
}

interface VenueProfile {
  id: string;
  venue_name: string;
  enable_pricing: boolean;
  dynamic_pricing: boolean;
  static_price: number;
  allow_queueing: boolean;
  restrict_to_playlist: boolean;
}

const SpotifyInterface = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const [venue, setVenue] = useState<VenueProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [requestingTrackId, setRequestingTrackId] = useState<string | null>(
    null
  );
  const [playlistTracks, setPlaylistTracks] = useState<SpotifyTrack[]>([]);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [playlistFilter, setPlaylistFilter] = useState("");
  const [basket, setBasket] = useState<SpotifyTrack[]>([]);
  const [requestingAll, setRequestingAll] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (venueId) {
      fetchVenueProfile();
    }
  }, [venueId]);

  useEffect(() => {
    if (venue?.restrict_to_playlist) {
      fetchPlaylistTracks();
    }
  }, [venue?.restrict_to_playlist]);

  const fetchVenueProfile = async () => {
    try {
      // Use the public function to get venue info - this doesn't require authentication
      const { data, error } = await supabase.rpc("get_venue_public_info", {
        venue_uuid: venueId,
      });

      if (error || !data || data.length === 0) {
        console.error("Error fetching venue:", error);
        toast({
          title: "Lokal hittades inte",
          description: "Vi kunde inte hitta denna lokal.",
          variant: "destructive",
        });
      } else {
        // The RPC function returns an array, get the first item
        setVenue(data[0]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistTracks = async () => {
    setLoadingPlaylist(true);
    try {
      const response = await supabase.functions.invoke("get-playlist-tracks", {
        body: { venueId },
      });

      const { data, error } = response;

      if (error) {
        console.error("Error fetching playlist:", error);
        return;
      }

      if (data.tracks) {
        setPlaylistTracks(data.tracks);
      }
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
    } finally {
      setLoadingPlaylist(false);
    }
  };

  // Server-side search handles all credential logic securely

  const searchSpotify = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      // Use server-side search to keep venue credentials secure
      const response = await supabase.functions.invoke("spotify-search", {
        body: {
          venueId,
          query: searchQuery,
        },
      });

      const { data, error } = response;

      if (error) {
        throw error;
      }

      if (data.tracks) {
        setSearchResults(data.tracks);
      } else {
        toast({
          title: "Sökning misslyckades",
          description: "Kunde inte söka efter låtar",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching Spotify:", error);
      toast({
        title: "Sökfel",
        description: "Ett fel uppstod vid sökning",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const addToBasket = (track: SpotifyTrack) => {
    if (basket.find((t) => t.id === track.id)) {
      toast({
        title: "Redan tillagd",
        description: "Denna låt finns redan i korgen",
        variant: "destructive",
      });
      return;
    }
    setBasket([...basket, track]);
    toast({
      title: "Tillagd i korg",
      description: `${track.name} tillagd`,
    });
  };

  const removeFromBasket = (trackId: string) => {
    setBasket(basket.filter((t) => t.id !== trackId));
    toast({
      title: "Borttagen från korg",
      description: "Låten har tagits bort från korgen",
    });
  };

  const clearBasket = () => {
    setBasket([]);
  };

  const requestAllSongs = async () => {
    if (!venueId || basket.length === 0) return;

    // Check if venue allows queueing
    if (venue && !venue.allow_queueing) {
      toast({
        title: "Kö avstängd",
        description:
          "Denna lokal tar inte emot låtförfrågningar för tillfället.",
        variant: "destructive",
      });
      return;
    }

    setRequestingAll(true);
    try {
      // Check if venue requires payment
      if (venue?.enable_pricing) {
        // For paid songs, we need to handle payment for each song
        toast({
          title: "Betalning krävs",
          description:
            "Betalning krävs för varje låt. Vänligen begär låtar en i taget.",
          variant: "destructive",
        });
        setRequestingAll(false);
        return;
      }

      // Request all songs in parallel for free venues
      const requests = basket.map((track) =>
        supabase.functions.invoke("queue-song", {
          body: {
            venueId,
            trackId: track.id,
            trackName: track.name,
            artistNames: track.artists.map((artist) => artist.name),
          },
        })
      );

      const results = await Promise.all(requests);

      const successful = results.filter((r) => r.data?.success).length;
      const failed = results.length - successful;

      // Log any failures for debugging
      results.forEach((r, idx) => {
        if (!r.data?.success) {
          console.error(
            `Failed to queue song ${basket[idx].name}:`,
            r.error || r.data
          );
        }
      });

      if (successful > 0) {
        toast({
          title: "Låtar begärda",
          description: `${successful} låt${
            successful > 1 ? "ar" : ""
          } tillagda i kön${failed > 0 ? `. ${failed} misslyckades.` : ""}`,
        });
        clearBasket();
      } else {
        const firstError =
          results[0]?.data?.error ||
          results[0]?.error?.message ||
          "Kunde inte begära låtarna";
        toast({
          title: "Förfrågan misslyckades",
          description: firstError,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting songs:", error);
      toast({
        title: "Förfrågan misslyckades",
        description: "Kunde inte begära låtarna",
        variant: "destructive",
      });
    } finally {
      setRequestingAll(false);
    }
  };

  const requestSong = async (track: SpotifyTrack) => {
    if (!venueId) return;

    // Check if venue allows queueing
    if (venue && !venue.allow_queueing) {
      toast({
        title: "Kö avstängd",
        description:
          "Denna lokal tar inte emot låtförfrågningar för tillfället.",
        variant: "destructive",
      });
      return;
    }

    setRequestingTrackId(track.id);
    try {
      // Check if venue requires payment
      if (venue?.enable_pricing) {
        await handlePaymentRequest(track);
      } else {
        // Free song request
        const response = await supabase.functions.invoke("queue-song", {
          body: {
            venueId,
            trackId: track.id,
            trackName: track.name,
            artistNames: track.artists.map((artist) => artist.name),
          },
        });

        const { data, error } = response;

        // Handle both error object and error in data
        if (error || !data?.success) {
          const errorMessage =
            data?.error || error?.message || "Kunde inte begära låt";
          console.error("Queue song error:", { error, data, errorMessage });
          toast({
            title: "Förfrågan misslyckades",
            description: errorMessage,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Låt begärd",
          description: data.message,
        });
      }
    } catch (error) {
      console.error("Error requesting song:", error);
      toast({
        title: "Förfrågan misslyckades",
        description: "Kunde inte begära låt",
        variant: "destructive",
      });
    } finally {
      setRequestingTrackId(null);
    }
  };

  const handlePaymentRequest = async (track: SpotifyTrack) => {
    try {
      const response = await supabase.functions.invoke("create-song-payment", {
        body: {
          venueId,
          trackId: track.id,
          trackName: track.name,
          artistNames: track.artists.map((artist) => artist.name),
        },
      });

      const { data, error } = response;

      if (error) {
        throw error;
      }

      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, "_blank");

        toast({
          title: "Betalning krävs",
          description: `Slutför betalning för "${track.name}"`,
        });
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  };

  // Handle successful payment redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");

    if (paymentStatus === "success") {
      const trackId = urlParams.get("track");
      if (trackId) {
        toast({
          title: "Betalning lyckades",
          description: "Din låtförfrågan har lagts till i kön",
        });
        // Clean up URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    } else if (paymentStatus === "cancelled") {
      toast({
        title: "Betalning avbruten",
        description: "Din betalning avbröts",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>Lokal hittades inte</CardTitle>
            <CardDescription>Vi kunde inte hitta denna lokal.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Remove the check for spotify_client_id since we now use server-side search
  // The server-side function will handle credential validation

  const filteredPlaylistTracks = playlistTracks.filter((track) => {
    if (!playlistFilter.trim()) return true;
    const searchTerm = playlistFilter.toLowerCase();
    return (
      track.name.toLowerCase().includes(searchTerm) ||
      track.artists.some((artist) =>
        artist.name.toLowerCase().includes(searchTerm)
      ) ||
      track.album.name.toLowerCase().includes(searchTerm)
    );
  });

  const isInBasket = (trackId: string) => basket.some((t) => t.id === trackId);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 mt-20 text-center relative">
            <h1 className="text-3xl font-bold mb-2">{venue.venue_name}</h1>
            <p className="text-muted-foreground">Begär låt - Gratis</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Search and request */}
            <div className="space-y-6">
              {venue.restrict_to_playlist ? (
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Music className="h-6 w-6 text-primary" />
                      Tillgängliga låtar ({playlistTracks.length})
                    </CardTitle>
                    <CardDescription>
                      Denna lokal accepterar endast låtar från denna spellista
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loadingPlaylist ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2">
                          {filteredPlaylistTracks.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Inga låtar hittades
                            </p>
                          ) : (
                            filteredPlaylistTracks.map((track) => (
                              <div
                                key={track.id}
                                className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                              >
                                {track.album.images[0] && (
                                  <img
                                    src={track.album.images[0].url}
                                    alt={track.album.name}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate">
                                    {track.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {track.artists
                                      .map((a) => a.name)
                                      .join(", ")}
                                  </p>
                                </div>
                                {isInBasket(track.id) ? (
                                  <Button
                                    onClick={() => removeFromBasket(track.id)}
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Tooltip open={showHelp}>
                                    <TooltipTrigger asChild>
                                      <Button
                                        onClick={() => addToBasket(track)}
                                        size="sm"
                                        variant="default"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                  </Tooltip>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-primary/20 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Search className="h-6 w-6 text-primary" />
                        Sök musik
                      </CardTitle>
                      <CardDescription>
                        Skriv låt eller artist du vill höra
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Tooltip open={showHelp}>
                          <TooltipTrigger asChild>
                            <div className="flex-1 relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                              <Label htmlFor="search" className="sr-only">
                                Sök efter låtar
                              </Label>
                              <Input
                                id="search"
                                placeholder="Sök efter låtar, artister..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) =>
                                  e.key === "Enter" && searchSpotify()
                                }
                                className="pl-10 h-12 text-base"
                              />
                            </div>
                          </TooltipTrigger>
                        </Tooltip>
                        <Button
                          onClick={searchSpotify}
                          disabled={searching || !searchQuery.trim()}
                          size="lg"
                          className="px-6"
                        >
                          {searching ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            "Sök"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {searchResults.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Music className="h-5 w-5" />
                          Sökresultat
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {searchResults.map((track) => (
                            <div
                              key={track.id}
                              className="flex items-center gap-4 p-4 border border-border rounded-lg"
                            >
                              {track.album.images[0] && (
                                <img
                                  src={track.album.images[0].url}
                                  alt={track.album.name}
                                  className="w-16 h-16 rounded-md object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">
                                  {track.name}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {track.artists.map((a) => a.name).join(", ")}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {track.album.name}
                                </p>
                              </div>
                              {isInBasket(track.id) ? (
                                <Button
                                  onClick={() => removeFromBasket(track.id)}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Minus className="h-4 w-4 mr-2" />
                                  Ta bort
                                </Button>
                              ) : (
                                <Tooltip open={showHelp}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => addToBasket(track)}
                                      size="sm"
                                      variant="default"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Lägg till
                                    </Button>
                                  </TooltipTrigger>
                                </Tooltip>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Right column - Queue */}
            <div>
              <Tooltip open={showHelp}>
                <TooltipTrigger asChild>
                  <div>
                    <VenueQueue
                      venueId={venueId}
                      venueAllowsQueueing={venue.allow_queueing}
                    />
                  </div>
                </TooltipTrigger>
              </Tooltip>
            </div>
          </div>

          {/* Floating Basket */}
          {basket.length > 0 && (
            <Tooltip open={showHelp}>
              <TooltipTrigger asChild>
                <div className="fixed bottom-6 right-6 z-50">
                  <Card className="w-80 shadow-2xl border-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Korg
                          <Badge variant="secondary">{basket.length}</Badge>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearBasket}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ScrollArea className="h-48">
                        <div className="space-y-2 pr-3">
                          {basket.map((track) => (
                            <div
                              key={track.id}
                              className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg group"
                            >
                              {track.album.images[0] && (
                                <img
                                  src={track.album.images[0].url}
                                  alt={track.album.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {track.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {track.artists.map((a) => a.name).join(", ")}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromBasket(track.id)}
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <Button
                        onClick={requestAllSongs}
                        disabled={requestingAll}
                        className="w-full"
                        size="lg"
                      >
                        {requestingAll ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Begär...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Begär alla ({basket.length})
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TooltipTrigger>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SpotifyInterface;
