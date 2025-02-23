
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { Pica } from 'npm:@picahq/ai'
import { generateText } from 'npm:ai'
import { openai } from 'npm:@ai-sdk/openai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  platforms: string[];
  start_date: string;
  end_date: string;
  media_url: string;
  caption: string;
}

async function executeEmailCampaign(campaign: Campaign) {
  const pica = new Pica(Deno.env.get('PICA_SECRET_KEY') ?? '');
  const system = await pica.generateSystemPrompt();

  // Format the email content to match the preview layout
  const emailContent = `
${campaign.title}

${campaign.caption}

${campaign.media_url ? `[Image included: ${campaign.media_url}]` : ''}

Click here to learn more`;

  // Construct email message using campaign details and matching preview layout
  const message = `send email to fluffyduck0222@gmail.com using gmail with:
    subject: ${campaign.title}
    content: ${emailContent}
    ${campaign.media_url ? `attachment: ${campaign.media_url}` : ''}
    format: html
    style: 
    - Make the title large and bold
    - Center align any images
    - Add padding around content
    - Use a clean, professional layout
    - Add a blue button for "Click here to learn more"
  `;

  console.log('Generating email with Pica:', message);

  const { text } = await generateText({
    model: openai('gpt-4o'),
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
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    console.log('Starting campaign processing...')

    // Get current campaigns that need to be processed
    const { data: campaigns, error } = await supabaseClient
      .from('selected_campaigns')
      .select('*')
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())

    if (error) {
      console.error('Error fetching campaigns:', error)
      throw error
    }

    console.log(`Found ${campaigns?.length ?? 0} campaigns to process`)

    const processedEmails = [];
    const otherPlatforms = [];

    // Process each campaign
    for (const campaign of campaigns ?? []) {
      console.log(`Processing campaign: ${campaign.title}`)
      
      if (campaign.platforms) {
        for (const platform of campaign.platforms) {
          if (platform === 'email') {
            try {
              console.log(`Processing email campaign: ${campaign.title}`);
              const result = await executeEmailCampaign(campaign);
              processedEmails.push({
                campaign: campaign.title,
                result
              });
            } catch (err) {
              console.error(`Error processing email campaign ${campaign.title}:`, err);
              processedEmails.push({
                campaign: campaign.title,
                error: err.message
              });
            }
          } else {
            // Log other platforms for future implementation
            otherPlatforms.push(`${platform} for campaign: ${campaign.title}`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Campaign processing completed',
        processedEmails,
        otherPlatforms,
        processed: campaigns?.length ?? 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in process-campaigns function:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
