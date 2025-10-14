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
    console.log('[deep-analyze-image] Started at', new Date().toISOString());

    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured');
    }

    console.log('[deep-analyze-image] Performing ultra-detailed analysis...');

    const systemPrompt = `You are an expert cinematographer and VFX artist analyzing images for scene recreation. Extract EVERY detail across 7 categories. Be exhaustive and specific.

Return ONLY valid JSON (no markdown, no explanations) with this exact structure:

{
  "hair": {
    "color": "specific color with highlights/lowlights",
    "style": "detailed style description",
    "length": "exact length",
    "texture": "texture description",
    "condition": "health/shine description"
  },
  "accessories": {
    "jewelry": ["item 1", "item 2"],
    "glasses": "description or null",
    "headwear": "description or null",
    "other": ["accessory 1", "accessory 2"]
  },
  "textures": {
    "skin": "skin texture and tone details",
    "fabrics": ["fabric 1 - texture", "fabric 2 - texture"],
    "materials": ["material 1 - finish", "material 2 - finish"],
    "surfaces": "background/environment surface textures"
  },
  "wardrobe": {
    "upper": "detailed upper garment description",
    "lower": "detailed lower garment description",
    "shoes": "footwear description",
    "layers": 0,
    "style": "fashion style category",
    "colors": ["color1", "color2"],
    "fit": "fit description"
  },
  "makeup": {
    "foundation": "coverage and finish",
    "eyes": "eyeshadow/liner/mascara details",
    "lips": "lip color and finish",
    "special": "special effects makeup or null",
    "intensity": "natural/minimal/moderate/dramatic"
  },
  "props": {
    "handHeld": "items in hands or null",
    "nearby": ["prop 1", "prop 2"],
    "stage": "stage/set description",
    "furniture": "furniture items or null",
    "environment": "environmental context"
  },
  "advancedLighting": {
    "keyLight": {
      "direction": "precise angle from camera",
      "intensity": "soft/medium/hard",
      "color": "color temperature description",
      "temperature": "Kelvin value estimate"
    },
    "fillLight": {
      "direction": "precise angle from camera",
      "intensity": "low/medium/high",
      "color": "color description"
    },
    "rimLight": {
      "present": true/false,
      "direction": "angle if present",
      "color": "color if present"
    },
    "shadows": "shadow quality and direction",
    "mood": "overall lighting mood",
    "timeOfDay": "apparent time of day"
  },
  "sceneContext": {
    "location": "indoor/outdoor/studio type",
    "weather": "weather conditions if visible",
    "atmosphere": "atmospheric quality",
    "depth": "depth of field description"
  }
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: imageUrl.startsWith('data:image/png') ? 'image/png' : 
                             imageUrl.startsWith('data:image/jpeg') ? 'image/jpeg' :
                             imageUrl.startsWith('data:image/jpg') ? 'image/jpeg' : 'image/jpeg',
                  data: imageUrl.split(',')[1]
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[deep-analyze-image] Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('[deep-analyze-image] Raw AI response length:', analysisText.length);

    // Parse JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const deepAnalysis = JSON.parse(jsonMatch[0]);

    // Validate required fields
    const requiredCategories = ['hair', 'accessories', 'textures', 'wardrobe', 'makeup', 'props', 'advancedLighting', 'sceneContext'];
    const missingCategories = requiredCategories.filter(cat => !deepAnalysis[cat]);
    
    if (missingCategories.length > 0) {
      console.warn('[deep-analyze-image] Missing categories:', missingCategories);
    }

    const responseTime = Date.now() - startTime;
    console.log('[deep-analyze-image] Success in', responseTime, 'ms');

    return new Response(
      JSON.stringify({ deepAnalysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[deep-analyze-image] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
