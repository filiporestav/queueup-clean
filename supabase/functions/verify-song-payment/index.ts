import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  sessionId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { sessionId }: VerifyPaymentRequest = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { venueId, trackId, trackName, artistNames } = session.metadata || {};

    if (!venueId || !trackId || !trackName || !artistNames) {
      return new Response(
        JSON.stringify({ error: "Invalid payment session metadata" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Now queue the song since payment is verified
    const queueResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/queue-song`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        venueId,
        trackId,
        trackName,
        artistNames: artistNames.split(", "),
        paymentSessionId: sessionId,
      }),
    });

    const queueResult = await queueResponse.json();

    if (!queueResponse.ok) {
      return new Response(
        JSON.stringify({ error: queueResult.error || "Failed to queue song after payment" }),
        { status: queueResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record the payment in venue revenue
    const amount = (session.amount_total || 0) / 100; // Convert from cents
    await supabase.from("venue_revenue").insert({
      venue_id: venueId,
      amount: amount,
      currency: session.currency?.toUpperCase() || "SEK",
      source: "song_request",
      description: `Payment for "${trackName}" by ${artistNames}`,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `"${trackName}" by ${artistNames} queued successfully after payment!`,
        amount: amount,
        currency: session.currency?.toUpperCase() || "SEK"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to verify payment" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});