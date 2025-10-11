# 🎨 FRONTEND COMPONENTS

## 📁 Estructura de Componentes

```
src/components/
├── ui/                    # Componentes base (shadcn/ui)
├── ProControls.tsx        # Controles Pro Mode
├── PromptEnhancer.tsx     # Sistema de enhancement
├── ProModeToggle.tsx      # Toggle Pro/Simple
├── AIAnalysisDisplay.tsx  # Display de análisis IA
├── ProTeaser.tsx          # Teaser para upgrade
└── ProtectedRoute.tsx     # Rutas protegidas
```

## 🎛️ ProControls.tsx

**Propósito**: Controles avanzados para usuarios Pro

### Características Principales:
- **24 efectos organizados** en 5 categorías
- **Tabs system** para organizar controles
- **Real-time updates** con logging completo
- **Effect database** completa con tags

### Categorías de Efectos:
```typescript
const EFFECTS_DATABASE = {
  visual: [
    'portal-effect', 'building-explosion', 'disintegration',
    'turning-metal', 'melting-effect', 'set-on-fire'
  ],
  eyes: [
    'eyes-in', 'laser-eyes', 'glowing-eyes', 'face-morph'
  ],
  camera: [
    'crash-zoom', 'dolly-zoom', 'fpv-drone', 
    '360-orbit', 'crane-shot', 'handheld'
  ],
  energy: [
    'lightning-strike', 'energy-aura', 'hologram', 'light-beams'
  ],
  atmospheric: [
    'smoke-reveal', 'fog-roll', 'dust-particles', 'rain-effect'
  ]
}
```

### Controles Disponibles:
1. **Effect Selection** (Prioridad #1)
   - Category selector
   - Effect selector con descriptions
   - Pro badges para efectos premium

2. **Camera Controls**
   - Shot Type: close-up, medium, wide, extreme-close
   - Camera Angle: high-angle, low-angle, eye-level, birds-eye
   - Movement: static, dolly-in, dolly-out, pan
   - Lens: 35mm-anamorphic, 50mm-prime, 85mm-portrait, 24mm-wide

3. **Lighting Controls**
   - Setup: studio, natural, dramatic, soft
   - Key Light: above-right, above-left, front, side
   - Fill Light: soft, hard, bounce, none
   - Rim Light: blue, white, warm, none

4. **VFX Controls**
   - Coverage: entire-body, face-only, hands-only, torso
   - Particle Type: dust, smoke, energy, fire
   - Intensity: 30-100% slider

5. **Style Controls**
   - Artistic Style: cinematic, realistic, anime, 3d-render
   - Mood: dramatic, mysterious, energetic, calm

6. **Advanced Instructions**
   - Textarea para instrucciones personalizadas
   - Ejemplos: "360 orbit", "slow dolly", "dramatic lighting"

### State Management:
```typescript
const [settings, setSettings] = useState({
  effectCategory: 'visual',
  selectedEffect: 'portal-effect',
  shotType: 'medium',
  cameraAngle: 'high-angle',
  // ... más configuraciones
});

const updateSetting = (key: string, value: any) => {
  const newSettings = { ...settings, [key]: value };
  console.log(`🎛️ ProControls: Updated ${key} = ${value}`);
  setSettings(newSettings);
  onSettingsChange(newSettings);
};
```

## ✨ PromptEnhancer.tsx

**Propósito**: Sistema para mejorar prompts existentes con configuraciones Pro

### Funcionalidad Principal:
1. **Enhancement con IA**
   - Llama a `enhance-prompt` function
   - Reescribe prompts inteligentemente
   - Mantiene contexto original

2. **Fallback System**
   - Si falla la IA, usa integración simple
   - Reemplazos inteligentes de texto
   - Mantiene word count

3. **Preview de Settings**
   - Muestra configuraciones Pro aplicadas
   - Grid de 4 cards con info resumida
   - Advanced instructions destacadas

### Flujo de Enhancement:
```typescript
const enhancePrompt = async () => {
  try {
    // 1. Llamar a enhance-prompt function
    const { data, error } = await supabase.functions.invoke('enhance-prompt', {
      body: {
        originalPrompt: originalPrompt,
        proSettings: proSettings,
        targetWordCount: originalPrompt.split(' ').length
      }
    });

    // 2. Procesar respuesta
    const enhanced = data.enhancedPrompt;
    setEnhancedPrompt(enhanced);
    onEnhancedPrompt(enhanced);
    
  } catch (error) {
    // 3. Fallback si falla
    const enhanced = integrateSettingsSimple(originalPrompt, proSettings);
    setEnhancedPrompt(enhanced);
  }
};
```

### Fallback Integration:
```typescript
const integrateSettingsSimple = (prompt: string, settings: any) => {
  let enhanced = prompt;
  
  // Reemplazos inteligentes
  if (settings.cameraMovement === 'dolly-out') {
    enhanced = enhanced.replace(/dolly.*?zoom/gi, '360-degree orbital drone shot');
  }
  
  if (settings.shotType === 'wide') {
    enhanced = enhanced.replace(/medium shot/gi, 'wide shot');
  }
  
  // Mantener word count
  const words = enhanced.split(' ');
  if (words.length > 265) {
    enhanced = words.slice(0, 265).join(' ');
  }
  
  return enhanced;
};
```

## 🔄 ProModeToggle.tsx

**Propósito**: Toggle entre modo Simple y Pro

### Características:
- **Subscription check** antes de activar Pro
- **Visual feedback** con Crown icon para usuarios free
- **Toast notifications** para upgrade prompts

```typescript
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

## 📊 AIAnalysisDisplay.tsx

**Propósito**: Mostrar análisis de IA de imágenes

### Dos Modos de Display:

#### Modo Freemium:
```typescript
// Display básico para usuarios free
<ul className="space-y-2 text-sm">
  <li>• Subject: {analysis.subject}</li>
  <li>• Style: {analysis.style}</li>
  <li>• Colors: {analysis.colors?.join(", ")}</li>
  <li>• Lighting: {analysis.lighting}</li>
</ul>
```

#### Modo Pro:
- **5 tabs** con análisis completo
- **Basic**: Subject, style, lighting, energy, colors
- **Camera**: Angle, shot type, composition, depth
- **Lighting**: Setup, key light, mood, shadows
- **Subject**: Gender, age, expression, pose, clothing, vibe
- **Technical**: Background, quality, color grade, mood

## 🛡️ ProtectedRoute.tsx

**Propósito**: Proteger rutas que requieren autenticación

```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};
```

## 🎁 ProTeaser.tsx

**Propósito**: Mostrar beneficios Pro y promover upgrade

### Características:
- **Feature highlights** con iconos
- **Pricing display**
- **Call-to-action** buttons
- **Social proof** elements

## 📱 Responsive Design

### Breakpoints:
```css
/* Mobile First */
.grid-cols-1 { /* Mobile */ }
.sm:grid-cols-2 { /* Tablet */ }
.lg:grid-cols-3 { /* Desktop */ }
.xl:grid-cols-4 { /* Large Desktop */ }
```

### Mobile Optimizations:
- **Collapsible tabs** en ProControls
- **Stacked layout** para cards
- **Touch-friendly** controls
- **Reduced text** en mobile

## 🎨 Styling System

### Theme Variables:
```css
:root {
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-accent: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --shadow-glow: 0 0 20px rgba(102, 126, 234, 0.3);
}
```

### Component Styling:
- **Consistent spacing** con Tailwind
- **Dark mode support** automático
- **Animations** con tailwindcss-animate
- **Custom gradients** para Pro features

## 🔧 Performance Optimizations

### React Optimizations:
```typescript
// Memoization para componentes pesados
const ProControls = memo(({ onSettingsChange }) => {
  // Component logic
});

// useCallback para funciones
const handleSettingChange = useCallback((key, value) => {
  // Update logic
}, []);
```

### Bundle Optimizations:
- **Lazy loading** para componentes grandes
- **Tree shaking** automático
- **Code splitting** por rutas