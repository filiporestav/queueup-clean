import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateStatusRequest {
  queueItemId: string;
  status: 'playing' | 'completed';
  venueId: string;
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

    const { queueItemId, status, venueId }: UpdateStatusRequest = await req.json();

    if (status === 'completed') {
      // When a song is completed, move it to song_plays table and remove from queue
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

      // Calculate duration if we have a start time
      let duration_ms = null;
      if (queueItem.started_playing_at) {
        const startTime = new Date(queueItem.started_playing_at);
        const endTime = new Date();
        duration_ms = endTime.getTime() - startTime.getTime();
      }

      // Insert into song_plays table
      const { error: insertError } = await supabase
        .from('song_plays')
        .insert({
          venue_id: venueId,
          song_id: queueItem.song_id,
          song_name: queueItem.song_name,
          artist_name: queueItem.artist_name,
          played_at: new Date().toISOString(),
          duration_ms: duration_ms
        });

      if (insertError) {
        console.error('Failed to insert into song_plays:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to record song play' }),
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

      console.log(`Song completed and moved to plays: ${queueItem.song_name} by ${queueItem.artist_name}`);
    } else {
      // Update the status to 'playing' and set the started_playing_at timestamp
      const updateData: any = { status };
      if (status === 'playing') {
        updateData.started_playing_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('song_queue')
        .update(updateData)
        .eq('id', queueItemId)
        .eq('venue_id', venueId);

      if (updateError) {
        console.error('Failed to update song status:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update song status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Song status updated to ${status}: ${queueItemId}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Song status updated to ${status}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update song status error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})