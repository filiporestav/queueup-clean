import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // This will contain the user_id
    const error = url.searchParams.get('error');

    if (error) {
      console.error('Spotify OAuth error:', error);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Spotify Connection Failed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f5f5f5;">
          <div style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #e74c3c; margin-bottom: 20px;">Connection Failed</h2>
            <p style="color: #666; margin-bottom: 30px;">There was an error connecting to Spotify: ${error}</p>
            <button onclick="window.close()" style="background-color: #1db954; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-size: 16px;">Close Window</button>
          </div>
        </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    if (!code || !state) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Request</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f5f5f5;">
          <div style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #e74c3c; margin-bottom: 20px;">Invalid Request</h2>
            <p style="color: #666; margin-bottom: 30px;">Missing authorization code or user information.</p>
            <button onclick="window.close()" style="background-color: #1db954; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-size: 16px;">Close Window</button>
          </div>
        </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get venue profile and Spotify credentials
    const { data: venue, error: venueError } = await supabase
      .from('profiles')
      .select('venue_name')
      .eq('user_id', state)
      .single();

    const { data: credentials, error: credentialsError } = await supabase
      .from('spotify_credentials')
      .select('client_id, client_secret')
      .eq('user_id', state)
      .single();

    if (venueError || !venue) {
      console.error('Venue not found:', venueError);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Venue Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f5f5f5;">
          <div style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #e74c3c; margin-bottom: 20px;">Venue Not Found</h2>
            <p style="color: #666; margin-bottom: 30px;">Could not find venue information.</p>
            <button onclick="window.close()" style="background-color: #1db954; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-size: 16px;">Close Window</button>
          </div>
        </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    if (!credentials?.client_id || !credentials?.client_secret) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Spotify Configuration Missing</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f5f5f5;">
          <div style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #e74c3c; margin-bottom: 20px;">Configuration Missing</h2>
            <p style="color: #666; margin-bottom: 30px;">Spotify client ID or secret is not configured for this venue.</p>
            <button onclick="window.close()" style="background-color: #1db954; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-size: 16px;">Close Window</button>
          </div>
        </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    // Exchange authorization code for access token
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/spotify-callback`;
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${credentials.client_id}:${credentials.client_secret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Token Exchange Failed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f5f5f5;">
          <div style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #e74c3c; margin-bottom: 20px;">Connection Failed</h2>
            <p style="color: #666; margin-bottom: 30px;">Failed to exchange authorization code for access token.</p>
            <button onclick="window.close()" style="background-color: #1db954; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-size: 16px;">Close Window</button>
          </div>
        </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    const tokenData = await tokenResponse.json();
    
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

    const { error: updateError } = await supabase
      .from('spotify_credentials')
      .update({ 
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: expiresAt.toISOString(),
      })
      .eq('user_id', state);

    if (updateError) {
      console.error('Failed to update venue token:', updateError);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Database Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f5f5f5;">
          <div style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #e74c3c; margin-bottom: 20px;">Database Error</h2>
            <p style="color: #666; margin-bottom: 30px;">Failed to save Spotify connection.</p>
            <button onclick="window.close()" style="background-color: #1db954; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-size: 16px;">Close Window</button>
          </div>
        </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    // Success response
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spotify Connected Successfully</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f5f5f5;">
        <div style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="font-size: 60px; margin-bottom: 20px;">🎵</div>
          <h2 style="color: #1db954; margin-bottom: 20px;">Successfully Connected!</h2>
          <p style="color: #666; margin-bottom: 20px;">Your venue "${venue.venue_name}" has been connected to Spotify.</p>
          <p style="color: #888; font-size: 14px; margin-bottom: 30px;">You can now close this window and return to your dashboard.</p>
          <button onclick="window.close()" style="background-color: #1db954; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-size: 16px;">Close Window</button>
          <script>
            // Auto-close after 3 seconds
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </div>
      </body>
      </html>
    `, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Spotify callback error:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f5f5f5;">
        <div style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #e74c3c; margin-bottom: 20px;">Server Error</h2>
          <p style="color: #666; margin-bottom: 30px;">An unexpected error occurred.</p>
          <button onclick="window.close()" style="background-color: #1db954; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-size: 16px;">Close Window</button>
        </div>
      </body>
      </html>
    `, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });
  }
});