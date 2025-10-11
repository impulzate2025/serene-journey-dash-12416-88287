/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 🔧 INTELLIGENT PROMPT ENHANCER
async function enhancePromptIntelligently(originalPrompt: string, proSettings: any, shotType: string, cameraAngle: string, cameraMovement: string, lensType: string, lightingSetup: string, apiKey: string): Promise<string> {
  console.log("🚀 Starting intelligent enhancement...");
  console.log("📋 Enhancement parameters:");
  console.log("- Shot Type:", shotType);
  console.log("- Camera Angle:", cameraAngle);  
  console.log("- Movement:", cameraMovement);
  console.log("- Lens:", lensType);
  console.log("- Advanced Instructions:", proSettings.optimizationInstructions);
  
  try {
    // Build enhancement instructions
    let instructions = "Rewrite this video prompt by naturally integrating these changes:\n\n";
    
    if (proSettings.shotType && proSettings.shotType !== 'medium') {
      instructions += `- Change camera framing to: ${shotType}\n`;
    }
    
    if (proSettings.cameraAngle && proSettings.cameraAngle !== 'high-angle') {
      instructions += `- Change camera angle to: ${cameraAngle}\n`;
    }
    
    if (proSettings.cameraMovement && proSettings.cameraMovement !== 'dolly-in') {
      instructions += `- Change camera movement to: ${cameraMovement}\n`;
    }
    
    if (proSettings.lensType) {
      instructions += `- Use lens: ${lensType}\n`;
    }
    
    if (proSettings.optimizationInstructions) {
      instructions += `- 🚨 ADVANCED INSTRUCTIONS (ABSOLUTE PRIORITY): ${proSettings.optimizationInstructions}\n`;
      instructions += `- This OVERRIDES all other camera movement settings\n`;
    }

    instructions += `\n🚨 CRITICAL RULES 🚨
- DO NOT start with "Here's a..." or any introduction
- Write as ONE continuous paragraph
- Keep word count around 250 words
- If Advanced Instructions mention "360 orbit", camera MUST do complete 360-degree orbital movement
- Preserve any timing mentioned (5 seconds = 5 seconds)
- Start immediately with scene description`;

    const systemPrompt = `You are a prompt rewriter. Your ONLY job is to rewrite the prompt with the specified changes.

🚨 FORBIDDEN - INSTANT FAILURE 🚨
❌ "Here's a cinematic VFX prompt..."
❌ "**Prompt:**"
❌ "**Shot Description:**"
❌ Any headers or introductions

✅ REQUIRED FORMAT ✅
Start IMMEDIATELY with: "A [shot type] at [camera angle] captures..."

🚨 MANDATORY CHANGES 🚨
- Shot Type: MUST change to specified type
- Camera Angle: MUST change to specified angle  
- Camera Movement: MUST change to specified movement
- Advanced Instructions: OVERRIDE everything else

EXAMPLE:
Input: "A medium shot at eye-level..."
Output: "A wide shot at bird's eye view captures a stylish man, camera executing complete 360-degree orbital movement..."

NO INTRODUCTIONS. NO HEADERS. START WITH THE SCENE.`;

    const userPrompt = `REWRITE TASK:
${instructions}

ORIGINAL PROMPT:
${originalPrompt}

🚨 CRITICAL INSTRUCTIONS 🚨
- Your response MUST start with "A ${shotType} at ${cameraAngle} captures..."
- DO NOT write "Here's a..." or any introduction
- Change "mid-shot" to "${shotType}"
- Change camera angle to "${cameraAngle}"
- Change camera movement to include "${proSettings.optimizationInstructions || cameraMovement}"
- Write as ONE paragraph, no sections

REWRITE NOW:`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.05, // Ultra low for maximum compliance
      }),
    });

    if (!response.ok) {
      throw new Error(`Enhancement failed: ${response.status}`);
    }

    const data = await response.json();
    const enhancedPrompt = data.choices?.[0]?.message?.content;

    if (enhancedPrompt) {
      console.log("✅ Intelligent enhancement successful");
      return enhancedPrompt;
    } else {
      throw new Error("No enhanced prompt generated");
    }
    
  } catch (error) {
    console.error("Enhancement failed, using fallback:", error);
    return applyProModeEnhancements(originalPrompt, proSettings, shotType, cameraAngle, cameraMovement, lensType, lightingSetup);
  }
}

// 🎬 PRO MODE POST-PROCESSOR (FALLBACK)
function applyProModeEnhancements(originalPrompt: string, proSettings: any, shotType: string, cameraAngle: string, cameraMovement: string, lensType: string, lightingSetup: string): string {
  console.log("🔧 Enhancing prompt with Pro parameters...");
  
  // Build Pro enhancement section
  let proEnhancements = `\n\n🎬 PRO MODE CINEMATOGRAPHY:\n`;
  
  // Camera specifications
  proEnhancements += `CAMERA SETUP: ${shotType} at ${cameraAngle} angle using ${lensType}.\n`;
  
  // Movement override if special instructions
  if (proSettings.optimizationInstructions && 
      (proSettings.optimizationInstructions.includes('360 orbit') || 
       proSettings.optimizationInstructions.includes('drone shot'))) {
    proEnhancements += `CAMERA MOVEMENT: Execute complete 360-degree orbital drone shot around subject.\n`;
  } else {
    proEnhancements += `CAMERA MOVEMENT: ${cameraMovement} throughout the sequence.\n`;
  }
  
  // Lighting setup
  proEnhancements += `LIGHTING: ${lightingSetup} with ${proSettings.keyLight || 'above-right'} key light direction.\n`;
  
  // VFX specifications
  proEnhancements += `VFX COVERAGE: Apply effect to ${proSettings.coverage || 'entire-body'} at ${proSettings.intensity || 85}% intensity.\n`;
  
  // Technical specs
  proEnhancements += `TECHNICAL: ${proSettings.particleType || 'dust'} particles, ${proSettings.artisticStyle || 'cinematic'} style, ${proSettings.mood || 'dramatic'} mood.\n`;
  
  // Advanced instructions (user comments)
  if (proSettings.optimizationInstructions) {
    proEnhancements += `ADVANCED INSTRUCTIONS: ${proSettings.optimizationInstructions}\n`;
  }
  
  console.log("✅ Pro enhancements applied:", proEnhancements);
  
  return originalPrompt + proEnhancements;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      effect,
      intensity,
      duration,
      style,
      analysis,
      imageBase64,
      // NEW: Pro Mode Parameters
      isProMode,
      proSettings
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // EFFECT MAPPING - Convert IDs to descriptions
    const EFFECT_DESCRIPTIONS: Record<string, string> = {
      // Visual Effects
      'portal-effect': 'Portal Effect - Portal dimensional detrás del sujeto',
      'building-explosion': 'Building Explosion - Explosión cinematográfica realista',
      'disintegration': 'Disintegration - Desintegración en partículas luminosas',
      'turning-metal': 'Turning Metal - Transformación en metal realista',
      'melting-effect': 'Melting Effect - Efecto de derretimiento con física real',
      'set-on-fire': 'Set on Fire - Ignición realista con física de fuego',

      // Eyes & Face
      'eyes-in': 'Eyes In (Mouth to Tunnel) - Zoom a través de los ojos',
      'laser-eyes': 'Laser Eyes - Rayos láser desde los ojos',
      'glowing-eyes': 'Glowing Eyes - Ojos brillantes con energía',
      'face-morph': 'Face Morph - Morphing facial cinematográfico',

      // Camera Controls
      'crash-zoom': 'Crash Zoom In - Zoom dramático de alta velocidad',
      'dolly-zoom': 'Dolly Zoom - Efecto Vertigo (Hitchcock)',
      'fpv-drone': 'FPV Drone Shot - Cinematografía de dron FPV',
      '360-orbit': '360° Orbit - Movimiento orbital 360 grados',
      'crane-shot': 'Crane Up/Down - Movimiento de grúa revelador',
      'handheld': 'Handheld Camera - Cámara en mano documental',

      // Energy & Light
      'lightning-strike': 'Lightning Strike - Rayo impactando al sujeto',
      'energy-aura': 'Energy Aura - Aura de energía envolvente',
      'hologram': 'Hologram - Efecto holográfico futurista',
      'light-beams': 'Light Beams - Rayos de luz dramáticos',

      // Atmospheric
      'smoke-reveal': 'Smoke Reveal - Revelación a través del humo',
      'fog-roll': 'Fog Roll - Niebla cinematográfica rodante',
      'dust-particles': 'Dust Particles - Partículas de polvo volumétricas',
      'rain-effect': 'Rain Effect - Lluvia cinematográfica',

      // Fallback for old effects
      'Portal Effect': 'Portal Effect - Portal dimensional detrás del sujeto',
      'Explosion': 'Building Explosion - Explosión cinematográfica realista',
      'Disintegration': 'Disintegration - Desintegración en partículas luminosas'
    };

    // Get effect description
    const effectDescription = EFFECT_DESCRIPTIONS[effect] || effect;

    console.log("🚨 DEBUGGING BACKEND PARAMETERS:");
    console.log("Pro Mode:", isProMode);
    console.log("Effect received:", effect);
    console.log("Effect description:", effectDescription);
    console.log("📋 FULL PRO SETTINGS RECEIVED:");
    console.log(JSON.stringify(proSettings, null, 2));

    if (proSettings) {
      console.log("🎬 INDIVIDUAL CAMERA PARAMETERS:");
      console.log("- shotType:", proSettings.shotType);
      console.log("- cameraAngle:", proSettings.cameraAngle);
      console.log("- cameraMovement:", proSettings.cameraMovement);
      console.log("- lensType:", proSettings.lensType);
      console.log("- optimizationInstructions:", proSettings.optimizationInstructions);
    }

    const minWords = proSettings?.promptLength === 'long' ? 480 : 220;
    const maxWords = proSettings?.promptLength === 'long' ? 520 : 270;

    const systemPrompt = `You are an expert AI video prompt engineer and cinematographer.

🚨 CRITICAL WORD COUNT REQUIREMENT 🚨
- MINIMUM: ${minWords} words
- MAXIMUM: ${maxWords} words
- Generate a comprehensive cinematic VFX prompt within this range

Create detailed, cinematic video prompts that include:
1. Scene description and subject details
2. VFX effect implementation 
3. Camera work and cinematography
4. Lighting and mood
5. Technical specifications
6. Performance and timing

Focus on creating vivid, actionable prompts for video generation.`;

    // DEFINE MAPPING VARIABLES FOR PRO MODE
    let shotType = 'Medium Shot';
    let cameraAngle = 'Eye-level';
    let cameraMovement = 'Static camera';
    let lensType = '35mm Anamorphic';
    let lightingSetup = 'Studio Professional';

    // MAP PRO SETTINGS FOR POST-PROCESSING
    if (isProMode && proSettings) {
      const SHOT_TYPE_MAP: Record<string, string> = {
        'close-up': 'Close-up Shot',
        'medium': 'Medium Shot',
        'wide': 'Wide Shot',
        'extreme-close': 'Extreme Close-up Shot'
      };

      const CAMERA_ANGLE_MAP: Record<string, string> = {
        'high-angle': 'High-angle',
        'low-angle': 'Low-angle',
        'eye-level': 'Eye-level',
        'birds-eye': 'Bird\'s eye view'
      };

      const MOVEMENT_MAP: Record<string, string> = {
        'static': 'Static camera',
        'dolly-in': 'Dolly in',
        'dolly-out': 'Dolly out',
        'pan': 'Pan left/right'
      };

      const LENS_MAP: Record<string, string> = {
        '35mm-anamorphic': '35mm Anamorphic',
        '50mm-prime': '50mm Prime',
        '85mm-portrait': '85mm Portrait',
        '24mm-wide': '24mm Wide'
      };

      const LIGHTING_SETUP_MAP: Record<string, string> = {
        'studio': 'Studio Professional',
        'natural': 'Natural Light',
        'dramatic': 'Dramatic Moody',
        'soft': 'Soft Portrait'
      };

      shotType = SHOT_TYPE_MAP[proSettings.shotType] || proSettings.shotType || 'Medium Shot';
      cameraAngle = CAMERA_ANGLE_MAP[proSettings.cameraAngle] || proSettings.cameraAngle || 'Eye-level';
      cameraMovement = MOVEMENT_MAP[proSettings.cameraMovement] || proSettings.cameraMovement || 'Static camera';
      lensType = LENS_MAP[proSettings.lensType] || proSettings.lensType || '35mm Anamorphic';
      lightingSetup = LIGHTING_SETUP_MAP[proSettings.lightingSetup] || proSettings.lightingSetup || 'Studio Professional';

      console.log("🎬 MAPPED PARAMETERS FOR POST-PROCESSING:");
      console.log("Shot Type:", proSettings.shotType, "→", shotType);
      console.log("Camera Angle:", proSettings.cameraAngle, "→", cameraAngle);
      console.log("Movement:", proSettings.cameraMovement, "→", cameraMovement);
      console.log("Lens:", proSettings.lensType, "→", lensType);
    }

    // BUILD SIMPLE PROMPT (Pro enhancements will be added in post-processing)
    let userPrompt = `Create a cinematic VFX prompt with these parameters:

EFFECT: ${effectDescription}
INTENSITY: ${intensity}%
DURATION: ${duration} seconds
STYLE: ${style}`;

    // ADD AI ANALYSIS
    if (analysis) {
      userPrompt += `

IMAGE ANALYSIS:
- Subject: ${analysis.subject}
- Style: ${analysis.style}
- Colors: ${analysis.colors?.join(', ')}
- Lighting: ${analysis.lighting}`;

      // Add detailed analysis if available
      if (analysis.cameraAngle) {
        userPrompt += `
- Detected Camera Angle: ${analysis.cameraAngle}
- Detected Shot Type: ${analysis.shotType}
- Subject Gender: ${analysis.gender}
- Subject Age: ${analysis.age}
- Expression: ${analysis.expression}
- Pose: ${analysis.pose}
- Energy: ${analysis.energy}
- Vibe: ${analysis.vibe}`;
      }
    }

    userPrompt += `

Generate a comprehensive cinematic VFX prompt (${minWords}-${maxWords} words) that includes:
1. Scene description and cinematography
2. VFX effect implementation details
3. Lighting and mood
4. Technical specifications
5. Subject performance and timing

Create a vivid, actionable prompt for video generation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${userPrompt}\n\nIMPORTANTE: Basar el prompt estrictamente en la imagen de referencia si se provee. No inventes escenarios que no estén presentes.`
              },
              ...(imageBase64 ? [{ type: "image_url", image_url: { url: imageBase64 } }] : [])
            ]
          }
        ],
        temperature: 0.7,
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits depleted. Please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let prompt = data.choices?.[0]?.message?.content;

    if (!prompt) {
      throw new Error("No prompt generated");
    }

    // 🚀 POST-PROCESS PROMPT WITH PRO PARAMETERS
    if (isProMode && proSettings) {
      console.log("🎬 APPLYING PRO MODE POST-PROCESSING...");
      
      // Check if this is an enhancement request
      if (proSettings.enhanceExisting && proSettings.originalPrompt) {
        console.log("🔧 ENHANCEMENT MODE DETECTED");
        console.log("Original prompt length:", proSettings.originalPrompt.length);
        console.log("Pro settings for enhancement:", JSON.stringify(proSettings, null, 2));
        
        try {
          const enhancedResult = await enhancePromptIntelligently(proSettings.originalPrompt, proSettings, shotType, cameraAngle, cameraMovement, lensType, lightingSetup, LOVABLE_API_KEY);
          console.log("✅ Enhancement completed");
          console.log("Enhanced prompt length:", enhancedResult.length);
          prompt = enhancedResult;
        } catch (error) {
          console.error("❌ Enhancement failed:", error);
          prompt = proSettings.originalPrompt; // Return original if enhancement fails
        }
      } else {
        console.log("🎬 Regular Pro Mode processing");
        prompt = applyProModeEnhancements(prompt, proSettings, shotType, cameraAngle, cameraMovement, lensType, lightingSetup);
      }
    }

    // Count words in generated prompt
    const wordCount = prompt.trim().split(/\s+/).length;

    console.log("Prompt generated successfully");
    console.log("Generated prompt length:", prompt.length, "characters");
    console.log("Word count:", wordCount, "/ target range:", minWords, "-", maxWords);
    console.log("Effect used:", effectDescription);

    // Check if word count is in acceptable range
    if (wordCount < minWords) {
      console.warn(`⚠️ WORD COUNT TOO LOW: Got ${wordCount} words, minimum required: ${minWords}`);

      // Add padding to reach minimum word count
      const wordsNeeded = minWords - wordCount;
      const padding = ` Additional technical specifications: Professional-grade cinematography with advanced color grading, precise focus pulling, and meticulous attention to lighting ratios. Enhanced post-production workflow includes detailed compositing, motion graphics integration, and comprehensive audio-visual synchronization for optimal cinematic impact.`.split(' ').slice(0, wordsNeeded).join(' ');

      const paddedPrompt = prompt + padding;
      const finalWordCount = paddedPrompt.trim().split(/\s+/).length;

      console.log("Added padding. Final word count:", finalWordCount);

      return new Response(
        JSON.stringify({ prompt: paddedPrompt }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (wordCount > maxWords) {
      console.warn(`⚠️ WORD COUNT TOO HIGH: Got ${wordCount} words, maximum allowed: ${maxWords}`);

      // Truncate to maximum word count
      const truncatedPrompt = prompt.trim().split(/\s+/).slice(0, maxWords).join(' ');
      const finalWordCount = truncatedPrompt.trim().split(/\s+/).length;

      console.log("Truncated prompt. Final word count:", finalWordCount);

      return new Response(
        JSON.stringify({ prompt: truncatedPrompt }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Word count within acceptable range:", wordCount);

    return new Response(
      JSON.stringify({ prompt }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-prompt function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});