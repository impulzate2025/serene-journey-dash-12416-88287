/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// 🛡️ FALLBACK: Regex-based enhancement when AI fails
function applySettingsWithRegex(originalPrompt: string, proSettings: any): string {
  let enhanced = originalPrompt;

  // Remove problematic headers first
  enhanced = enhanced.replace(/Here's a.*?:/gi, '');
  enhanced = enhanced.replace(/\*\*.*?\*\*/g, '');
  enhanced = enhanced.replace(/Shot Description:/gi, '');

  // Apply shot type changes
  if (proSettings.shotType && proSettings.shotType !== 'medium') {
    const shotMap: Record<string, string> = {
      'wide': 'wide shot',
      'close-up': 'close-up shot',
      'extreme-close': 'extreme close-up shot'
    };
    const newShot = shotMap[proSettings.shotType];
    if (newShot) {
      enhanced = enhanced.replace(/medium shot/gi, newShot);
      enhanced = enhanced.replace(/close-up shot/gi, newShot);
      enhanced = enhanced.replace(/wide shot/gi, newShot);
    }
  }

  // Apply camera angle changes
  if (proSettings.cameraAngle && proSettings.cameraAngle !== 'high-angle') {
    const angleMap: Record<string, string> = {
      'eye-level': 'eye-level',
      'low-angle': 'low-angle',
      'birds-eye': 'bird\'s eye view'
    };
    const newAngle = angleMap[proSettings.cameraAngle];
    if (newAngle) {
      enhanced = enhanced.replace(/high-angle/gi, newAngle);
      enhanced = enhanced.replace(/low-angle/gi, newAngle);
      enhanced = enhanced.replace(/eye-level/gi, newAngle);
      enhanced = enhanced.replace(/bird's eye view/gi, newAngle);
    }
  }

  // Apply lighting changes
  if (proSettings.lightingSetup) {
    const lightingMap: Record<string, string> = {
      'studio': 'studio lighting',
      'natural': 'natural lighting',
      'dramatic': 'dramatic lighting',
      'soft': 'soft lighting'
    };
    const newLighting = lightingMap[proSettings.lightingSetup];
    if (newLighting) {
      enhanced = enhanced.replace(/studio lighting/gi, newLighting);
      enhanced = enhanced.replace(/natural lighting/gi, newLighting);
      enhanced = enhanced.replace(/dramatic lighting/gi, newLighting);
    }
  }

  // Apply style changes
  if (proSettings.artisticStyle) {
    const styleMap: Record<string, string> = {
      'cinematic': 'cinematic',
      'documentary': 'documentary-style',
      'commercial': 'commercial-style',
      'artistic': 'artistic'
    };
    const newStyle = styleMap[proSettings.artisticStyle];
    if (newStyle) {
      enhanced = enhanced.replace(/cinematic/gi, newStyle);
      enhanced = enhanced.replace(/documentary-style/gi, newStyle);
    }
  }

  // Apply advanced instructions (highest priority)
  if (proSettings.optimizationInstructions?.includes('360 orbit')) {
    enhanced = enhanced.replace(/dolly.*?movement/gi, '360-degree orbital drone movement');
    enhanced = enhanced.replace(/camera.*?backward/gi, 'camera executes complete 360-degree orbital movement');
  }

  // Clean up and ensure proper format
  enhanced = enhanced.replace(/\s+/g, ' ').trim();

  // Ensure it starts with proper format
  if (!enhanced.match(/^A\s+(wide|medium|close-up|extreme)/i)) {
    // Try to find the main content and prepend proper format
    const shotType = proSettings.shotType === 'wide' ? 'wide shot' :
      proSettings.shotType === 'close-up' ? 'close-up shot' : 'medium shot';
    const angle = proSettings.cameraAngle === 'birds-eye' ? 'bird\'s eye view' :
      proSettings.cameraAngle === 'low-angle' ? 'low-angle' : 'eye-level';

    // Extract subject from original
    const subjectMatch = enhanced.match(/(?:of|captures)\s+([^,]+)/i);
    const subject = subjectMatch ? subjectMatch[1] : 'a stylish man';

    enhanced = `A ${shotType} at ${angle} captures ${subject}, ${enhanced.replace(/^.*?captures\s+[^,]+,?\s*/i, '')}`;
  }

  return enhanced;
}

serve(async (req: Request) => {
  console.log("🔧 ENHANCE-PROMPT: Function called, method:", req.method);
  
  if (req.method === "OPTIONS") {
    console.log("🔧 ENHANCE-PROMPT: Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔧 ENHANCE-PROMPT: Parsing request body...");
    const requestBody = await req.json();
    console.log("📋 ENHANCE-PROMPT: Request body received:", JSON.stringify(requestBody, null, 2));
    
    const { originalPrompt, proSettings, targetWordCount, enhancementToggles } = requestBody;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("🔧 ENHANCE-PROMPT: Starting enhancement...");
    console.log("📋 ENHANCE-PROMPT: Original word count:", originalPrompt.split(' ').length);
    console.log("📋 ENHANCE-PROMPT: Target word count:", targetWordCount);
    console.log("🎛️ ENHANCE-PROMPT: Enhancement toggles:", enhancementToggles);
    console.log("📋 ENHANCE-PROMPT: Filtered settings received:", JSON.stringify(proSettings, null, 2));
    console.log("📋 ENHANCE-PROMPT: Original prompt preview:", originalPrompt.substring(0, 150) + "...");

    // Build enhancement instructions based on active toggles
    let instructions = "Rewrite this video prompt by naturally integrating ONLY these specific changes:\n\n";

    // Verificar si hay configuraciones para aplicar
    const hasSettings = Object.keys(proSettings).length > 0;
    if (!hasSettings) {
      console.log("⚠️ ENHANCE-PROMPT: No settings provided, returning original prompt");
      return new Response(
        JSON.stringify({
          enhancedPrompt: originalPrompt,
          originalWordCount: originalPrompt.split(' ').length,
          finalWordCount: originalPrompt.split(' ').length,
          message: "No enhancement categories selected"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (proSettings.shotType && proSettings.shotType !== 'medium') {
      const shotMap: Record<string, string> = {
        'wide': 'wide shot',
        'close-up': 'close-up shot',
        'extreme-close': 'extreme close-up shot'
      };
      instructions += `- Change camera framing to: ${shotMap[proSettings.shotType] || proSettings.shotType}\n`;
    }

    if (proSettings.cameraAngle && proSettings.cameraAngle !== 'high-angle') {
      const angleMap: Record<string, string> = {
        'eye-level': 'eye-level angle',
        'low-angle': 'low-angle',
        'birds-eye': 'bird\'s eye view'
      };
      instructions += `- Change camera angle to: ${angleMap[proSettings.cameraAngle] || proSettings.cameraAngle}\n`;
    }

    if (proSettings.cameraMovement && proSettings.cameraMovement !== 'dolly-in') {
      const movementMap: Record<string, string> = {
        'dolly-out': 'dolly-out movement (camera pulls back)',
        'static': 'static camera (no movement)',
        'pan': 'panning movement (left to right)',
        'crash-zoom': 'crash zoom in - dramatic high-speed zoom towards subject',
        'dolly-zoom': 'dolly zoom (Vertigo effect) - counter zoom while moving',
        'fpv-drone': 'FPV drone shot - dynamic first-person view drone cinematography',
        '360-orbit': '360-degree orbital drone movement - complete circular orbit around subject',
        'crane-shot': 'crane movement - vertical camera elevation change (up or down)',
        'handheld': 'handheld camera - documentary-style natural camera shake'
      };
      instructions += `- Change camera movement to: ${movementMap[proSettings.cameraMovement] || proSettings.cameraMovement}\n`;
    }

    if (proSettings.lensType) {
      const lensMap: Record<string, string> = {
        '24mm-wide': '24mm wide-angle lens',
        '35mm-anamorphic': '35mm anamorphic lens',
        '50mm-prime': '50mm prime lens',
        '85mm-portrait': '85mm portrait lens'
      };
      instructions += `- Use lens: ${lensMap[proSettings.lensType] || proSettings.lensType}\n`;
    }

    if (proSettings.particleType && proSettings.particleType !== 'dust') {
      instructions += `- Change particle effects to: ${proSettings.particleType} particles\n`;
    }

    if (proSettings.intensity && proSettings.intensity !== 85) {
      instructions += `- Set effect intensity to: ${proSettings.intensity}%\n`;
    }

    // Lighting Controls
    if (proSettings.lightingSetup) {
      const lightingMap: Record<string, string> = {
        'studio': 'studio professional lighting setup',
        'natural': 'natural lighting',
        'dramatic': 'dramatic moody lighting',
        'soft': 'soft portrait lighting'
      };
      instructions += `- Change lighting setup to: ${lightingMap[proSettings.lightingSetup] || proSettings.lightingSetup}\n`;
    }

    if (proSettings.keyLight) {
      const keyLightMap: Record<string, string> = {
        'above-right': 'key light from above-right',
        'above-left': 'key light from above-left',
        'front': 'front key lighting',
        'side': 'side key lighting'
      };
      instructions += `- Set key light direction: ${keyLightMap[proSettings.keyLight] || proSettings.keyLight}\n`;
    }

    if (proSettings.fillLight) {
      const fillLightMap: Record<string, string> = {
        'soft': 'soft fill lighting',
        'hard': 'hard fill lighting',
        'bounce': 'bounce fill lighting',
        'none': 'no fill lighting'
      };
      instructions += `- Configure fill light: ${fillLightMap[proSettings.fillLight] || proSettings.fillLight}\n`;
    }

    if (proSettings.rimLight) {
      const rimLightMap: Record<string, string> = {
        'blue': 'blue rim lighting',
        'white': 'white rim lighting',
        'warm': 'warm rim lighting',
        'none': 'no rim lighting'
      };
      instructions += `- Add rim light: ${rimLightMap[proSettings.rimLight] || proSettings.rimLight}\n`;
    }

    // Style Controls
    if (proSettings.artisticStyle) {
      const styleMap: Record<string, string> = {
        'cinematic': 'cinematic style',
        'documentary': 'documentary style',
        'commercial': 'commercial style',
        'artistic': 'artistic style'
      };
      instructions += `- Apply artistic style: ${styleMap[proSettings.artisticStyle] || proSettings.artisticStyle}\n`;
    }

    if (proSettings.mood) {
      const moodMap: Record<string, string> = {
        'intense': 'intense mood',
        'dramatic': 'dramatic mood',
        'energetic': 'energetic mood',
        'calm': 'calm mood'
      };
      instructions += `- Set mood to: ${moodMap[proSettings.mood] || proSettings.mood}\n`;
    }

    if (proSettings.optimizationInstructions) {
      instructions += `- 🚨 ADVANCED INSTRUCTIONS (ABSOLUTE PRIORITY): ${proSettings.optimizationInstructions}\n`;
      instructions += `- This OVERRIDES all other camera movement settings\n`;
      instructions += `- If it says "360 orbit movement", the camera MUST do a complete 360-degree orbital shot\n`;
    }

    instructions += `\nCINEMATOGRAPHY REQUIREMENTS:
- Keep the same subject, setting, and basic scene
- Naturally integrate changes into existing descriptions
- DO NOT add separate sections, headers, or introductory phrases
- Target exactly ${targetWordCount} words (±15 words acceptable)
- Include technical specs: aperture (f/2.8, f/4), shutter speed (1/60, 1/120), frame rate (24fps, 60fps)
- Specify color grading and lighting ratios
- Describe camera movements with professional precision
- Include VFX integration details and particle systems
- If Advanced Instructions conflict with basic settings, Advanced Instructions WIN
- START IMMEDIATELY with the scene description, no preamble

EXAMPLE CORRECT FORMAT:
"A wide shot at eye-level captures a stylish man in black sequined jacket, camera executing complete 360-degree orbital drone movement around the subject over 5 seconds using 24mm wide-angle lens at f/2.8 aperture..."

WRONG FORMAT:
"Here's a cinematic VFX prompt based on the provided image: **Shot Description:** A dynamic..."`;

    // Add specific timing preservation
    if (originalPrompt.includes('5 second') || originalPrompt.includes('5-second')) {
      instructions += `\n- PRESERVE TIMING: Keep 5-second duration from original prompt\n`;
    }

    const systemPrompt = `You are a professional prompt rewriter. You MUST rewrite the given video prompt by integrating the specified changes.

🚨 CRITICAL RULES - VIOLATION = IMMEDIATE FAILURE 🚨

FORBIDDEN ACTIONS:
❌ NEVER write "Here's a..." or "Here is a..." 
❌ NEVER use "**Shot Description:**" or any headers
❌ NEVER use bullet points or sections
❌ NEVER ignore Advanced Instructions (they override everything)
❌ NEVER change the subject or basic scene

REQUIRED ACTIONS:
✅ START IMMEDIATELY with "A [shot type] at [angle]..."
✅ Write as ONE continuous paragraph
✅ Keep word count: ${targetWordCount - 15} to ${targetWordCount + 15} words
✅ Apply ALL specified changes naturally
✅ If Advanced Instructions mention "360 orbit", camera MUST do 360-degree orbital movement

EXAMPLE CORRECT OUTPUT:
"A wide shot at bird's eye view captures a stylish man in black sequined jacket, camera executing complete 360-degree orbital drone movement around the subject over 5 seconds using 24mm wide-angle lens..."

You will be REJECTED if you start with introductory phrases or use headers.`;

    const userPrompt = `TASK: Rewrite this video prompt by applying these changes:

${instructions}

ORIGINAL PROMPT TO REWRITE:
${originalPrompt}

🚨 MANDATORY FORMAT 🚨
Your response MUST start with: "A [shot type] at [angle]..."
NO introductions, NO headers, NO "Here's a..." - START IMMEDIATELY with the scene.

REWRITE:`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.01, // Ultra low temperature for maximum compliance
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let enhancedPrompt = data.choices?.[0]?.message?.content;

    if (!enhancedPrompt) {
      throw new Error("No enhanced prompt generated");
    }

    // 🧹 POST-PROCESSING: Clean up AI misbehavior
    enhancedPrompt = enhancedPrompt.trim();

    // Remove forbidden introductions
    enhancedPrompt = enhancedPrompt.replace(/^Here's a.*?:/gi, '');
    enhancedPrompt = enhancedPrompt.replace(/^Here is a.*?:/gi, '');
    enhancedPrompt = enhancedPrompt.replace(/^.*?cinematic VFX prompt.*?:/gi, '');

    // Remove headers and formatting
    enhancedPrompt = enhancedPrompt.replace(/\*\*.*?\*\*/g, '');
    enhancedPrompt = enhancedPrompt.replace(/^Shot Description:/gi, '');
    enhancedPrompt = enhancedPrompt.replace(/^Camera Movement:/gi, '');
    enhancedPrompt = enhancedPrompt.replace(/^VFX Details:/gi, '');

    // Clean up extra whitespace
    enhancedPrompt = enhancedPrompt.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

    // Ensure it starts correctly
    if (!enhancedPrompt.match(/^A\s+(wide|medium|close-up|extreme)/i)) {
      console.log("⚠️ ENHANCE-PROMPT: AI didn't follow format, attempting to fix...");
      // Try to extract the actual prompt content
      const match = enhancedPrompt.match(/A\s+(wide|medium|close-up|extreme).*$/i);
      if (match) {
        enhancedPrompt = match[0];
      } else {
        // Last resort: Use regex-based enhancement
        console.log("🚨 ENHANCE-PROMPT: AI completely failed, using fallback...");
        enhancedPrompt = applySettingsWithRegex(originalPrompt, proSettings);
      }
    }

    const finalWordCount = enhancedPrompt.trim().split(/\s+/).length;

    console.log("✅ ENHANCE-PROMPT: Enhancement completed successfully");
    console.log("📊 ENHANCE-PROMPT: Final word count:", finalWordCount);
    console.log("📊 ENHANCE-PROMPT: Target range:", targetWordCount - 15, "-", targetWordCount + 15);
    console.log("📋 ENHANCE-PROMPT: Enhanced prompt preview:", enhancedPrompt.substring(0, 150) + "...");

    return new Response(
      JSON.stringify({
        enhancedPrompt,
        originalWordCount: originalPrompt.split(' ').length,
        finalWordCount
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in enhance-prompt function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});