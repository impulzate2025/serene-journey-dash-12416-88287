# ✨ SISTEMA DE ENHANCEMENT DE PROMPTS

## 🎯 Visión General

El **Sistema de Enhancement** es una funcionalidad Pro que toma prompts existentes y los reescribe inteligentemente aplicando configuraciones cinematográficas avanzadas, manteniendo el contexto original pero mejorando la calidad técnica.

## 🏗️ Arquitectura del Enhancement

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ORIGINAL      │    │   ENHANCEMENT    │    │   ENHANCED      │
│   PROMPT        │───►│   ENGINE         │───►│   PROMPT        │
│   + PRO SETTINGS│    │   AI + FALLBACK  │    │   REWRITTEN     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Componentes del Sistema

### 1. PromptEnhancer.tsx (Frontend)
**Propósito**: Interfaz y coordinación del enhancement

### 2. enhance-prompt/index.ts (Backend)
**Propósito**: Función dedicada de enhancement con IA

### 3. Fallback System
**Propósito**: Sistema de respaldo si falla la IA

## 🎨 Frontend: PromptEnhancer.tsx

### Interfaz del Componente:
```typescript
interface PromptEnhancerProps {
  originalPrompt: string;        // Prompt a mejorar
  proSettings: any;              // Configuraciones Pro
  onEnhancedPrompt: (enhancedPrompt: string) => void; // Callback
}
```

### Estado del Enhancement:
```typescript
const [isEnhancing, setIsEnhancing] = useState(false);
const [enhancedPrompt, setEnhancedPrompt] = useState('');
```

### Flujo Principal de Enhancement:
```typescript
const enhancePrompt = async () => {
  setIsEnhancing(true);
  
  try {
    console.log("🚀 FRONTEND: Starting enhancement...");
    console.log("📋 FRONTEND: Pro settings being sent:", proSettings);
    console.log("📋 FRONTEND: Original prompt:", originalPrompt.substring(0, 100) + "...");
    
    // Llamar a función de enhancement
    const { data, error } = await supabase.functions.invoke('enhance-prompt', {
      body: {
        originalPrompt: originalPrompt,
        proSettings: proSettings,
        targetWordCount: originalPrompt.split(' ').length // Mantener word count similar
      }
    });

    if (error) {
      throw new Error(`Enhancement failed: ${error.message}`);
    }

    const enhanced = data.enhancedPrompt;
    
    console.log("✅ FRONTEND: Enhancement response received");
    console.log("📋 FRONTEND: Enhanced prompt:", enhanced.substring(0, 100) + "...");
    
    setEnhancedPrompt(enhanced);
    onEnhancedPrompt(enhanced);
    
    toast({
      title: "Prompt Enhanced! 🎬",
      description: `Rewritten with Pro settings (${enhanced.split(' ').length} words)`,
    });
    
  } catch (error) {
    console.error('Enhancement error:', error);
    
    // Fallback: Integración simple sin IA
    const enhanced = integrateSettingsSimple(originalPrompt, proSettings);
    setEnhancedPrompt(enhanced);
    onEnhancedPrompt(enhanced);
    
    toast({
      title: "Prompt Enhanced! 🎬",
      description: "Pro settings integrated (fallback mode)",
    });
  } finally {
    setIsEnhancing(false);
  }
};
```

### Sistema de Fallback Frontend:
```typescript
const integrateSettingsSimple = (prompt: string, settings: any) => {
  let enhanced = prompt;
  
  // Reemplazos inteligentes de movimientos de cámara
  if (settings.cameraMovement === 'dolly-out' && settings.optimizationInstructions?.includes('360 orbit')) {
    enhanced = enhanced.replace(/dolly.*?zoom/gi, '360-degree orbital drone shot');
    enhanced = enhanced.replace(/camera.*?backward/gi, 'camera executes complete 360-degree orbital movement');
  }
  
  // Reemplazos de tipos de shot
  if (settings.shotType === 'wide') {
    enhanced = enhanced.replace(/medium shot/gi, 'wide shot');
    enhanced = enhanced.replace(/close.*?shot/gi, 'wide shot');
  }
  
  // Reemplazos de ángulos
  if (settings.cameraAngle === 'eye-level') {
    enhanced = enhanced.replace(/high.*?angle/gi, 'eye-level');
    enhanced = enhanced.replace(/low.*?angle/gi, 'eye-level');
  }
  
  // Reemplazos de lentes
  if (settings.lensType === '24mm-wide') {
    enhanced = enhanced.replace(/50mm.*?200mm/gi, '24mm wide-angle lens');
    enhanced = enhanced.replace(/anamorphic.*?prime/gi, '24mm wide-angle lens');
  }
  
  // Reemplazos de partículas
  if (settings.particleType === 'energy') {
    enhanced = enhanced.replace(/dust.*?particles/gi, 'energy particles');
    enhanced = enhanced.replace(/sparkle/gi, 'energy glow');
  }
  
  // Control de word count
  const words = enhanced.split(' ');
  if (words.length > 265) {
    enhanced = words.slice(0, 265).join(' ');
  }
  
  return enhanced;
};
```

### Preview de Configuraciones:
```typescript
// Mostrar configuraciones que se aplicarán
<div className="grid grid-cols-2 gap-2 mb-3 text-xs">
  <div className="bg-gray-800 p-2 rounded border border-gray-600">
    <div className="font-medium text-white">Camera</div>
    <div className="text-gray-300">
      {getDisplayValue('shotType', proSettings.shotType)} • 
      {getDisplayValue('cameraAngle', proSettings.cameraAngle)}
    </div>
  </div>
  <div className="bg-gray-800 p-2 rounded border border-gray-600">
    <div className="font-medium text-white">Movement</div>
    <div className="text-gray-300">
      {getDisplayValue('cameraMovement', proSettings.cameraMovement)}
    </div>
  </div>
  <div className="bg-gray-800 p-2 rounded border border-gray-600">
    <div className="font-medium text-white">VFX</div>
    <div className="text-gray-300">
      {proSettings.coverage || 'entire-body'} • {proSettings.intensity || 85}%
    </div>
  </div>
  <div className="bg-gray-800 p-2 rounded border border-gray-600">
    <div className="font-medium text-white">Particles</div>
    <div className="text-gray-300">
      {proSettings.particleType || 'dust'} particles
    </div>
  </div>
</div>
```

## 🔧 Backend: enhance-prompt/index.ts

### Parámetros de Entrada:
```typescript
interface EnhancePromptRequest {
  originalPrompt: string;      // Prompt original
  proSettings: ProSettings;    // Configuraciones Pro
  targetWordCount: number;     // Word count objetivo
}
```

### Construcción de Instrucciones:
```typescript
const { originalPrompt, proSettings, targetWordCount } = await req.json();

console.log("🔧 Enhancing prompt with Pro settings...");
console.log("Original word count:", originalPrompt.split(' ').length);
console.log("Target word count:", targetWordCount);

// Construir instrucciones de enhancement
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

if (proSettings.cameraAngle && proSettings.cameraAngle !== 'high-angle') {
  const angleMap: Record<string, string> = {
    'eye-level': 'eye-level angle',
    'low-angle': 'low-angle',
    'birds-eye': 'bird\'s eye view'
  };
  instructions += `- Change camera angle to: ${angleMap[proSettings.cameraAngle]}\n`;
}

if (proSettings.cameraMovement && proSettings.cameraMovement !== 'dolly-in') {
  const movementMap: Record<string, string> = {
    'dolly-out': 'dolly-out movement (camera pulls back)',
    'static': 'static camera (no movement)',
    'pan': 'panning movement (left to right)'
  };
  instructions += `- Change camera movement to: ${movementMap[proSettings.cameraMovement]}\n`;
}

// PRIORIDAD ABSOLUTA: Advanced Instructions
if (proSettings.optimizationInstructions) {
  instructions += `- 🚨 ADVANCED INSTRUCTIONS (ABSOLUTE PRIORITY): ${proSettings.optimizationInstructions}\n`;
  instructions += `- This OVERRIDES all other camera movement settings\n`;
  instructions += `- If it says "360 orbit movement", the camera MUST do a complete 360-degree orbital shot\n`;
}
```

### Reglas de Cinematografía:
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
- START IMMEDIATELY with the scene description, no preamble

EXAMPLE CORRECT FORMAT:
"A wide shot at eye-level captures a stylish man in black sequined jacket, camera executing complete 360-degree orbital drone movement around the subject over 5 seconds using 24mm wide-angle lens at f/2.8 aperture..."

WRONG FORMAT:
"Here's a cinematic VFX prompt based on the provided image: **Shot Description:** A dynamic..."`;
```

### System Prompt Ultra Estricto:
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

### User Prompt Específico:
```typescript
const userPrompt = `REWRITE TASK:
${instructions}

ORIGINAL PROMPT:
${originalPrompt}

🚨 CRITICAL INSTRUCTIONS 🚨
- Start your response IMMEDIATELY with "A [shot type] at [angle]..."
- DO NOT write "Here's a..." or any introduction
- Write as ONE continuous paragraph
- If Advanced Instructions mention "360 orbit movement", this OVERRIDES all other camera movements
- Keep any timing mentioned in original (if 5 seconds, keep 5 seconds)
- Integrate changes naturally into the flowing text

REWRITE NOW:`;
```

### Llamada a IA con Control Estricto:
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
    temperature: 0.1, // MUY BAJA para máximo control
  }),
});
```

### Validación y Respuesta:
```typescript
const data = await response.json();
const enhancedPrompt = data.choices?.[0]?.message?.content;

if (!enhancedPrompt) {
  throw new Error("No enhanced prompt generated");
}

const finalWordCount = enhancedPrompt.trim().split(/\s+/).length;

console.log("✅ Prompt enhanced successfully");
console.log("Final word count:", finalWordCount);
console.log("Target range:", targetWordCount - 15, "-", targetWordCount + 15);

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
```

## 🎯 Casos de Uso del Enhancement

### 1. Cambio de Shot Type:
```
Original: "A medium shot of a man pointing upwards..."
Enhanced: "A wide shot of a man pointing upwards..."
```

### 2. Cambio de Ángulo de Cámara:
```
Original: "...shot at high-angle..."
Enhanced: "...shot at bird's eye view..."
```

### 3. Override con Advanced Instructions:
```
Original: "...camera dolly in movement..."
Pro Setting: optimizationInstructions = "360 orbit"
Enhanced: "...camera executing complete 360-degree orbital movement..."
```

### 4. Integración de Múltiples Cambios:
```
Original: "A medium shot at eye-level of a man, camera dolly in, using 50mm lens"
Pro Settings: {
  shotType: 'wide',
  cameraAngle: 'birds-eye',
  cameraMovement: 'dolly-out',
  lensType: '24mm-wide'
}
Enhanced: "A wide shot at bird's eye view of a man, camera dolly out, using 24mm wide-angle lens"
```

## 🚨 Problemas Conocidos y Debugging

### Problema Actual:
El enhancement no está funcionando correctamente. Los prompts enhanced son idénticos a los originales.

### Debugging Implementado:
```typescript
// Frontend logging
console.log("🚀 FRONTEND: Starting enhancement...");
console.log("📋 FRONTEND: Pro settings being sent:", proSettings);
console.log("📋 FRONTEND: Original prompt:", originalPrompt.substring(0, 100) + "...");

// Backend logging
console.log("🔧 Enhancing prompt with Pro settings...");
console.log("Original word count:", originalPrompt.split(' ').length);
console.log("Target word count:", targetWordCount);
```

### Posibles Causas:
1. **Error 401**: Problema de autenticación con Supabase
2. **Función incorrecta**: Llamando a `generate-prompt` en lugar de `enhance-prompt`
3. **IA rebelde**: Gemini ignorando instrucciones estrictas
4. **Parámetros incorrectos**: ProSettings no llegando correctamente

### Soluciones Implementadas:
1. **Cambio de función**: De `generate-prompt` a `enhance-prompt`
2. **Temperatura ultra baja**: 0.1 para máximo control
3. **System prompt agresivo**: Reglas ultra estrictas
4. **Fallback robusto**: Sistema de respaldo sin IA

## 🔮 Mejoras Futuras

### Características Planeadas:
1. **Preview en tiempo real** del enhancement
2. **Comparación lado a lado** original vs enhanced
3. **Historial de enhancements** por prompt
4. **Batch enhancement** de múltiples prompts
5. **Enhancement templates** predefinidos
6. **A/B testing** de diferentes approaches
7. **Métricas de calidad** del enhancement

### Optimizaciones Técnicas:
1. **Caching** de enhancements frecuentes
2. **Streaming responses** para UX mejorada
3. **Retry logic** con backoff exponencial
4. **Quality scoring** automático
5. **Performance monitoring** detallado