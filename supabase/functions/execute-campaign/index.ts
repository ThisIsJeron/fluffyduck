
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // IMPORTANT: Handle CORS preflight requests first
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204, // Successful preflight should return 204
      headers: corsHeaders
    });
  }

  try {
    const { campaign } = await req.json();
    console.log('Received campaign:', campaign);

    if (!campaign || !campaign.title || !campaign.caption) {
      throw new Error('Missing required campaign data');
    }

    // For now, we'll just log the campaign data and return a success response
    // We can implement the actual email sending logic later
    console.log('Campaign to process:', {
      title: campaign.title,
      caption: campaign.caption
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        result: `Successfully processed campaign: ${campaign.title}`
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  } catch (error: any) {
    console.error('Error in handler:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
});
