import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { imageUrl, projectId } = await req.json();
    
    if (!imageUrl || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing imageUrl or projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing photo for project:', projectId);

    // Get project details for context
    const { data: project } = await supabase
      .from('projects')
      .select('name, job_type, address')
      .eq('id', projectId)
      .single();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Analyze image with AI
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert in restoration and construction photo analysis. Analyze job site photos for a ${project?.job_type || 'restoration'} project and provide structured metadata.

Your analysis should identify:
1. Category: damage, equipment, before, after, progress, documentation
2. Room Type: kitchen, bathroom, bedroom, living room, basement, attic, exterior, roof, garage, office, commercial space, etc.
3. Damage Type (if applicable): water damage, fire damage, smoke damage, mold, structural damage, storm damage, impact damage, etc.
4. Description: A clear, professional description of what's shown (2-3 sentences)
5. Tags: 5-8 relevant keywords for searchability

Return ONLY a JSON object with these exact keys: category, room_type, damage_type, description, tags (array), confidence (0-1).`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this photo from project: ${project?.name || 'Restoration Project'} at ${project?.address || 'job site'}. Provide detailed metadata.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_photo',
              description: 'Extract structured metadata from a restoration job site photo',
              parameters: {
                type: 'object',
                properties: {
                  category: {
                    type: 'string',
                    enum: ['damage', 'equipment', 'before', 'after', 'progress', 'documentation', 'safety', 'crew']
                  },
                  room_type: {
                    type: 'string',
                    description: 'The type of room or area shown'
                  },
                  damage_type: {
                    type: 'string',
                    description: 'Type of damage if applicable, null otherwise'
                  },
                  description: {
                    type: 'string',
                    description: 'Professional description of the photo (2-3 sentences)'
                  },
                  tags: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of 5-8 relevant keywords'
                  },
                  confidence: {
                    type: 'number',
                    description: 'Confidence score between 0 and 1'
                  }
                },
                required: ['category', 'description', 'tags', 'confidence']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'analyze_photo' } }
      }),
    });

    if (!analysisResponse.ok) {
      if (analysisResponse.status === 429) {
        console.error('AI rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'AI service rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (analysisResponse.status === 402) {
        console.error('AI credits exhausted');
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await analysisResponse.text();
      console.error('AI analysis error:', analysisResponse.status, errorText);
      throw new Error('Failed to analyze photo with AI');
    }

    const analysisData = await analysisResponse.json();
    console.log('AI response:', JSON.stringify(analysisData, null, 2));

    // Extract tool call result
    const toolCall = analysisData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      console.error('No tool call in response:', analysisData);
      throw new Error('Invalid AI response format');
    }

    const metadata = JSON.parse(toolCall.function.arguments);
    console.log('Extracted metadata:', metadata);

    return new Response(
      JSON.stringify({
        ai_category: metadata.category,
        ai_room_type: metadata.room_type || null,
        ai_damage_type: metadata.damage_type || null,
        ai_description: metadata.description,
        ai_tags: metadata.tags,
        ai_confidence: metadata.confidence,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error analyzing photo:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to analyze photo' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
