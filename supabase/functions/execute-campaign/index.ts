
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Pica } from "@picahq/ai";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

async function execute(message: string) {
  try {
    const pica = new Pica(Deno.env.get("PICA_SECRET_KEY")!);
    const system = await pica.generateSystemPrompt();
    
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system,
      prompt: message,
      tools: { ...pica.oneTool },
      maxSteps: 10,
    });

    return text;
  } catch (error) {
    console.error('Error in execute function:', error);
    throw error;
  }
}

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

    const message = `send email to fluffyduck0222@gmail.com with subject ${campaign.title} and content ${campaign.caption} using gmail`;
    console.log('Executing with message:', message);
    
    const result = await execute(message);
    console.log('Execution result:', result);

    return new Response(
      JSON.stringify({ success: true, result }),
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
