import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { effect, intensity, duration, style, analysis } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating cinematic prompt...");

    const systemPrompt = `You are an expert AI video prompt engineer specializing in cinematic VFX. Generate highly detailed, technical prompts for AI video generation tools like Runway, Pika, or Kling AI. Focus on:
- Camera movements and techniques
- Lighting and atmosphere
- VFX details and particle systems
- Technical camera specs (focal length, aperture)
- Timing and pacing
Keep prompts under 300 words but packed with cinematic detail.`;

    const userPrompt = `Create a cinematic VFX prompt with these parameters:
- Effect: ${effect}
- Intensity: ${intensity}%
- Duration: ${duration}
- Style: ${style}
${analysis ? `- Image Analysis: Subject is "${analysis.subject}", style is "${analysis.style}", colors are ${analysis.colors?.join(', ')}, lighting is "${analysis.lighting}"` : ''}

Generate a professional prompt that describes the shot, camera movement, VFX details, and technical specifications.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
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
    const prompt = data.choices?.[0]?.message?.content;

    if (!prompt) {
      throw new Error("No prompt generated");
    }

    console.log("Prompt generated successfully");

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
