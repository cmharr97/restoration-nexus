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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's auth context
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { projectName, projectAddress, lossType, description, imageUrls } = await req.json();
    
    if (!projectName || !description || !lossType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build the messages array with system prompt and user content
    const messages: any[] = [
      {
        role: 'system',
        content: `You are an expert insurance restoration estimator specializing in ${lossType} damage. 
        Generate detailed reconstruction scope notes following industry standards.
        
        Your response MUST be valid JSON with this exact structure:
        {
          "scopeSummary": "2-4 sentence overview of the project",
          "detailedScope": "Comprehensive scope with specific tasks, materials, and methods",
          "opJustification": "Detailed O&P justification explaining why overhead and profit apply",
          "materialList": [
            {"item": "material name", "quantity": number, "unit": "unit", "estimatedCost": number}
          ],
          "estimatedCost": number,
          "estimatedDurationDays": number,
          "tradesRequired": ["trade1", "trade2"]
        }
        
        O&P Justification should mention: multiple trades coordination, permits/inspections required, project management complexity, specialized equipment needs.
        Be specific with quantities and costs. Use realistic construction pricing.`
      }
    ];

    // Build user content array with text and images
    const userContent: any[] = [
      {
        type: 'text',
        text: `Project: ${projectName}
${projectAddress ? `Address: ${projectAddress}` : ''}
Loss Type: ${lossType}

Description: ${description}

Generate a comprehensive reconstruction scope with material list and O&P justification.`
      }
    ];

    // Add images if provided
    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        userContent.push({
          type: 'image_url',
          image_url: { url }
        });
      }
    }

    messages.push({
      role: 'user',
      content: userContent
    });

    console.log('Calling Lovable AI Gateway for user:', user.id);
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI Response received for user:', user.id);

    // Parse the JSON response from AI
    let parsedScope;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       content.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedScope = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      throw new Error('AI returned invalid JSON format');
    }

    return new Response(
      JSON.stringify({
        scopeSummary: parsedScope.scopeSummary,
        detailedScope: parsedScope.detailedScope,
        opJustification: parsedScope.opJustification,
        materialList: parsedScope.materialList || [],
        estimatedCost: parsedScope.estimatedCost,
        estimatedDurationDays: parsedScope.estimatedDurationDays,
        tradesRequired: parsedScope.tradesRequired || [],
        userId: user.id, // Include user ID for client-side storage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-scope function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
