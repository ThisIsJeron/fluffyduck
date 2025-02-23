
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

async function executePicaCommand(title: string, caption: string) {
  try {
    const PICA_API_KEY = Deno.env.get("PICA_SECRET_KEY");
    console.log('Checking for PICA_SECRET_KEY:', PICA_API_KEY ? 'Present' : 'Missing');
    
    if (!PICA_API_KEY) {
      throw new Error("PICA_SECRET_KEY is not set in environment variables");
    }

    console.log('Making request to Pica API...');
    const response = await fetch("https://api.picahq.com/v1/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PICA_API_KEY}`
      },
      body: JSON.stringify({
        command: `send email to fluffyduck0222@gmail.com with subject "${title}" and content "${caption}" using gmail`
      })
    });

    console.log('Pica API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pica API error response:', errorText);
      throw new Error(`Pica API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Pica API success response:', result);
    return result;
  } catch (error) {
    console.error('Error in executePicaCommand:', error);
    throw error;
  }
}

serve(async (req) => {
  // IMPORTANT: Handle CORS preflight requests first
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Request received:', req.method);
    const { campaign } = await req.json();
    console.log('Received campaign data:', campaign);

    if (!campaign || !campaign.title || !campaign.caption) {
      throw new Error('Missing required campaign data');
    }

    // Execute the Pica command
    console.log('Executing Pica command for campaign:', campaign.title);
    const result = await executePicaCommand(campaign.title, campaign.caption);

    return new Response(
      JSON.stringify({ 
        success: true, 
        result: `Successfully processed campaign: ${campaign.title}`,
        pica_response: result
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  } catch (error: any) {
    console.error('Error in request handler:', error);
    
    // Send a more detailed error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack
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
