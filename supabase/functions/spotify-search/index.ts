import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      spotify_credentials: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          client_secret: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          playlist_id: string | null
          restrict_to_playlist: boolean
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { venueId, query } = await req.json()

    if (!venueId || !query) {
      return new Response(
        JSON.stringify({ error: 'Missing venueId or query parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Searching for venue:', venueId, 'with query:', query)

    // Get venue's Spotify credentials and playlist settings
    const { data: credentials, error: credentialsError } = await supabaseClient
      .from('spotify_credentials')
      .select('client_id, client_secret, restrict_to_playlist, playlist_id')
      .eq('user_id', venueId)
      .single()

    if (credentialsError || !credentials) {
      console.error('Venue credentials not found:', credentialsError)
      return new Response(
        JSON.stringify({ error: 'Venue Spotify credentials not configured' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!credentials.client_id || !credentials.client_secret) {
      console.error('Venue Spotify credentials not configured')
      return new Response(
        JSON.stringify({ error: 'Venue Spotify credentials incomplete' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Spotify access token using venue's credentials
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Failed to get Spotify token:', await tokenResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with Spotify' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    let searchResponse;
    let searchData;

    // Check if venue restricts to playlist
    if (credentials.restrict_to_playlist && credentials.playlist_id) {
      // Get playlist tracks
      const playlistResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${credentials.playlist_id}/tracks?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!playlistResponse.ok) {
        console.error('Failed to fetch playlist tracks:', await playlistResponse.text())
        return new Response(
          JSON.stringify({ error: 'Failed to fetch playlist tracks' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const playlistData = await playlistResponse.json();
      const playlistTracks = playlistData.items.map((item: any) => item.track).filter((track: any) => track);
      
      // Filter playlist tracks by search query
      const filteredTracks = playlistTracks.filter((track: any) => {
        const trackName = track.name.toLowerCase();
        const artistNames = track.artists.map((artist: any) => artist.name.toLowerCase()).join(' ');
        const albumName = track.album.name.toLowerCase();
        const searchTerm = query.toLowerCase();
        
        return trackName.includes(searchTerm) || 
               artistNames.includes(searchTerm) || 
               albumName.includes(searchTerm);
      });

      searchData = { tracks: { items: filteredTracks } };
    } else {
      // Regular Spotify search
      searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!searchResponse.ok) {
        console.error('Spotify search failed:', await searchResponse.text())
        return new Response(
          JSON.stringify({ error: 'Spotify search failed' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      searchData = await searchResponse.json();
    }

    
    // Filter out explicit content
    const filteredTracks = searchData.tracks.items.filter((track: any) => !track.explicit)
    
    const searchType = credentials.restrict_to_playlist && credentials.playlist_id ? 'playlist' : 'general';
    console.log(`${searchType} search successful, found`, searchData.tracks.items.length, 'tracks,', filteredTracks.length, 'after filtering explicit content')

    return new Response(
      JSON.stringify({ tracks: filteredTracks }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in spotify-search:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})