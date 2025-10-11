# 🔧 BACKEND FUNCTIONS (Supabase Edge Functions)

## 📁 Estructura de Functions

```
supabase/functions/
├── generate-prompt/     # Función principal de generación
├── enhance-prompt/      # Enhancement de prompts existentes
└── analyze-image/       # Análisis de imágenes con IA
```

## 🎯 generate-prompt/index.ts

**Propósito**: Función principal para generar prompts cinematográficos

### Características Principales:
- **Generación base** de prompts con IA
- **Pro Mode processing** con parámetros avanzados
- **Enhancement integration** para prompts existentes
- **Effect mapping** completo (24 efectos)
- **Word count control** (220-270 palabras short, 480-520 long)

### Effect Database Completa:
```typescript
const EFFECT_DESCRIPTIONS: Record<string, string> = {
  // Visual Effects (6)
  'portal-effect': 'Portal Effect - Portal dimensional detrás del sujeto',
  'building-explosion': 'Building Explosion - Explosión cinematográfica realista',
  'disintegration': 'Disintegration - Desintegración en partículas luminosas',
  'turning-metal': 'Turning Metal - Transformación en metal realista',
  'melting-effect': 'Melting Effect - Efecto de derretimiento con física real',
  'set-on-fire': 'Set on Fire - Ignición realista con física de fuego',

  // Eyes & Face (4)
  'eyes-in': 'Eyes In (Mouth to Tunnel) - Zoom a través de los ojos',
  'laser-eyes': 'Laser Eyes - Rayos láser desde los ojos',
  'glowing-eyes': 'Glowing Eyes - Ojos brillantes con energía',
  'face-morph': 'Face Morph - Morphing facial cinematográfico',

  // Camera Controls (6)
  'crash-zoom': 'Crash Zoom In - Zoom dramático de alta velocidad',
  'dolly-zoom': 'Dolly Zoom - Efecto Vertigo (Hitchcock)',
  'fpv-drone': 'FPV Drone Shot - Cinematografía de dron FPV',
  '360-orbit': '360° Orbit - Movimiento orbital 360 grados',
  'crane-shot': 'Crane Up/Down - Movimiento de grúa revelador',
  'handheld': 'Handheld Camera - Cámara en mano documental',

  // Energy & Light (4)
  'lightning-strike': 'Lightning Strike - Rayo impactando al sujeto',
  'energy-aura': 'Energy Aura - Aura de energía envolvente',
  'hologram': 'Hologram - Efecto holográfico futurista',
  'light-beams': 'Light Beams - Rayos de luz dramáticos',

  // Atmospheric (4)
  'smoke-reveal': 'Smoke Reveal - Revelación a través del humo',
  'fog-roll': 'Fog Roll - Niebla cinematográfica rodante',
  'dust-particles': 'Dust Particles - Partículas de polvo volumétricas',
  'rain-effect': 'Rain Effect - Lluvia cinematográfica'
};
```

### Parámetros de Entrada:
```typescript
interface GeneratePromptRequest {
  effect: string;                    // Effect ID
  intensity: number;                 // 30-100%
  duration: string;                  // "3", "5", etc.
  style: string;                     // "cinematic", etc.
  analysis?: ImageAnalysis;          // Análisis de imagen
  imageBase64?: string;              // Imagen base64
  isProMode?: boolean;               // Pro Mode flag
  proSettings?: ProSettings;         // Configuraciones Pro
}

interface ProSettings {
  effectCategory: string;            // 'visual', 'camera', etc.
  selectedEffect: string;            // Effect ID
  shotType: string;                  // 'close-up', 'medium', 'wide'
  cameraAngle: string;               // 'high-angle', 'eye-level', etc.
  cameraMovement: string;            // 'static', 'dolly-in', etc.
  lensType: string;                  // '35mm-anamorphic', etc.
  lightingSetup: string;             // 'studio', 'natural', etc.
  coverage: string;                  // 'entire-body', 'face-only'
  intensity: number;                 // 30-100
  particleType: string;              // 'dust', 'smoke', 'energy'
  promptLength: string;              // 'short', 'long'
  optimizationInstructions: string;  // Instrucciones personalizadas
  enhanceExisting?: boolean;         // Flag para enhancement
  originalPrompt?: string;           // Prompt original para enhancement
}
```

### Flujo de Procesamiento:

#### 1. Validación y Setup:
```typescript
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
if (!LOVABLE_API_KEY) {
  throw new Error("LOVABLE_API_KEY is not configured");
}

// Determinar word count target
const minWords = proSettings?.promptLength === 'long' ? 480 : 220;
const maxWords = proSettings?.promptLength === 'long' ? 520 : 270;
```

#### 2. Mapping de Pro Settings:
```typescript
// Mapear configuraciones Pro a descripciones legibles
const SHOT_TYPE_MAP: Record<string, string> = {
  'close-up': 'Close-up Shot',
  'medium': 'Medium Shot',
  'wide': 'Wide Shot',
  'extreme-close': 'Extreme Close-up Shot'
};

shotType = SHOT_TYPE_MAP[proSettings.shotType] || 'Medium Shot';
```

#### 3. Construcción del Prompt:
```typescript
let userPrompt = `Create a cinematic VFX prompt with these parameters:

EFFECT: ${effectDescription}
INTENSITY: ${intensity}%
DURATION: ${duration} seconds
STYLE: ${style}`;

// Agregar análisis de imagen si disponible
if (analysis) {
  userPrompt += `
IMAGE ANALYSIS:
- Subject: ${analysis.subject}
- Style: ${analysis.style}
- Colors: ${analysis.colors?.join(', ')}
- Lighting: ${analysis.lighting}`;
}
```

#### 4. Llamada a IA:
```typescript
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
          { type: "text", text: userPrompt },
          ...(imageBase64 ? [{ type: "image_url", image_url: { url: imageBase64 } }] : [])
        ]
      }
    ],
    temperature: 0.7,
    modalities: ["image", "text"]
  }),
});
```

#### 5. Post-procesamiento Pro Mode:
```typescript
if (isProMode && proSettings) {
  if (proSettings.enhanceExisting && proSettings.originalPrompt) {
    // Enhancement mode
    const enhancedResult = await enhancePromptIntelligently(
      proSettings.originalPrompt, 
      proSettings, 
      shotType, 
      cameraAngle, 
      cameraMovement, 
      lensType, 
      lightingSetup, 
      LOVABLE_API_KEY
    );
    prompt = enhancedResult;
  } else {
    // Regular Pro mode
    prompt = applyProModeEnhancements(prompt, proSettings, ...);
  }
}
```

### Enhancement Inteligente:
```typescript
async function enhancePromptIntelligently(
  originalPrompt: string, 
  proSettings: any, 
  shotType: string, 
  cameraAngle: string, 
  cameraMovement: string, 
  lensType: string, 
  lightingSetup: string, 
  apiKey: string
): Promise<string> {
  
  // Construir instrucciones específicas
  let instructions = "Rewrite this video prompt by naturally integrating these changes:\n\n";
  
  if (proSettings.shotType !== 'medium') {
    instructions += `- Change camera framing to: ${shotType}\n`;
  }
  
  if (proSettings.optimizationInstructions) {
    instructions += `- 🚨 ADVANCED INSTRUCTIONS (ABSOLUTE PRIORITY): ${proSettings.optimizationInstructions}\n`;
    instructions += `- This OVERRIDES all other camera movement settings\n`;
  }

  // System prompt ultra estricto
  const systemPrompt = `You are a prompt rewriter. Your ONLY job is to rewrite the prompt with the specified changes.

🚨 FORBIDDEN - INSTANT FAILURE 🚨
❌ "Here's a cinematic VFX prompt..."
❌ "**Prompt:**"
❌ Any headers or introductions

✅ REQUIRED FORMAT ✅
Start IMMEDIATELY with: "A [shot type] at [angle] captures..."`;

  // Llamada a IA con temperatura ultra baja
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
      temperature: 0.05, // Ultra low para máximo control
    }),
  });
}
```

### Fallback Pro Mode:
```typescript
function applyProModeEnhancements(
  originalPrompt: string, 
  proSettings: any, 
  shotType: string, 
  cameraAngle: string, 
  cameraMovement: string, 
  lensType: string, 
  lightingSetup: string
): string {
  
  let proEnhancements = `\n\n🎬 PRO MODE CINEMATOGRAPHY:\n`;
  
  proEnhancements += `CAMERA SETUP: ${shotType} at ${cameraAngle} angle using ${lensType}.\n`;
  
  // Override de movimiento para instrucciones especiales
  if (proSettings.optimizationInstructions?.includes('360 orbit')) {
    proEnhancements += `CAMERA MOVEMENT: Execute complete 360-degree orbital drone shot around subject.\n`;
  } else {
    proEnhancements += `CAMERA MOVEMENT: ${cameraMovement} throughout the sequence.\n`;
  }
  
  proEnhancements += `LIGHTING: ${lightingSetup} with ${proSettings.keyLight || 'above-right'} key light direction.\n`;
  proEnhancements += `VFX COVERAGE: Apply effect to ${proSettings.coverage || 'entire-body'} at ${proSettings.intensity || 85}% intensity.\n`;
  
  return originalPrompt + proEnhancements;
}
```

### Control de Word Count:
```typescript
const wordCount = prompt.trim().split(/\s+/).length;

if (wordCount < minWords) {
  // Agregar padding para alcanzar mínimo
  const wordsNeeded = minWords - wordCount;
  const padding = ` Additional technical specifications: Professional-grade cinematography...`.split(' ').slice(0, wordsNeeded).join(' ');
  prompt = prompt + padding;
}

if (wordCount > maxWords) {
  // Truncar para no exceder máximo
  prompt = prompt.trim().split(/\s+/).slice(0, maxWords).join(' ');
}
```

## ✨ enhance-prompt/index.ts

**Propósito**: Función dedicada para enhancement de prompts existentes

### Características:
- **Reescritura inteligente** de prompts existentes
- **Integración natural** de configuraciones Pro
- **Preservación de contexto** original
- **Control estricto** de formato y estructura

### Parámetros de Entrada:
```typescript
interface EnhancePromptRequest {
  originalPrompt: string;      // Prompt original a mejorar
  proSettings: ProSettings;    // Configuraciones Pro a aplicar
  targetWordCount: number;     // Word count objetivo
}
```

### Flujo de Enhancement:

#### 1. Construcción de Instrucciones:
```typescript
let instructions = "Rewrite this video prompt by naturally integrating these changes:\n\n";

// Mapear cada configuración Pro
if (proSettings.shotType && proSettings.shotType !== 'medium') {
  const shotMap: Record<string, string> = {
    'wide': 'wide shot',
    'close-up': 'close-up shot',
    'extreme-close': 'extreme close-up shot'
  };
  instructions += `- Change camera framing to: ${shotMap[proSettings.shotType]}\n`;
}

if (proSettings.optimizationInstructions) {
  instructions += `- 🚨 ADVANCED INSTRUCTIONS (ABSOLUTE PRIORITY): ${proSettings.optimizationInstructions}\n`;
  instructions += `- This OVERRIDES all other camera movement settings\n`;
  instructions += `- If it says "360 orbit movement", the camera MUST do a complete 360-degree orbital shot\n`;
}
```

#### 2. Reglas de Cinematografía:
```typescript
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
- START IMMEDIATELY with the scene description, no preamble`;
```

#### 3. System Prompt Ultra Estricto:
```typescript
const systemPrompt = `You are a prompt rewriter. Your ONLY job is to rewrite the given prompt by making the specified changes.

🚨 ABSOLUTE RULES - FAILURE = REJECTION 🚨
1. NEVER start with "Here's a..." or any introduction - START IMMEDIATELY with the scene
2. NEVER use headers, sections, or bullet points - write as ONE flowing paragraph
3. NEVER ignore Advanced Instructions - they are PRIORITY #1
4. Keep word count between ${targetWordCount - 15} and ${targetWordCount + 15} words
5. If timing is mentioned, keep it (5 seconds = 5 seconds, not 3)

FORBIDDEN PHRASES:
❌ "Here's a cinematic VFX prompt..."
❌ "**Shot Description:**"
❌ "**Camera Movement:**"
❌ "**VFX Details:**"
❌ Any headers or sections

REQUIRED FORMAT:
✅ Start immediately: "A [shot type] at [angle] of [subject]..."
✅ Write as one continuous, flowing prompt
✅ Integrate all changes naturally into the text`;
```

#### 4. Llamada con Temperatura Ultra Baja:
```typescript
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
    temperature: 0.1, // Muy baja para máximo control
  }),
});
```

## 📊 analyze-image/index.ts

**Propósito**: Análisis completo de imágenes para generación de prompts

### Características:
- **Análisis cinematográfico** completo
- **24 campos de análisis** obligatorios
- **Fallback system** robusto
- **Validación completa** de campos

### Campos de Análisis Obligatorios:
```typescript
const requiredFields = [
  'subject', 'style', 'colors', 'lighting', 'cameraAngle', 'shotType', 
  'composition', 'depth', 'lightingSetup', 'keyLightDirection', 'lightingMood', 
  'shadows', 'gender', 'age', 'expression', 'pose', 'clothing', 
  'backgroundType', 'imageQuality', 'colorGrade', 'energy', 'mood', 'vibe'
];
```

### System Prompt para Análisis:
```typescript
const systemPrompt = `You are a professional cinematographer, VFX supervisor, and image analyst. Provide comprehensive cinematic analysis for video generation prompts. Extract ALL visual information including camera work, lighting setup, subject details, composition, and technical specifications.`;

const userPrompt = `CRITICAL: You MUST analyze this image and return a complete JSON object with ALL fields filled. Never leave any field empty or undefined.

Analyze this image for cinematic video generation and return EXACTLY this JSON structure with ALL fields completed:

{
  "subject": "detailed subject description (4-8 words)",
  "style": "photography/cinematography style",
  "colors": ["color1", "color2", "color3"],
  "lighting": "lighting type",
  "cameraAngle": "high-angle OR low-angle OR eye-level OR birds-eye OR worms-eye",
  "shotType": "close-up OR medium OR wide OR extreme-close-up OR full-body",
  // ... más campos
}

RULES:
1. Fill EVERY single field - no empty values allowed
2. Use ONLY the exact options provided after "OR"
3. Choose the most accurate option for each field
4. Return valid JSON only, no explanations or markdown
5. If unsure, pick the closest matching option`;
```

### Validación y Fallback:
```typescript
// Parsear JSON de la respuesta
let analysis;
try {
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
  const parsedAnalysis = JSON.parse(jsonStr);
  
  // Validar y llenar campos faltantes
  analysis = { ...parsedAnalysis };
  requiredFields.forEach(field => {
    if (!analysis[field] || analysis[field] === '' || analysis[field] === null) {
      const defaults: Record<string, any> = {
        subject: "Portrait subject",
        style: "Cinematic",
        colors: ["Blue", "Silver", "Black"],
        lighting: "Studio",
        cameraAngle: "eye-level",
        shotType: "medium",
        // ... más defaults
      };
      analysis[field] = defaults[field];
    }
  });
  
} catch (e) {
  // Fallback completo si falla el parsing
  analysis = {
    subject: "Professional portrait subject",
    style: "Cinematic portrait",
    colors: ["Blue", "Silver", "Black"],
    lighting: "Studio lighting",
    // ... análisis completo por defecto
  };
}
```

## 🔐 Configuración de Seguridad

### CORS Headers:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

### JWT Verification:
```toml
# supabase/config.toml
[functions.analyze-image]
verify_jwt = true

[functions.generate-prompt]
verify_jwt = true
```

### Environment Variables:
```typescript
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
if (!LOVABLE_API_KEY) {
  throw new Error("LOVABLE_API_KEY is not configured");
}
```

## 🚨 Error Handling

### Rate Limiting:
```typescript
if (response.status === 429) {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### Credits Depletion:
```typescript
if (response.status === 402) {
  return new Response(
    JSON.stringify({ error: "Credits depleted. Please add funds to your workspace." }),
    { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### Logging Completo:
```typescript
console.log("🚨 DEBUGGING BACKEND PARAMETERS:");
console.log("Pro Mode:", isProMode);
console.log("Effect received:", effect);
console.log("📋 FULL PRO SETTINGS RECEIVED:");
console.log(JSON.stringify(proSettings, null, 2));
```

## 📈 Performance Optimizations

### Deno Runtime:
- **Edge deployment** para baja latencia
- **Automatic scaling** por Supabase
- **Connection pooling** automático

### AI Gateway Optimizations:
- **Model selection** optimizado (Gemini 2.5 Flash)
- **Temperature control** para consistencia
- **Modality support** para imagen + texto