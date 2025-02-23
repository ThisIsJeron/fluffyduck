
import { Pica } from "@picahq/ai";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const pica = new Pica(process.env.PICA_SECRET_KEY!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function execute(message: string) {
  const system = await pica.generateSystemPrompt();
  
  const { text } = await generateText({
    model: openai("gpt-4o"),
    system,
    prompt: message,
    tools: { ...pica.oneTool },
    maxSteps: 10,
  });

  return text;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign } = await req.json();
    console.log('Executing campaign:', campaign);

    const message = `send email to fluffyduck0222@gmail.com with subject ${campaign.title} and content ${campaign.caption} using gmail`;
    const result = await execute(message);

    console.log('Execution result:', result);
    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
