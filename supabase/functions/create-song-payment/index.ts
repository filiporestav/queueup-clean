import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  venueId: string;
  trackId: string;
  trackName: string;
  artistNames: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Payment function started");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Parsing request body");
    const { venueId, trackId, trackName, artistNames }: PaymentRequest = await req.json();
    console.log("Request data:", { venueId, trackId, trackName, artistNames });

    // Get venue pricing settings
    console.log("Looking up venue:", venueId);
    const { data: venue, error: venueError } = await supabase
      .from("profiles")
      .select("venue_name, enable_pricing, dynamic_pricing, static_price")
      .eq("user_id", venueId)
      .single();

    console.log("Venue lookup result:", { venue, venueError });
    if (venueError || !venue) {
      console.log("Venue not found or error:", venueError);
      return new Response(
        JSON.stringify({ error: "Venue not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!venue.enable_pricing) {
      console.log("Venue pricing not enabled");
      return new Response(
        JSON.stringify({ error: "Venue does not require payment for song requests" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate price
    let price = venue.static_price || 0.99;
    console.log("Base price:", price);
    
    if (venue.dynamic_pricing) {
      // Get current queue count for dynamic pricing
      const { count: queueCount } = await supabase
        .from("song_queue")
        .select("*", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .eq("status", "pending");

      // Dynamic pricing: base price + (queue length * 0.25)
      price = venue.static_price + (queueCount || 0) * 0.25;
      price = Math.min(price, venue.static_price * 3); // Cap at 3x base price
      console.log("Dynamic price calculated:", price);
    }

    console.log("Creating Stripe session...");
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create payment session with Apple Pay and Swish for Swedish market
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "link"], // Link enables Apple Pay, card for Swish
      line_items: [
        {
          price_data: {
            currency: "sek",
            product_data: {
              name: `Låtförfrågan: ${trackName}`,
              description: `Begär "${trackName}" av ${artistNames.join(", ")} på ${venue.venue_name}`,
            },
            unit_amount: Math.round(price * 100), // Convert to öre (SEK cents)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/venue/${venueId}?payment=success&track=${trackId}`,
      cancel_url: `${req.headers.get("origin")}/venue/${venueId}?payment=cancelled`,
      metadata: {
        venueId,
        trackId,
        trackName,
        artistNames: artistNames.join(", "),
      },
      // Configure for Swedish market
      locale: "sv",
    });
    console.log("Stripe session created:", session.id);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id,
        price: price,
        currency: "SEK"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create payment session" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});