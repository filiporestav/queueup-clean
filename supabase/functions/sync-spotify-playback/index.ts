import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SpotifyCurrentlyPlaying {
  item: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    duration_ms: number;
  };
  is_playing: boolean;
  progress_ms: number;
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

    const { venueId }: { venueId: string } = await req.json();

    // Get venue's Spotify credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from('spotify_credentials')
      .select('access_token, refresh_token, token_expires_at, client_id, client_secret')
      .eq('user_id', venueId)
      .single();

    if (credentialsError || !credentials || !credentials.access_token) {
      return new Response(
        JSON.stringify({ error: 'Venue not found or Spotify not connected' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get venue name for logging
    const { data: venue, error: venueError } = await supabase
      .from('profiles')
      .select('venue_name')
      .eq('user_id', venueId)
      .single();

    const venueName = venue?.venue_name || 'Unknown Venue';

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

    // Check if token needs refresh
    if (credentials.token_expires_at && new Date(credentials.token_expires_at).getTime() <= Date.now()) {
      if ((credentials.refresh_token || (tokenData && tokenData.refresh_token)) && credentials.client_id && credentials.client_secret) {
        console.log('Token expired, refreshing...');
        
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
          
          const { error: updateError } = await supabase
            .from('spotify_credentials')
            .update({ 
              access_token: refreshData.access_token,
              token_expires_at: expiresAt.toISOString(),
              // Keep the existing refresh_token if not provided in response
              refresh_token: refreshData.refresh_token || refreshToken,
            })
            .eq('user_id', venueId);
            
          if (updateError) {
            console.error('Failed to update token:', updateError);
          } else {
            console.log('Token refreshed successfully');
          }
            
          accessToken = refreshData.access_token;
        } else {
          const errorData = await refreshResponse.json().catch(() => ({}));
          console.error('Token refresh failed:', errorData);
          return new Response(
            JSON.stringify({ error: 'Token refresh failed' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Token expired and cannot refresh - missing credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get currently playing track from Spotify
    const currentlyPlayingResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    let currentTrack: SpotifyCurrentlyPlaying | null = null;
    
    if (currentlyPlayingResponse.status === 200) {
      currentTrack = await currentlyPlayingResponse.json();
    } else if (currentlyPlayingResponse.status !== 204) {
      // 204 means no track is playing, which is fine
      console.error('Error fetching currently playing:', currentlyPlayingResponse.status);
    }

    // Get current queue from database
    const { data: queueItems, error: queueError } = await supabase
      .from('song_queue')
      .select('*')
      .eq('venue_id', venueId)
      .in('status', ['pending', 'playing'])
      .order('position', { ascending: true });

    if (queueError) {
      console.error('Error fetching queue:', queueError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch queue' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updates = [];

    if (currentTrack && currentTrack.is_playing && currentTrack.item) {
      const currentSpotifyTrackId = currentTrack.item.id;
      
      // Find if this track is in our queue
      const queueItem = queueItems?.find(item => item.song_id === currentSpotifyTrackId);
      
      if (queueItem && queueItem.status === 'pending') {
        // Update this song to "playing" and set started_playing_at timestamp
        const { error: updateError } = await supabase
          .from('song_queue')
          .update({ 
            status: 'playing',
            started_playing_at: new Date().toISOString()
          })
          .eq('id', queueItem.id);

        if (!updateError) {
          updates.push(`Song "${queueItem.song_name}" marked as playing`);
        }
      }

      // Check if any songs marked as "playing" are no longer the current track
      const playingSongs = queueItems?.filter(item => 
        item.status === 'playing' && item.song_id !== currentSpotifyTrackId
      ) || [];

      for (const playingSong of playingSongs) {
        // Calculate duration if we have a start time
        let duration_ms = null;
        if (playingSong.started_playing_at) {
          const startTime = new Date(playingSong.started_playing_at);
          const endTime = new Date();
          duration_ms = endTime.getTime() - startTime.getTime();
        }

        // Move completed song to song_plays and remove from queue
        const { error: insertError } = await supabase
          .from('song_plays')
          .insert({
            venue_id: venueId,
            song_id: playingSong.song_id,
            song_name: playingSong.song_name,
            artist_name: playingSong.artist_name,
            played_at: new Date().toISOString(),
            duration_ms: duration_ms
          });

        if (!insertError) {
          const { error: deleteError } = await supabase
            .from('song_queue')
            .delete()
            .eq('id', playingSong.id);

          if (!deleteError) {
            updates.push(`Song "${playingSong.song_name}" completed and moved to plays`);
          }
        }
      }
    } else {
      // No song is currently playing, mark all "playing" songs as completed
      const playingSongs = queueItems?.filter(item => item.status === 'playing') || [];
      
      for (const playingSong of playingSongs) {
        // Calculate duration if we have a start time
        let duration_ms = null;
        if (playingSong.started_playing_at) {
          const startTime = new Date(playingSong.started_playing_at);
          const endTime = new Date();
          duration_ms = endTime.getTime() - startTime.getTime();
        }

        const { error: insertError } = await supabase
          .from('song_plays')
          .insert({
            venue_id: venueId,
            song_id: playingSong.song_id,
            song_name: playingSong.song_name,
            artist_name: playingSong.artist_name,
            played_at: new Date().toISOString(),
            duration_ms: duration_ms
          });

        if (!insertError) {
          const { error: deleteError } = await supabase
            .from('song_queue')
            .delete()
            .eq('id', playingSong.id);

          if (!deleteError) {
            updates.push(`Song "${playingSong.song_name}" completed (no longer playing)`);
          }
        }
      }
    }

    console.log(`Spotify sync for ${venueName}:`, updates.join(', ') || 'No updates needed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        updates,
        currentTrack: currentTrack ? {
          name: currentTrack.item?.name,
          artist: currentTrack.item?.artists.map(a => a.name).join(', '),
          isPlaying: currentTrack.is_playing
        } : null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Spotify sync error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
