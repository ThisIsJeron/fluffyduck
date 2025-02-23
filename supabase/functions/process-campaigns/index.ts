
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface Campaign {
  id: string;
  title: string;
  description: string;
  platforms: string[];
  media_url: string;
  caption: string;
  hashtags: string[];
}

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

    if (campaignError) {
      throw campaignError;
    }

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    console.log('Campaign details:', campaign);

    // Send email notification
    if (campaign.platforms.includes('email')) {
      try {
        const emailResponse = await resend.emails.send({
          from: 'Social Campaign Manager <onboarding@resend.dev>',
          to: ['fluffyduck0222@gmail.com'], // Replace with actual recipient
          subject: campaign.title,
          html: `
            <h1>${campaign.title}</h1>
            <p>${campaign.description}</p>
            ${campaign.media_url ? `<img src="${campaign.media_url}" alt="Campaign Media" style="max-width: 600px;" />` : ''}
            <p>${campaign.caption}</p>
            ${campaign.hashtags ? `<p>${campaign.hashtags.join(' ')}</p>` : ''}
          `,
        });

        console.log('Email sent successfully:', emailResponse);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        throw emailError;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Campaign processed successfully',
        campaign: campaign.title
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
})
