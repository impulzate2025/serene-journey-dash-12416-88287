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

    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
    }

    console.log("🔧 ENHANCE-PROMPT: Starting enhancement...");
    console.log("📋 ENHANCE-PROMPT: Original word count:", originalPrompt.split(' ').length);
    console.log("📋 ENHANCE-PROMPT: Target word count:", targetWordCount);
    console.log("🎛️ ENHANCE-PROMPT: Enhancement toggles:", enhancementToggles);
    console.log("📋 ENHANCE-PROMPT: Filtered settings received:", JSON.stringify(proSettings, null, 2));
    console.log("📋 ENHANCE-PROMPT: Original prompt preview:", originalPrompt.substring(0, 150) + "...");
    
    // 🎬 SPECIFIC DEBUGGING FOR CAMERA ANGLE
    if (proSettings.cameraAngle) {
      console.log("🎬 ENHANCE-PROMPT: Camera angle specified:", proSettings.cameraAngle);
      console.log("🎬 ENHANCE-PROMPT: This should appear in final result as:", proSettings.cameraAngle);
    }
    if (proSettings.shotType) {
      console.log("📐 ENHANCE-PROMPT: Shot type specified:", proSettings.shotType);
    }

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

    if (proSettings.shotType) {
      const shotMap: Record<string, string> = {
        'medium': 'medium shot',
        'wide': 'wide shot',
        'close-up': 'close-up shot',
        'extreme-close': 'extreme close-up shot'
      };
      instructions += `- Change camera framing to: ${shotMap[proSettings.shotType] || proSettings.shotType}\n`;
    }

    if (proSettings.cameraAngle) {
      const angleMap: Record<string, string> = {
        'high-angle': 'high-angle',
        'eye-level': 'eye-level angle', 
        'low-angle': 'low-angle',
        'birds-eye': 'bird\'s eye view'
      };
      instructions += `- Change camera angle to: ${angleMap[proSettings.cameraAngle] || proSettings.cameraAngle}\n`;
    }

    if (proSettings.cameraMovement && proSettings.cameraMovement !== 'dolly-in') {
      // 🎯 INTELLIGENT MOVEMENT COMBINATIONS - Known working patterns
      const getIntelligentMovementDescription = () => {
        const { cameraMovement, movementDirection, movementSpeed, movementStyle } = proSettings;
        
        // 🚁 SPECIAL COMBINATIONS - Proven to work with AI
        const specialCombinations: Record<string, string> = {
          'fpv-drone+top-view': 'FPV drone 360 movement',
          'fpv-drone+spiral': 'FPV drone spiral 360 movement',
          '360-orbit+top-view': '360 degree orbital movement',
          '360-orbit+spiral': 'spiral 360 degree orbital movement',
          'crash-zoom+dramatic': 'dramatic crash zoom movement',
          'crash-zoom+fast': 'high-speed crash zoom movement',
          'dolly-zoom+dramatic': 'dramatic dolly zoom (Vertigo effect)',
          'crane-shot+spiral': 'spiral crane movement'
        };
        
        // Check for special combinations first
        const combinationKey = `${cameraMovement}+${movementDirection}`;
        const speedCombinationKey = `${cameraMovement}+${movementSpeed}`;
        
        if (specialCombinations[combinationKey]) {
          return specialCombinations[combinationKey];
        }
        
        if (specialCombinations[speedCombinationKey]) {
          return specialCombinations[speedCombinationKey];
        }
        
        // 🎬 FALLBACK: Use traditional mapping
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
        
        return movementMap[cameraMovement] || cameraMovement;
      };
      
      const intelligentMovement = getIntelligentMovementDescription();
      instructions += `- Change camera movement to: ${intelligentMovement}\n`;
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

    instructions += `\n🚨 CRITICAL CINEMATOGRAPHY REQUIREMENTS 🚨:
- Keep the same subject, setting, and basic scene
- MANDATORY: Apply ALL specified camera changes (shot type, angle, movement)
- DO NOT ignore camera angle specifications - they are REQUIRED
- DO NOT add separate sections, headers, or introductory phrases
- Target exactly ${targetWordCount} words (±15 words acceptable)
- Include technical specs: aperture (f/2.8, f/4), shutter speed (1/60, 1/120), frame rate (24fps, 60fps)
- Specify color grading and lighting ratios
- Describe camera movements with professional precision
- Include VFX integration details and particle systems
- If Advanced Instructions conflict with basic settings, Advanced Instructions WIN
- START IMMEDIATELY with the scene description, no preamble

🎬 CAMERA ANGLE ENFORCEMENT:
- If specified "high-angle" → MUST use "high-angle" in result
- If specified "low-angle" → MUST use "low-angle" in result  
- If specified "eye-level" → MUST use "eye-level" in result
- If specified "bird's eye" → MUST use "bird's eye view" in result

EXAMPLE CORRECT FORMAT:
"A wide shot at high-angle captures a stylish man in black sequined jacket, camera executing complete 360-degree orbital drone movement around the subject over 5 seconds using 24mm wide-angle lens at f/2.8 aperture..."

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
❌ NEVER ignore camera angle specifications
❌ NEVER ignore shot type specifications
❌ NEVER ignore Advanced Instructions (they override everything)
❌ NEVER change the subject or basic scene

REQUIRED ACTIONS:
✅ START IMMEDIATELY with "A [shot type] at [angle]..."
✅ Write as ONE continuous paragraph
✅ Keep word count: ${targetWordCount - 15} to ${targetWordCount + 15} words
✅ Apply ALL specified changes naturally
✅ ENFORCE camera angle exactly as specified
✅ If Advanced Instructions mention "360 orbit", camera MUST do 360-degree orbital movement

🎬 CAMERA ANGLE ENFORCEMENT - ABSOLUTE PRIORITY:
- If instructions say "high-angle" → Result MUST contain "high-angle"
- If instructions say "low-angle" → Result MUST contain "low-angle"  
- If instructions say "eye-level" → Result MUST contain "eye-level"
- If instructions say "bird's eye" → Result MUST contain "bird's eye view"

EXAMPLE CORRECT OUTPUT:
"A wide shot at high-angle captures a stylish man in black sequined jacket, camera executing complete 360-degree orbital drone movement around the subject over 5 seconds using 24mm wide-angle lens..."

You will be REJECTED if you start with introductory phrases, use headers, or ignore camera specifications.`;

    const userPrompt = `TASK: Rewrite this video prompt by applying these changes:

${instructions}

ORIGINAL PROMPT TO REWRITE:
${originalPrompt}

🚨 MANDATORY FORMAT 🚨
Your response MUST start with: "A [shot type] at [angle]..."
NO introductions, NO headers, NO "Here's a..." - START IMMEDIATELY with the scene.

REWRITE:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\n${userPrompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.01,
            maxOutputTokens: 500
          }
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Google Gemini API error:", response.status, errorText);
      throw new Error(`Google Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let enhancedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text;

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

    // 🚨 FORCE CAMERA SPECIFICATIONS - AI Override Protection
    console.log("🔧 ENHANCE-PROMPT: Starting forced camera specification enforcement...");
    
    if (proSettings.cameraAngle) {
      console.log("🎬 ENHANCE-PROMPT: Forcing camera angle:", proSettings.cameraAngle);
      
      // Remove conflicting angles first
      enhancedPrompt = enhancedPrompt.replace(/\b(low-angle|eye-level|bird's eye view|worm's-eye view|high-angle)\b/gi, '');
      enhancedPrompt = enhancedPrompt.replace(/\bstarting from a worm's-eye view\b/gi, '');
      enhancedPrompt = enhancedPrompt.replace(/\bfrom below\b/gi, '');
      enhancedPrompt = enhancedPrompt.replace(/\bfrom above\b/gi, '');
      
      // Force the correct angle
      const angleReplacements: Record<string, string> = {
        'high-angle': 'high-angle',
        'low-angle': 'low-angle', 
        'eye-level': 'eye-level',
        'birds-eye': 'bird\'s eye view'
      };
      
      const correctAngle = angleReplacements[proSettings.cameraAngle];
      if (correctAngle) {
        // Replace the shot description with correct angle
        enhancedPrompt = enhancedPrompt.replace(
          /^A\s+(wide shot|medium shot|close-up shot|extreme close-up shot)\s+at\s+\w+/i,
          `A ${proSettings.shotType === 'wide' ? 'wide shot' : proSettings.shotType === 'close-up' ? 'close-up shot' : 'medium shot'} at ${correctAngle}`
        );
        
        // If the replacement didn't work, force it at the beginning
        if (!enhancedPrompt.includes(correctAngle)) {
          enhancedPrompt = enhancedPrompt.replace(
            /^A\s+(wide shot|medium shot|close-up shot|extreme close-up shot)/i,
            `A ${proSettings.shotType === 'wide' ? 'wide shot' : proSettings.shotType === 'close-up' ? 'close-up shot' : 'medium shot'} at ${correctAngle}`
          );
        }
        
        console.log("✅ ENHANCE-PROMPT: Camera angle forced to:", correctAngle);
      }
    }
    
    if (proSettings.shotType) {
      console.log("📐 ENHANCE-PROMPT: Forcing shot type:", proSettings.shotType);
      
      const shotReplacements: Record<string, string> = {
        'wide': 'wide shot',
        'medium': 'medium shot',
        'close-up': 'close-up shot',
        'extreme-close': 'extreme close-up shot'
      };
      
      const correctShot = shotReplacements[proSettings.shotType];
      if (correctShot) {
        enhancedPrompt = enhancedPrompt.replace(
          /^A\s+(wide shot|medium shot|close-up shot|extreme close-up shot)/i,
          `A ${correctShot}`
        );
        console.log("✅ ENHANCE-PROMPT: Shot type forced to:", correctShot);
      }
    }

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

    // 🚨 FINAL VERIFICATION AND NUCLEAR OPTION
    if (proSettings.cameraAngle && proSettings.shotType) {
      const expectedStart = `A ${proSettings.shotType === 'wide' ? 'wide shot' : proSettings.shotType === 'close-up' ? 'close-up shot' : 'medium shot'} at ${proSettings.cameraAngle}`;
      
      if (!enhancedPrompt.toLowerCase().startsWith(expectedStart.toLowerCase())) {
        console.log("🚨 ENHANCE-PROMPT: NUCLEAR OPTION - Forcing correct start");
        console.log("Expected start:", expectedStart);
        console.log("Actual start:", enhancedPrompt.substring(0, 50));
        
        // Nuclear option: Replace the entire beginning
        const restOfPrompt = enhancedPrompt.replace(/^A\s+[^,]+,?\s*/i, '');
        enhancedPrompt = `${expectedStart} captures ${restOfPrompt}`;
        
        console.log("🔧 ENHANCE-PROMPT: Applied nuclear fix, new start:", enhancedPrompt.substring(0, 50));
      }
    }

    const finalWordCount = enhancedPrompt.trim().split(/\s+/).length;

    console.log("✅ ENHANCE-PROMPT: Enhancement completed successfully");
    console.log("📊 ENHANCE-PROMPT: Final word count:", finalWordCount);
    console.log("📊 ENHANCE-PROMPT: Target range:", targetWordCount - 15, "-", targetWordCount + 15);
    console.log("📋 ENHANCE-PROMPT: Enhanced prompt preview:", enhancedPrompt.substring(0, 150) + "...");
    
    // 🔍 VERIFICATION: Check if forced changes were applied
    if (proSettings.cameraAngle) {
      const hasCorrectAngle = enhancedPrompt.toLowerCase().includes(proSettings.cameraAngle.toLowerCase());
      console.log(`🎬 ENHANCE-PROMPT: Camera angle verification - Expected: ${proSettings.cameraAngle}, Found: ${hasCorrectAngle ? '✅' : '❌'}`);
      if (!hasCorrectAngle) {
        console.log("🚨 ENHANCE-PROMPT: WARNING - Camera angle not found in result!");
      }
    }
    
    if (proSettings.shotType) {
      const expectedShot = proSettings.shotType === 'wide' ? 'wide shot' : proSettings.shotType === 'close-up' ? 'close-up shot' : 'medium shot';
      const hasCorrectShot = enhancedPrompt.toLowerCase().includes(expectedShot.toLowerCase());
      console.log(`📐 ENHANCE-PROMPT: Shot type verification - Expected: ${expectedShot}, Found: ${hasCorrectShot ? '✅' : '❌'}`);
    }

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