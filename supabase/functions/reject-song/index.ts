import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RejectSongRequest {
  queueItemId: string;
  venueId: string;
  rejectionReason?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { queueItemId, venueId, rejectionReason }: RejectSongRequest = await req.json();

    // Get the queue item details
    const { data: queueItem, error: fetchError } = await supabase
      .from('song_queue')
      .select('*')
      .eq('id', queueItemId)
      .eq('venue_id', venueId)
      .single();

    if (fetchError || !queueItem) {
      return new Response(
        JSON.stringify({ error: 'Queue item not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get venue's Spotify credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from('spotify_credentials')
      .select('access_token, refresh_token, token_expires_at, client_id, client_secret')
      .eq('user_id', venueId)
      .single();

    // Get venue name for logging
    const { data: venue, error: venueError } = await supabase
      .from('profiles')
      .select('venue_name')
      .eq('user_id', venueId)
      .single();

    if (credentialsError || !credentials || !credentials.access_token) {
      console.error('Venue not found or no Spotify credentials:', credentialsError);
    } else {
      // Try to remove from Spotify queue (this might not always work depending on Spotify's limitations)
      let accessToken = credentials.access_token;
      let tokenData = null;
      
      // Parse the access_token if it's a JSON string (legacy format)
      if (credentials.access_token && credentials.access_token.startsWith('{')) {
        try {
          tokenData = JSON.parse(credentials.access_token);
          accessToken = tokenData.access_token;
        } catch (e) {
          console.error('Failed to parse access token JSON:', e);
          accessToken = null;
        }
      }

      // Check if token needs refresh
      if (credentials.token_expires_at && new Date(credentials.token_expires_at).getTime() <= Date.now()) {
        if ((credentials.refresh_token || (tokenData && tokenData.refresh_token)) && credentials.client_id && credentials.client_secret) {
          const refreshToken = credentials.refresh_token || (tokenData ? tokenData.refresh_token : null);
          
          const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${btoa(`${credentials.client_id}:${credentials.client_secret}`)}`
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
            }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const expiresAt = new Date(Date.now() + (refreshData.expires_in * 1000));
            
            await supabase
              .from('spotify_credentials')
              .update({ 
                access_token: refreshData.access_token,
                token_expires_at: expiresAt.toISOString(),
                refresh_token: refreshData.refresh_token || refreshToken,
              })
              .eq('user_id', venueId);
              
            accessToken = refreshData.access_token;
          }
        }
      }

      // Note: Spotify API doesn't have a direct "remove from queue" endpoint
      // This is a limitation of Spotify's API - we can only skip to next song
      // For now, we'll just remove from our database queue
      console.log(`Note: Cannot remove "${queueItem.song_name}" from Spotify queue due to API limitations`);
    }

    // Insert into rejected_songs table
    const { error: insertError } = await supabase
      .from('rejected_songs')
      .insert({
        venue_id: venueId,
        song_id: queueItem.song_id,
        song_name: queueItem.song_name,
        artist_name: queueItem.artist_name,
        rejection_reason: rejectionReason || 'Rejected by venue',
        rejected_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Failed to insert into rejected_songs:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to record song rejection' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove from queue
    const { error: deleteError } = await supabase
      .from('song_queue')
      .delete()
      .eq('id', queueItemId)
      .eq('venue_id', venueId);

    if (deleteError) {
      console.error('Failed to remove from queue:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to remove from queue' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Song rejected: ${queueItem.song_name} by ${queueItem.artist_name}. Reason: ${rejectionReason || 'No reason provided'}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `"${queueItem.song_name}" by ${queueItem.artist_name} has been rejected and removed from queue` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reject song error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})