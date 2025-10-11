# 🎛️ PRO MODE SYSTEM

## 🎯 Visión General

El **Pro Mode System** es el núcleo de funcionalidades avanzadas que diferencia a los usuarios Pro de los usuarios básicos. Proporciona controles cinematográficos profesionales y capacidades de enhancement de prompts.

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PRO CONTROLS  │    │   PROMPT         │    │   BACKEND       │
│   24 Effects    │◄──►│   ENHANCER       │◄──►│   FUNCTIONS     │
│   5 Categories  │    │   AI Rewriting   │    │   Enhancement   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎨 Sistema de Efectos

### Categorías de Efectos (5 categorías, 24 efectos total):

#### 1. Visual Effects (6 efectos):
```typescript
'portal-effect': 'Portal Effect - Portal dimensional detrás del sujeto',
'building-explosion': 'Building Explosion - Explosión cinematográfica realista',
'disintegration': 'Disintegration - Desintegración en partículas luminosas',
'turning-metal': 'Turning Metal - Transformación en metal realista',
'melting-effect': 'Melting Effect - Efecto de derretimiento con física real',
'set-on-fire': 'Set on Fire - Ignición realista con física de fuego'
```

#### 2. Eyes & Face (4 efectos):
```typescript
'eyes-in': 'Eyes In (Mouth to Tunnel) - Zoom a través de los ojos - Signature effect',
'laser-eyes': 'Laser Eyes - Rayos láser desde los ojos',
'glowing-eyes': 'Glowing Eyes - Ojos brillantes con energía',
'face-morph': 'Face Morph - Morphing facial cinematográfico'
```

#### 3. Camera Controls (6 efectos):
```typescript
'crash-zoom': 'Crash Zoom In - Zoom dramático de alta velocidad',
'dolly-zoom': 'Dolly Zoom - Efecto Vertigo (Hitchcock)',
'fpv-drone': 'FPV Drone Shot - Cinematografía de dron FPV',
'360-orbit': '360° Orbit - Movimiento orbital 360 grados',
'crane-shot': 'Crane Up/Down - Movimiento de grúa revelador',
'handheld': 'Handheld Camera - Cámara en mano documental'
```

#### 4. Energy & Light (4 efectos):
```typescript
'lightning-strike': 'Lightning Strike - Rayo impactando al sujeto',
'energy-aura': 'Energy Aura - Aura de energía envolvente',
'hologram': 'Hologram - Efecto holográfico futurista',
'light-beams': 'Light Beams - Rayos de luz dramáticos'
```

#### 5. Atmospheric (4 efectos):
```typescript
'smoke-reveal': 'Smoke Reveal - Revelación a través del humo',
'fog-roll': 'Fog Roll - Niebla cinematográfica rodante',
'dust-particles': 'Dust Particles - Partículas de polvo volumétricas',
'rain-effect': 'Rain Effect - Lluvia cinematográfica'
```

## 🎛️ Controles Profesionales

### 1. Camera Controls:
```typescript
interface CameraControls {
  shotType: 'close-up' | 'medium' | 'wide' | 'extreme-close';
  cameraAngle: 'high-angle' | 'low-angle' | 'eye-level' | 'birds-eye';
  cameraMovement: 'static' | 'dolly-in' | 'dolly-out' | 'pan';
  lensType: '35mm-anamorphic' | '50mm-prime' | '85mm-portrait' | '24mm-wide';
}
```

### 2. Lighting Controls:
```typescript
interface LightingControls {
  lightingSetup: 'studio' | 'natural' | 'dramatic' | 'soft';
  keyLight: 'above-right' | 'above-left' | 'front' | 'side';
  fillLight: 'soft' | 'hard' | 'bounce' | 'none';
  rimLight: 'blue' | 'white' | 'warm' | 'none';
}
```

### 3. VFX Controls:
```typescript
interface VFXControls {
  coverage: 'entire-body' | 'face-only' | 'hands-only' | 'torso';
  intensity: number; // 30-100%
  particleType: 'dust' | 'smoke' | 'energy' | 'fire';
  direction: 'center-outward' | 'left-right' | 'top-bottom';
}
```

### 4. Style Controls:
```typescript
interface StyleControls {
  artisticStyle: 'cinematic' | 'realistic' | 'anime' | '3d-render';
  genre: 'dramatic' | 'action' | 'horror' | 'sci-fi';
  mood: 'intense' | 'calm' | 'mysterious' | 'upbeat';
}
```

### 5. Advanced Instructions:
```typescript
interface AdvancedControls {
  optimizationInstructions: string; // Texto libre para instrucciones específicas
  promptLength: 'short' | 'long';   // 220-270 vs 480-520 palabras
}
```

## 🔄 Flujo de Pro Mode

### 1. Activación de Pro Mode:
```typescript
// ProModeToggle.tsx
const handleToggle = (checked: boolean) => {
  if (checked && !canUseProFeatures()) {
    toast({
      title: "🔒 Pro Feature",
      description: "Upgrade to Pro to unlock advanced cinematic controls",
    });
    return;
  }
  onToggle(checked);
};
```

### 2. Configuración de Parámetros:
```typescript
// ProControls.tsx
const updateSetting = (key: string, value: any) => {
  const newSettings = { ...settings, [key]: value };
  console.log(`🎛️ ProControls: Updated ${key} = ${value}`);
  setSettings(newSettings);
  onSettingsChange(newSettings); // Envía a componente padre
};
```

### 3. Generación con Pro Settings:
```typescript
// Generator.tsx
const generatePrompt = async () => {
  const { data, error } = await supabase.functions.invoke('generate-prompt', {
    body: {
      effect: selectedEffect,
      intensity: 85,
      duration: '5',
      style: 'cinematic',
      analysis: imageAnalysis,
      imageBase64: imageData,
      isProMode: isProMode,        // Flag Pro Mode
      proSettings: proSettings     // Configuraciones completas
    }
  });
};
```

## ✨ Sistema de Enhancement

### Propósito:
El **Prompt Enhancer** toma un prompt existente y lo reescribe aplicando las configuraciones Pro de manera inteligente.

### Flujo de Enhancement:

#### 1. Trigger de Enhancement:
```typescript
// PromptEnhancer.tsx
const enhancePrompt = async () => {
  console.log("🚀 FRONTEND: Starting enhancement...");
  console.log("📋 FRONTEND: Pro settings being sent:", proSettings);
  
  const { data, error } = await supabase.functions.invoke('enhance-prompt', {
    body: {
      originalPrompt: originalPrompt,
      proSettings: proSettings,
      targetWordCount: originalPrompt.split(' ').length
    }
  });
};
```

#### 2. Backend Enhancement:
```typescript
// enhance-prompt/index.ts
async function enhancePromptIntelligently(
  originalPrompt: string, 
  proSettings: any
): Promise<string> {
  
  // Construir instrucciones específicas
  let instructions = "Rewrite this video prompt by naturally integrating these changes:\n\n";
  
  if (proSettings.shotType !== 'medium') {
    instructions += `- Change camera framing to: ${shotType}\n`;
  }
  
  if (proSettings.optimizationInstructions) {
    instructions += `- 🚨 ADVANCED INSTRUCTIONS (ABSOLUTE PRIORITY): ${proSettings.optimizationInstructions}\n`;
  }

  // System prompt ultra estricto
  const systemPrompt = `🚨 FORBIDDEN - INSTANT FAILURE 🚨
❌ "Here's a cinematic VFX prompt..."
❌ Any headers or introductions

✅ REQUIRED FORMAT ✅
Start IMMEDIATELY with: "A [shot type] at [angle] captures..."`;

  // Llamada a IA con temperatura ultra baja (0.05)
}
```

#### 3. Fallback System:
```typescript
// Si falla la IA, usar integración simple
const integrateSettingsSimple = (prompt: string, settings: any) => {
  let enhanced = prompt;
  
  // Reemplazos inteligentes
  if (settings.cameraMovement === 'dolly-out') {
    enhanced = enhanced.replace(/dolly.*?zoom/gi, '360-degree orbital drone shot');
  }
  
  if (settings.shotType === 'wide') {
    enhanced = enhanced.replace(/medium shot/gi, 'wide shot');
  }
  
  return enhanced;
};
```

## 🎨 UI/UX del Pro Mode

### ProControls Interface:

#### Tabs Organization:
```typescript
<Tabs defaultValue="vfx">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="vfx">VFX</TabsTrigger>
    <TabsTrigger value="camera">Camera</TabsTrigger>
    <TabsTrigger value="lighting">Light</TabsTrigger>
    <TabsTrigger value="style">Style</TabsTrigger>
  </TabsList>
</Tabs>
```

#### Effect Selection (Prioridad #1):
```typescript
<Card className="p-3 border-purple-200">
  <div className="flex items-center gap-2 mb-2">
    <Zap className="w-4 h-4 text-purple-500" />
    <Label>Effect Selection</Label>
    <Badge variant="secondary">24 Effects</Badge>
  </div>
  
  <Select value={settings.effectCategory} onValueChange={updateSetting}>
    <SelectContent>
      <SelectItem value="visual">Visual Effects (6)</SelectItem>
      <SelectItem value="eyes">Eyes & Face (4)</SelectItem>
      <SelectItem value="camera">Camera Controls (6)</SelectItem>
      <SelectItem value="energy">Energy & Light (4)</SelectItem>
      <SelectItem value="atmospheric">Atmospheric (4)</SelectItem>
    </SelectContent>
  </Select>
</Card>
```

### PromptEnhancer Interface:

#### Settings Preview:
```typescript
<div className="grid grid-cols-2 gap-2 mb-3 text-xs">
  <div className="bg-gray-800 p-2 rounded">
    <div className="font-medium">Camera</div>
    <div className="text-gray-300">
      {getDisplayValue('shotType', proSettings.shotType)} • 
      {getDisplayValue('cameraAngle', proSettings.cameraAngle)}
    </div>
  </div>
  <div className="bg-gray-800 p-2 rounded">
    <div className="font-medium">Movement</div>
    <div className="text-gray-300">
      {getDisplayValue('cameraMovement', proSettings.cameraMovement)}
    </div>
  </div>
</div>
```

#### Enhancement Button:
```typescript
<Button onClick={enhancePrompt} disabled={isEnhancing}>
  {isEnhancing ? (
    <>
      <Sparkles className="w-4 h-4 mr-1 animate-spin" />
      Enhancing...
    </>
  ) : (
    <>
      <Sparkles className="w-4 h-4 mr-1" />
      Enhance with Pro Settings
    </>
  )}
</Button>
```

## 🔧 Configuración y Estado

### Pro Settings State:
```typescript
const [settings, setSettings] = useState({
  // Effect Selection (NEW - PRIORITY)
  effectCategory: 'visual',
  selectedEffect: 'portal-effect',

  // Camera Controls
  shotType: 'medium',
  cameraAngle: 'high-angle',
  cameraMovement: 'dolly-in',
  lensType: '35mm-anamorphic',

  // Lighting Controls
  lightingSetup: 'studio',
  keyLight: 'above-right',
  fillLight: 'soft',
  rimLight: 'blue',

  // VFX Advanced
  coverage: 'entire-body',
  intensity: 85,
  particleType: 'dust',

  // Style & Mood
  artisticStyle: 'cinematic',
  mood: 'intense',

  // Advanced
  optimizationInstructions: ''
});
```

### Logging System:
```typescript
const updateSetting = (key: string, value: any) => {
  console.log(`🎛️ ProControls: Updated ${key} = ${value}`);
  console.log('📋 Full settings:', newSettings);
  setSettings(newSettings);
  onSettingsChange(newSettings);
};
```

## 🚀 Características Avanzadas

### 1. Advanced Instructions Override:
```typescript
// Las instrucciones avanzadas tienen prioridad absoluta
if (proSettings.optimizationInstructions?.includes('360 orbit')) {
  // Override todos los otros movimientos de cámara
  cameraMovement = 'complete 360-degree orbital movement';
}
```

### 2. Word Count Control:
```typescript
// Control preciso de longitud de prompts
const minWords = proSettings?.promptLength === 'long' ? 480 : 220;
const maxWords = proSettings?.promptLength === 'long' ? 520 : 270;
```

### 3. Effect Tagging System:
```typescript
interface Effect {
  id: string;
  name: string;
  description: string;
  tags: string[];      // ['popular', '3d', 'signature']
  pro?: boolean;       // Requiere Pro
}
```

### 4. Intelligent Mapping:
```typescript
// Mapeo inteligente de configuraciones
const SHOT_TYPE_MAP: Record<string, string> = {
  'close-up': 'Close-up Shot',
  'medium': 'Medium Shot',
  'wide': 'Wide Shot',
  'extreme-close': 'Extreme Close-up Shot'
};
```

## 🔮 Futuras Mejoras

### Características Planeadas:
1. **Preset Management** - Guardar/cargar configuraciones
2. **Effect Combinations** - Combinar múltiples efectos
3. **Real-time Preview** - Vista previa de cambios
4. **Advanced Analytics** - Métricas de uso de efectos
5. **Custom Effects** - Efectos definidos por usuario
6. **Batch Enhancement** - Enhancement de múltiples prompts
7. **Version History** - Historial de cambios en prompts

### Optimizaciones Técnicas:
1. **Caching** de configuraciones frecuentes
2. **Debouncing** en updates de settings
3. **Lazy loading** de efectos por categoría
4. **Performance monitoring** de enhancement
5. **A/B testing** de prompts generados