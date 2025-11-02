import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactRequest {
  venue_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  physical_address?: string;
  current_music_system?: string;
  customer_count_estimate?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: ContactRequest = await req.json();

    // Validate required fields
    if (!requestData.venue_name || !requestData.contact_name || !requestData.email) {
      return new Response(
        JSON.stringify({ error: 'Venue name, contact name, and email are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Insert contact request into database
    const { data, error } = await supabase
      .from('contact_requests')
      .insert({
        venue_name: requestData.venue_name,
        contact_name: requestData.contact_name,
        email: requestData.email,
        phone: requestData.phone,
        physical_address: requestData.physical_address,
        current_music_system: requestData.current_music_system,
        customer_count_estimate: requestData.customer_count_estimate,
        message: requestData.message,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting contact request:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit contact request' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Contact request submitted successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact request submitted successfully',
        id: data.id 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in contact-request function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);