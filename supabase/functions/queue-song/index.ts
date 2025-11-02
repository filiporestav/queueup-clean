import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QueueSongRequest {
  venueId: string;
  trackId: string;
  trackName: string;
  artistNames: string[];
  paymentSessionId?: string; // Optional for paid requests
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

    const { venueId, trackId, trackName, artistNames, paymentSessionId }: QueueSongRequest = await req.json();

    // Get venue's pricing settings
    const { data: venue, error: venueError } = await supabase
      .from('profiles')
      .select('venue_name, enable_pricing')
      .eq('user_id', venueId)
      .single();

    if (venueError || !venue) {
      console.error('Venue not found:', venueError);
      return new Response(
        JSON.stringify({ error: 'Venue not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get venue's Spotify credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from('spotify_credentials')
      .select('access_token, refresh_token, token_expires_at, client_id, client_secret')
      .eq('user_id', venueId)
      .single();

    if (credentialsError || !credentials || !credentials.access_token) {
      return new Response(
        JSON.stringify({ error: 'Venue has not connected Spotify' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!credentials.client_id || !credentials.client_secret) {
      return new Response(
        JSON.stringify({ error: 'Spotify client credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if payment is required but not provided
    if (venue.enable_pricing && !paymentSessionId) {
      return new Response(
        JSON.stringify({ error: 'Payment required for song requests at this venue' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = credentials.access_token;
    let tokenData = null;
    
    // Parse the access_token if it's a JSON string (legacy format)
    if (credentials.access_token && credentials.access_token.startsWith('{')) {
      try {
        tokenData = JSON.parse(credentials.access_token);
        accessToken = tokenData.access_token;
      } catch (e) {
        console.error('Failed to parse access token JSON:', e);
        return new Response(
          JSON.stringify({ error: 'Invalid token format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Helper to refresh token when needed
    let didTokenRefresh = false;
    const attemptRefresh = async (reason: string) => {
      const refreshToken = credentials.refresh_token || (tokenData ? tokenData.refresh_token : null);
      if (!refreshToken) return false;
      console.log(`Refreshing Spotify token (${reason})...`);
      const resp = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${credentials.client_id}:${credentials.client_secret}`)}`
        },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error('Token refresh failed:', err);
        return false;
      }
      const data = await resp.json();
      const expiresAt = new Date(Date.now() + (data.expires_in * 1000));
      const { error: updateError } = await supabase
        .from('spotify_credentials')
        .update({
          access_token: data.access_token,
          token_expires_at: expiresAt.toISOString(),
          refresh_token: data.refresh_token || refreshToken,
        })
        .eq('user_id', venueId);
      if (updateError) console.error('Failed to update token in database:', updateError);
      accessToken = data.access_token;
      didTokenRefresh = true;
      console.log('Token refreshed successfully');
      return true;
    };

    // Proactive refresh: if missing expiry or expiring within 60s
    const expiresAtMs = credentials.token_expires_at ? new Date(credentials.token_expires_at).getTime() : 0;
    const shouldProactivelyRefresh = !credentials.token_expires_at || (expiresAtMs - 60000) <= Date.now();
    if (shouldProactivelyRefresh) {
      await attemptRefresh('proactive');
    }

    // Check if track is explicit before queueing
    const fetchTrack = async () =>
      await fetch(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

    let trackResponse = await fetchTrack();
    if (trackResponse.status === 401 && !didTokenRefresh) {
      const refreshedForTrack = await attemptRefresh('track-details-401');
      if (refreshedForTrack) trackResponse = await fetchTrack();
    }

    if (trackResponse.ok) {
      const trackData = await trackResponse.json();
      if (trackData.explicit) {
        return new Response(
          JSON.stringify({ error: 'Explicit content is not allowed at this venue' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.error('Failed to fetch track details for explicit check, status:', trackResponse.status);
      // Continue without explicit check rather than blocking all songs
    }

    // Queue the song using venue's token (with retry on 401)
    const fetchQueue = async () =>
      await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${trackId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
    let queueResponse = await fetchQueue();
    if (queueResponse.status === 401 && !didTokenRefresh) {
      const refreshedForQueue = await attemptRefresh('queue-401');
      if (refreshedForQueue) queueResponse = await fetchQueue();
    }

    if (queueResponse.ok) {
      // Get current queue position
      const { data: queueData } = await supabase
        .from('song_queue')
        .select('position')
        .eq('venue_id', venueId)
        .order('position', { ascending: false })
        .limit(1);
      
      const nextPosition = (queueData?.[0]?.position || 0) + 1;

      // Insert into database for analytics
      const { error: insertError } = await supabase
        .from('song_queue')
        .insert({
          venue_id: venueId,
          song_id: trackId,
          song_name: trackName,
          artist_name: artistNames.join(', '),
          position: nextPosition,
          status: 'pending'
        });

      if (insertError) {
        console.error('Failed to insert into song_queue:', insertError);
      }

      console.log(`Song queued: ${trackName} by ${artistNames.join(', ')} for venue ${venue.venue_name}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `"${trackName}" by ${artistNames.join(', ')} queued successfully!` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (queueResponse.status === 404) {
      // Try to automatically select an available device and retry
      try {
        const fetchDevices = async () =>
          await fetch('https://api.spotify.com/v1/me/player/devices', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
        let devicesResp = await fetchDevices();
        if (devicesResp.status === 401 && !didTokenRefresh) {
          const refreshed = await attemptRefresh('devices-401');
          if (refreshed) devicesResp = await fetchDevices();
        }
        if (devicesResp.ok) {
          const devicesData = await devicesResp.json();
          const devices = (devicesData as any).devices || [];
          const target = devices.find((d: any) => d.is_active) || devices[0];
          if (target?.id) {
            const doTransfer = async () =>
              await fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ device_ids: [target.id], play: false }),
              });
            let transferResp = await doTransfer();
            if (transferResp.status === 401 && !didTokenRefresh) {
              const refreshed2 = await attemptRefresh('transfer-401');
              if (refreshed2) transferResp = await doTransfer();
            }
            if (transferResp.status === 204) {
              // Retry queueing after transferring playback
              queueResponse = await fetchQueue();
              if (queueResponse.ok) {
                // Duplicate success path to avoid refactor of larger section
                const { data: queueData } = await supabase
                  .from('song_queue')
                  .select('position')
                  .eq('venue_id', venueId)
                  .order('position', { ascending: false })
                  .limit(1);
                const nextPosition = (queueData?.[0]?.position || 0) + 1;
                const { error: insertError } = await supabase
                  .from('song_queue')
                  .insert({
                    venue_id: venueId,
                    song_id: trackId,
                    song_name: trackName,
                    artist_name: artistNames.join(', '),
                    position: nextPosition,
                    status: 'pending'
                  });
                if (insertError) {
                  console.error('Failed to insert into song_queue:', insertError);
                }
                console.log(`Song queued after device transfer: ${trackName} by ${artistNames.join(', ')} for venue ${venue.venue_name}`);
                return new Response(
                  JSON.stringify({ success: true, message: `"${trackName}" by ${artistNames.join(', ')} queued successfully!` }),
                  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }
            }
          }
        }
      } catch (e) {
        console.error('Device activation fallback error:', e);
      }
      return new Response(
        JSON.stringify({ error: 'No active Spotify device found for venue' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (queueResponse.status === 403) {
      return new Response(
        JSON.stringify({ error: 'Spotify Premium required for venue account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const errorData = await queueResponse.json().catch(() => ({}));
      console.error('Spotify queue error:', errorData);
      return new Response(
        JSON.stringify({ error: errorData.error?.message || 'Failed to queue song' }),
        { status: queueResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Queue song error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
