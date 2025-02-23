
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

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

    // Process each campaign
    for (const campaign of campaigns ?? []) {
      console.log(`Processing campaign: ${campaign.title}`)
      
      // Log the campaign details for testing
      console.log('Campaign details:', {
        id: campaign.id,
        title: campaign.title,
        platforms: campaign.platforms,
        startDate: campaign.start_date,
        endDate: campaign.end_date
      })

      // Here we'll just log the platforms that would be triggered
      // Replace these logs with actual integration calls when ready
      if (campaign.platforms) {
        for (const platform of campaign.platforms) {
          console.log(`Would trigger ${platform} integration for campaign: ${campaign.title}`)
          // Add actual integration calls here when ready
          // Example:
          // if (platform === 'email') await sendEmailCampaign(campaign)
          // if (platform === 'instagram') await postToInstagram(campaign)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Campaign processing completed',
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
