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

    const { venueId } = await req.json()

    if (!venueId) {
      return new Response(
        JSON.stringify({ error: 'Missing venueId parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Fetching playlist tracks for venue:', venueId)

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

    if (!credentials.restrict_to_playlist || !credentials.playlist_id) {
      return new Response(
        JSON.stringify({ error: 'Venue does not restrict to playlist' }),
        { 
          status: 400, 
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

    // Clean playlist ID (remove query parameters if present)
    const cleanPlaylistId = credentials.playlist_id.split('?')[0]

    // Fetch all playlist tracks (handling pagination)
    let allTracks: any[] = []
    let nextUrl = `https://api.spotify.com/v1/playlists/${cleanPlaylistId}/tracks?limit=50`

    while (nextUrl) {
      const playlistResponse = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

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

      const playlistData = await playlistResponse.json()
      
      // Check if items exist and is an array
      if (!playlistData.items || !Array.isArray(playlistData.items)) {
        console.error('Invalid playlist data structure:', playlistData)
        return new Response(
          JSON.stringify({ error: 'Invalid playlist data received from Spotify' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const tracks = playlistData.items
        .map((item: any) => item.track)
        .filter((track: any) => track && !track.explicit) // Filter out null tracks and explicit content
      
      allTracks = [...allTracks, ...tracks]
      nextUrl = playlistData.next
    }

    console.log(`Fetched ${allTracks.length} tracks from playlist`)

    return new Response(
      JSON.stringify({ tracks: allTracks }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in get-playlist-tracks:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
