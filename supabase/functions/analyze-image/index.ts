/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing image with AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "system",
            content: "You are a professional cinematographer, VFX supervisor, and image analyst. Provide comprehensive cinematic analysis for video generation prompts. Extract ALL visual information including camera work, lighting setup, subject details, composition, and technical specifications."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `CRITICAL: You MUST analyze this image and return a complete JSON object with ALL fields filled. Never leave any field empty or undefined.

Analyze this image for cinematic video generation and return EXACTLY this JSON structure with ALL fields completed:

{
  "subject": "detailed subject description (4-8 words)",
  "style": "photography/cinematography style",
  "colors": ["color1", "color2", "color3"],
  "lighting": "lighting type",
  "cameraAngle": "high-angle OR low-angle OR eye-level OR birds-eye OR worms-eye",
  "shotType": "close-up OR medium OR wide OR extreme-close-up OR full-body",
  "composition": "centered OR rule-of-thirds OR off-center OR symmetrical",
  "depth": "shallow OR deep OR medium",
  "lightingSetup": "studio OR natural OR dramatic OR soft OR hard",
  "keyLightDirection": "above-right OR above-left OR front OR side OR back",
  "lightingMood": "high-contrast OR soft OR moody OR bright OR dramatic",
  "shadows": "hard OR soft OR dramatic OR minimal",
  "gender": "male OR female OR neutral",
  "age": "young OR adult OR mature OR elderly",
  "expression": "confident OR serious OR smiling OR neutral OR intense OR relaxed",
  "pose": "standing OR sitting OR action OR portrait OR dynamic OR static",
  "clothing": "casual OR formal OR costume OR athletic OR business OR artistic",
  "backgroundType": "studio OR outdoor OR indoor OR abstract OR solid OR textured",
  "imageQuality": "professional OR amateur OR high-res OR medium OR artistic",
  "colorGrade": "natural OR cinematic OR high-contrast OR warm OR cool OR vintage",
  "energy": "alpha OR confident OR relaxed OR intense OR calm OR powerful OR gentle",
  "mood": "dramatic OR playful OR serious OR mysterious OR upbeat OR melancholic",
  "vibe": "professional OR casual OR artistic OR commercial OR edgy OR elegant"
}

RULES:
1. Fill EVERY single field - no empty values allowed
2. Use ONLY the exact options provided after "OR"
3. Choose the most accurate option for each field
4. Return valid JSON only, no explanations or markdown
5. If unsure, pick the closest matching option`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
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
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("AI Analysis complete:", content);
    console.log("Raw AI response length:", content.length);

    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const parsedAnalysis = JSON.parse(jsonStr);
      
      // Validate and ensure all required fields are present
      const requiredFields = [
        'subject', 'style', 'colors', 'lighting', 'cameraAngle', 'shotType', 
        'composition', 'depth', 'lightingSetup', 'keyLightDirection', 'lightingMood', 
        'shadows', 'gender', 'age', 'expression', 'pose', 'clothing', 
        'backgroundType', 'imageQuality', 'colorGrade', 'energy', 'mood', 'vibe'
      ];
      
      // Fill missing fields with defaults
      analysis = { ...parsedAnalysis };
      requiredFields.forEach(field => {
        if (!analysis[field] || analysis[field] === '' || analysis[field] === null) {
          // Provide smart defaults based on field type
          const defaults: Record<string, any> = {
            subject: "Portrait subject",
            style: "Cinematic",
            colors: ["Blue", "Silver", "Black"],
            lighting: "Studio",
            cameraAngle: "eye-level",
            shotType: "medium",
            composition: "centered",
            depth: "shallow",
            lightingSetup: "studio",
            keyLightDirection: "above-right",
            lightingMood: "high-contrast",
            shadows: "soft",
            gender: "neutral",
            age: "adult",
            expression: "confident",
            pose: "standing",
            clothing: "casual",
            backgroundType: "studio",
            imageQuality: "professional",
            colorGrade: "cinematic",
            energy: "confident",
            mood: "dramatic",
            vibe: "professional"
          };
          analysis[field] = defaults[field];
          console.log(`Field '${field}' was missing, filled with default:`, defaults[field]);
        }
      });
      
      console.log("Final analysis object:", JSON.stringify(analysis, null, 2));
    } catch (e) {
      // Fallback parsing if JSON extraction fails
      console.log("Fallback parsing, raw content:", content);
      // COMPLETE fallback with ALL required fields
      analysis = {
        subject: "Professional portrait subject",
        style: "Cinematic portrait",
        colors: ["Blue", "Silver", "Black"],
        lighting: "Studio lighting",
        cameraAngle: "eye-level",
        shotType: "medium",
        composition: "centered",
        depth: "shallow",
        lightingSetup: "studio",
        keyLightDirection: "above-right",
        lightingMood: "high-contrast",
        shadows: "soft",
        gender: "neutral",
        age: "adult",
        expression: "confident",
        pose: "standing",
        clothing: "casual",
        backgroundType: "studio",
        imageQuality: "professional",
        colorGrade: "cinematic",
        energy: "confident",
        mood: "dramatic",
        vibe: "professional"
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-image function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
