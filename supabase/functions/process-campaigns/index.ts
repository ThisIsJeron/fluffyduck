
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const picaApiKey = Deno.env.get('PICA_SECRET_KEY');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { campaignId } = await req.json();
    console.log('Processing campaign:', campaignId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found or error fetching campaign');
    }

    console.log('Campaign details:', campaign);
    console.log('Executing Pica command...');

    // Execute Pica command
    const response = await fetch('https://api.picakages.com/v1/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${picaApiKey}`
      },
      body: JSON.stringify({
        command: `post the following message to email: ${campaign.caption} with subject ${campaign.title} to fluffyduck0222@gmail.com`,
        type: 'natural_language'
      })
    });

    const result = await response.json();
    console.log('Pica execution result:', result);

    if (!response.ok) {
      throw new Error(result.message || 'Failed to execute Pica command');
    }

    return new Response(
      JSON.stringify({ 
        message: 'Campaign processed successfully',
        result: result
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
});
