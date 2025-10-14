import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    console.log('[generate-variations] Started at', new Date().toISOString());

    const { originalPrompt, aiAnalysis, proSettings } = await req.json();
    
    if (!originalPrompt) {
      throw new Error('Original prompt is required');
    }

    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured');
    }

    // Generate 5 variations with different approaches
    const approaches = [
      {
        name: 'More Dramatic',
        instruction: 'Increase intensity by 30%, add more dramatic lighting, stronger shadows, and heightened emotional impact. Make it CINEMATIC and POWERFUL.'
      },
      {
        name: 'Faster Pace',
        instruction: 'Reduce duration by 40%, add quick cuts, rapid camera movements, and energetic pacing. Make it DYNAMIC and FAST.'
      },
      {
        name: 'Cinematic Wide',
        instruction: 'Change to wide-angle shot, add epic scale, sweeping camera movements, and grand composition. Make it EPIC and VAST.'
      },
      {
        name: 'Minimalist',
        instruction: 'Simplify to essential elements, remove excessive details, clean composition, subtle effects. Make it CLEAN and FOCUSED.'
      },
      {
        name: 'Experimental',
        instruction: 'Use unconventional angles, unusual color grading, abstract compositions, and creative camera work. Make it ARTISTIC and UNIQUE.'
      }
    ];

    console.log('[generate-variations] Generating', approaches.length, 'variations...');

    const variations = [];

    for (const approach of approaches) {
      const systemPrompt = `You are a creative VFX director generating prompt variations.

Original Prompt: "${originalPrompt}"

Variation Approach: ${approach.name}
Instruction: ${approach.instruction}

Create a NEW prompt that follows the approach instruction while maintaining the core subject and effect.
Return ONLY the new prompt text, no explanations, no JSON.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: systemPrompt }]
            }],
            generationConfig: {
              temperature: 0.9, // Higher creativity for variations
              maxOutputTokens: 500
            }
          })
        }
      );

      if (!response.ok) {
        console.error(`[generate-variations] Error for ${approach.name}:`, response.status);
        continue;
      }

      const data = await response.json();
      const variationPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (variationPrompt) {
        variations.push({
          approach: approach.name,
          prompt: variationPrompt,
          changes: [approach.instruction.split('.')[0]]
        });
        console.log(`[generate-variations] ✓ ${approach.name} generated`);
      }
    }

    const responseTime = Date.now() - startTime;
    console.log('[generate-variations] Success, generated', variations.length, 'variations in', responseTime, 'ms');

    return new Response(
      JSON.stringify({ variations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[generate-variations] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
