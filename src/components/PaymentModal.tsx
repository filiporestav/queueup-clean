import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  preview_url?: string;
}

interface VenueProfile {
  id: string;
  venue_name: string;
  enable_pricing: boolean;
  dynamic_pricing: boolean;
  static_price: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: SpotifyTrack | null;
  venue: VenueProfile | null;
  venueId: string;
  onPaymentSuccess: () => void;
}

export const PaymentModal = ({ 
  isOpen, 
  onClose, 
  track, 
  venue, 
  venueId,
  onPaymentSuccess 
}: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!track || !venue) return;

    setIsProcessing(true);
    try {
      const response = await supabase.functions.invoke('create-song-payment', {
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
        window.open(data.url, '_blank');
        
        toast({
          title: "Betalning krävs",
          description: `Slutför betalningen för att köa "${track.name}"`,
        });
        
        onPaymentSuccess();
        onClose();
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Betalning misslyckades",
        description: "Kunde inte skapa betalningssession. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!track || !venue) return null;

  const price = venue.static_price || 0.99;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Slutför din låtförfrågan</DialogTitle>
          <DialogDescription>
            Betalning krävs för att begära låtar på {venue.venue_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Track Info */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            {track.album.images[0] && (
              <img 
                src={track.album.images[0].url} 
                alt={track.album.name}
                className="w-12 h-12 rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{track.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {track.artists.map(artist => artist.name).join(", ")}
              </p>
            </div>
          </div>

          {/* Price Info */}
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">Pris</span>
            <div className="text-right">
              <Badge variant="secondary" className="text-lg">
                {price.toFixed(2)} kr
              </Badge>
              {venue.dynamic_pricing && (
                <p className="text-xs text-muted-foreground mt-1">
                  Dynamisk prissättning baserad på efterfrågan
                </p>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Betalningsmetoder:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                Apple Pay
              </Badge>
              <Badge variant="outline">
                Swish
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Avbryt
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bearbetar...
              </>
            ) : (
              <>
                <Smartphone className="mr-2 h-4 w-4" />
                Betala {price.toFixed(2)} kr & begär låt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};