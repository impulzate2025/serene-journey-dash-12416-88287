import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Wand2, Copy, Camera, Move, Zap, Atom, Lightbulb, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PromptEnhancerProps {
  originalPrompt: string;
  proSettings: any;
  onEnhancedPrompt: (enhancedPrompt: string) => void;
}

export const PromptEnhancer = ({ originalPrompt, proSettings, onEnhancedPrompt }: PromptEnhancerProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const { toast } = useToast();

  // 🎛️ ENHANCEMENT TOGGLES - Usuario controla qué categorías aplicar
  const [enhancementToggles, setEnhancementToggles] = useState({
    camera: false,      // Shot Type, Angle, Lens
    movement: false,    // Camera Movement
    vfx: false,         // Coverage, Intensity
    particles: false,   // Particle Type, Direction
    lighting: false,    // Setup, Key Light, Fill Light, Rim Light
    style: false        // Artistic Style, Mood
  });

  const toggleEnhancement = (category: keyof typeof enhancementToggles) => {
    setEnhancementToggles(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // 🚀 AUTO-DETECT: Activar toggles automáticamente cuando hay configuraciones no-default
  useEffect(() => {
    const autoToggles = {
      camera: false,
      movement: false,
      vfx: false,
      particles: false,
      lighting: false,
      style: false
    };

    // Detectar cambios en Camera (cualquier configuración activa)
    if (proSettings.shotType || proSettings.cameraAngle || proSettings.lensType) {
      autoToggles.camera = true;
    }

    // Detectar cambios en Movement
    if (proSettings.cameraMovement) {
      autoToggles.movement = true;
    }

    // Detectar cambios en VFX
    if (proSettings.coverage || proSettings.intensity) {
      autoToggles.vfx = true;
    }

    // Detectar cambios en Particles
    if (proSettings.particleType) {
      autoToggles.particles = true;
    }

    // Detectar cambios en Lighting
    if (proSettings.lightingSetup || proSettings.keyLight || proSettings.fillLight || proSettings.rimLight) {
      autoToggles.lighting = true;
    }

    // Detectar cambios en Style
    if (proSettings.artisticStyle || proSettings.mood) {
      autoToggles.style = true;
    }

    // Advanced Instructions siempre activa movement
    if (proSettings.optimizationInstructions) autoToggles.movement = true;

    // Contar categorías auto-detectadas
    const activeCount = Object.values(autoToggles).filter(Boolean).length;
    console.log(`🎯 AUTO-DETECT: ${activeCount} categorías detectadas automáticamente:`, autoToggles);

    setEnhancementToggles(autoToggles);
  }, [proSettings]);

  // 🔧 FILTRAR SETTINGS: Solo incluir configuraciones de categorías activadas
  const filterSettingsByToggles = (settings: any, toggles: typeof enhancementToggles) => {
    const filtered: any = {};

    // Camera: Shot Type, Angle, Lens
    if (toggles.camera) {
      if (settings.shotType) filtered.shotType = settings.shotType;
      if (settings.cameraAngle) filtered.cameraAngle = settings.cameraAngle;
      if (settings.lensType) filtered.lensType = settings.lensType;
    }

    // Movement: Camera Movement específico
    if (toggles.movement) {
      if (settings.cameraMovement) filtered.cameraMovement = settings.cameraMovement;
    }

    // VFX: Coverage, Intensity
    if (toggles.vfx) {
      if (settings.coverage) filtered.coverage = settings.coverage;
      if (settings.intensity) filtered.intensity = settings.intensity;
    }

    // Particles: Tipo y dirección
    if (toggles.particles) {
      if (settings.particleType) filtered.particleType = settings.particleType;
      if (settings.direction) filtered.direction = settings.direction;
    }

    // Lighting: Setup, Key Light, Fill Light, Rim Light
    if (toggles.lighting) {
      if (settings.lightingSetup) filtered.lightingSetup = settings.lightingSetup;
      if (settings.keyLight) filtered.keyLight = settings.keyLight;
      if (settings.fillLight) filtered.fillLight = settings.fillLight;
      if (settings.rimLight) filtered.rimLight = settings.rimLight;
    }

    // Style: Artistic Style, Mood
    if (toggles.style) {
      if (settings.artisticStyle) filtered.artisticStyle = settings.artisticStyle;
      if (settings.mood) filtered.mood = settings.mood;
    }

    // Siempre incluir Advanced Instructions (máxima prioridad)
    if (settings.optimizationInstructions) {
      filtered.optimizationInstructions = settings.optimizationInstructions;
    }

    return filtered;
  };

  const enhancePrompt = async () => {
    setIsEnhancing(true);
    
    try {
      console.log("🚀 FRONTEND: Starting enhancement...");
      console.log("📋 FRONTEND: Pro settings being sent:", proSettings);
      console.log("📋 FRONTEND: Original prompt:", originalPrompt.substring(0, 100) + "...");
      
      // 🎯 FILTRAR SETTINGS: Solo enviar configuraciones de categorías activadas
      const filteredSettings = filterSettingsByToggles(proSettings, enhancementToggles);
      
      console.log("🎛️ FRONTEND: Enhancement toggles:", enhancementToggles);
      console.log("🎛️ FRONTEND: Filtered settings:", filteredSettings);

      // Call enhance-prompt function using Supabase client
      const { data, error } = await supabase.functions.invoke('enhance-prompt', {
        body: {
          originalPrompt: originalPrompt,
          proSettings: filteredSettings,
          enhancementToggles: enhancementToggles, // Enviar toggles para logging
          targetWordCount: originalPrompt.split(' ').length
        }
      });

      if (error) {
        throw new Error(`Enhancement failed: ${error.message}`);
      }
      const enhanced = data.enhancedPrompt; // Use 'enhancedPrompt' field from enhance-prompt response

      console.log("✅ FRONTEND: Enhancement response received");
      console.log("📋 FRONTEND: Enhanced prompt:", enhanced.substring(0, 100) + "...");
      console.log("📋 FRONTEND: Word count:", enhanced.split(' ').length);

      setEnhancedPrompt(enhanced);
      onEnhancedPrompt(enhanced);
      
      toast({
        title: "Prompt Enhanced! 🎬",
        description: `Rewritten with Pro settings (${enhanced.split(' ').length} words)`,
      });
      
    } catch (error) {
      console.error('🚨 FRONTEND: Enhancement error:', error);
      
      // Verificar si hay toggles activados
      const activeToggles = Object.values(enhancementToggles).filter(Boolean).length;
      if (activeToggles === 0) {
        toast({
          title: "No Categories Selected",
          description: "Please activate at least one enhancement category",
          variant: "destructive",
        });
        return;
      }
      
      // Mostrar error específico pero continuar con fallback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log("🔧 FRONTEND: AI enhancement failed, using local fallback:", errorMessage);
      
      // Fallback: Simple integration without AI rewriting
      const filteredSettingsFallback = filterSettingsByToggles(proSettings, enhancementToggles);
      console.log("🔧 FRONTEND: Using fallback with settings:", filteredSettingsFallback);
      
      if (Object.keys(filteredSettingsFallback).length === 0) {
        toast({
          title: "No Settings to Apply",
          description: "No configurations found for selected categories",
          variant: "destructive",
        });
        return;
      }
      
      const enhanced = integrateSettingsSimple(originalPrompt, filteredSettingsFallback);
      setEnhancedPrompt(enhanced);
      onEnhancedPrompt(enhanced);
      
      toast({
        title: "Enhanced (Local Mode) 🔧",
        description: `Applied ${activeToggles} categories using local processing`,
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const integrateSettingsSimple = (prompt: string, settings: any) => {
    let enhanced = prompt;
    
    console.log("🔧 LOCAL FALLBACK: Starting integration with settings:", settings);
    console.log("🔧 LOCAL FALLBACK: Original prompt:", prompt.substring(0, 100) + "...");
    
    // Replace shot types - más agresivo
    if (settings.shotType) {
      const shotMap: Record<string, string> = {
        'wide': 'wide shot',
        'medium': 'medium shot', 
        'close-up': 'close-up shot',
        'extreme-close': 'extreme close-up shot'
      };
      const newShot = shotMap[settings.shotType];
      if (newShot && newShot !== 'medium shot') { // Solo cambiar si no es medium (default)
        // Buscar y reemplazar diferentes variaciones
        enhanced = enhanced.replace(/\b(wide|medium|close-up|extreme close-up)\s+shot\b/gi, newShot);
        enhanced = enhanced.replace(/\bmid-shot\b/gi, newShot);
        enhanced = enhanced.replace(/\bmedium\s+shot\b/gi, newShot);
        enhanced = enhanced.replace(/\bstudio\s+portrait\b/gi, `${newShot} studio portrait`);
        console.log("🎬 LOCAL FALLBACK: Applied shot type:", newShot);
      }
    }
    
    // Replace camera angles - más agresivo
    if (settings.cameraAngle) {
      const angleMap: Record<string, string> = {
        'high-angle': 'shot from a high angle',
        'low-angle': 'shot from a low angle', 
        'eye-level': 'shot at eye level',
        'bird-eye': 'bird\'s-eye view shot'
      };
      const newAngle = angleMap[settings.cameraAngle];
      if (newAngle && settings.cameraAngle !== 'high-angle') { // Solo cambiar si no es high-angle (default)
        // Buscar diferentes variaciones de ángulos
        enhanced = enhanced.replace(/\b(high-angle|low-angle|eye-level|bird's-eye)\b/gi, newAngle);
        enhanced = enhanced.replace(/\bfrom\s+(above|below|high|low)\b/gi, newAngle);
        enhanced = enhanced.replace(/\bcinematic\s+studio\s+portrait\b/gi, `cinematic ${newAngle} studio portrait`);
        console.log("📐 LOCAL FALLBACK: Applied camera angle:", newAngle);
      }
    }
    
    // Replace lens types
    if (settings.lensType) {
      const lensMap: Record<string, string> = {
        '24mm-wide': '24mm wide-angle lens',
        '35mm-anamorphic': '35mm anamorphic lens',
        '50mm-prime': '50mm prime lens',
        '85mm-portrait': '85mm portrait lens'
      };
      const newLens = lensMap[settings.lensType];
      if (newLens) {
        enhanced = enhanced.replace(/\b(24mm|35mm|50mm|85mm)[\w\s-]*lens\b/gi, newLens);
        console.log("🔍 LOCAL FALLBACK: Applied lens type:", newLens);
      }
    }
    
    // Replace camera movements
    if (settings.cameraMovement) {
      const movementMap: Record<string, string> = {
        'dolly-in': 'dolly-in movement',
        'dolly-out': 'dolly-out movement',
        'pan-left': 'pan left movement',
        'pan-right': 'pan right movement',
        'tilt-up': 'tilt up movement',
        'tilt-down': 'tilt down movement'
      };
      const newMovement = movementMap[settings.cameraMovement];
      if (newMovement) {
        enhanced = enhanced.replace(/\b(dolly-in|dolly-out|pan\s+left|pan\s+right|tilt\s+up|tilt\s+down)[\w\s-]*\b/gi, newMovement);
        console.log("🎬 LOCAL FALLBACK: Applied camera movement:", newMovement);
      }
    }
    
    // Ensure word count stays within range
    const words = enhanced.split(' ');
    if (words.length > 265) {
      enhanced = words.slice(0, 265).join(' ');
    }
    
    console.log("✅ LOCAL FALLBACK: Final enhanced prompt:", enhanced.substring(0, 150) + "...");
    console.log("📊 LOCAL FALLBACK: Word count:", words.length);
    console.log("🔄 LOCAL FALLBACK: Changes made:", enhanced !== prompt ? "YES" : "NO");
    
    return enhanced;
  };

  const getDisplayValue = (type: string, value: string) => {
    const maps: Record<string, Record<string, string>> = {
      shotType: {
        'close-up': 'Close-up Shot',
        'medium': 'Medium Shot',
        'wide': 'Wide Shot',
        'extreme-close': 'Extreme Close-up Shot'
      },
      cameraAngle: {
        'high-angle': 'High-angle',
        'low-angle': 'Low-angle',
        'eye-level': 'Eye-level',
        'birds-eye': 'Bird\'s eye view'
      },
      cameraMovement: {
        'static': 'Static camera',
        'dolly-in': 'Dolly in',
        'dolly-out': 'Dolly out',
        'pan': 'Pan left/right'
      },
      lensType: {
        '35mm-anamorphic': '35mm Anamorphic',
        '50mm-prime': '50mm Prime',
        '85mm-portrait': '85mm Portrait',
        '24mm-wide': '24mm Wide'
      },
      lightingSetup: {
        'studio': 'Studio Professional',
        'natural': 'Natural Light',
        'dramatic': 'Dramatic Moody',
        'soft': 'Soft Portrait'
      }
    };
    
    return maps[type]?.[value] || value || 'Default';
  };

  const copyEnhancedPrompt = async () => {
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      toast({
        title: "Copied! 📋",
        description: "Enhanced prompt copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 border-purple-200 dark:border-purple-800 bg-black dark:bg-black text-white dark:text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-sm">Prompt Enhancer</h3>
          <Badge variant="secondary" className="text-xs">Pro Mode</Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={enhancePrompt}
            disabled={isEnhancing || Object.values(enhancementToggles).every(v => !v)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {isEnhancing ? (
              <>
                <Sparkles className="w-4 h-4 mr-1 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1" />
                Enhance ({Object.values(enhancementToggles).filter(Boolean).length}/6)
              </>
            )}
          </Button>
          
          {/* Debug button - temporal */}
          <Button
            onClick={() => {
              console.log("🔍 DEBUG: Enhancement toggles:", enhancementToggles);
              console.log("🔍 DEBUG: Pro settings:", proSettings);
              console.log("🔍 DEBUG: Filtered settings:", filterSettingsByToggles(proSettings, enhancementToggles));
            }}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            Debug
          </Button>
        </div>
      </div>

      <div className="text-xs text-gray-300 mb-3">
        Choose which categories to enhance:
      </div>

      {/* Auto-detection info */}
      {Object.values(enhancementToggles).some(v => v) && (
        <div className="bg-blue-900/20 border border-blue-600 rounded p-2 mb-3">
          <div className="text-xs text-blue-300">
            ✨ Auto-detected {Object.values(enhancementToggles).filter(Boolean).length} categories with non-default settings
          </div>
        </div>
      )}

      {/* Warning cuando no hay toggles activados */}
      {Object.values(enhancementToggles).every(v => !v) && (
        <div className="bg-amber-900/20 border border-amber-600 rounded p-2 mb-3">
          <div className="text-xs text-amber-300">
            ⚠️ Select at least one category to enable enhancement
          </div>
        </div>
      )}

      {/* 🎛️ ENHANCEMENT TOGGLES */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-400" />
            <Label className="text-xs font-medium text-white">Camera</Label>
          </div>
          <Switch
            checked={enhancementToggles.camera}
            onCheckedChange={() => toggleEnhancement('camera')}
            className="scale-75"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-green-400" />
            <Label className="text-xs font-medium text-white">Movement</Label>
          </div>
          <Switch
            checked={enhancementToggles.movement}
            onCheckedChange={() => toggleEnhancement('movement')}
            className="scale-75"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <Label className="text-xs font-medium text-white">VFX</Label>
          </div>
          <Switch
            checked={enhancementToggles.vfx}
            onCheckedChange={() => toggleEnhancement('vfx')}
            className="scale-75"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-purple-400" />
            <Label className="text-xs font-medium text-white">Particles</Label>
          </div>
          <Switch
            checked={enhancementToggles.particles}
            onCheckedChange={() => toggleEnhancement('particles')}
            className="scale-75"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-orange-400" />
            <Label className="text-xs font-medium text-white">Lighting</Label>
          </div>
          <Switch
            checked={enhancementToggles.lighting}
            onCheckedChange={() => toggleEnhancement('lighting')}
            className="scale-75"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-400" />
            <Label className="text-xs font-medium text-white">Style</Label>
          </div>
          <Switch
            checked={enhancementToggles.style}
            onCheckedChange={() => toggleEnhancement('style')}
            className="scale-75"
          />
        </div>
      </div>

      {/* Pro Settings Preview - Visual feedback de qué se aplicará */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className={`p-2 rounded border transition-all ${
          enhancementToggles.camera 
            ? 'bg-blue-900/30 border-blue-500 text-blue-100' 
            : 'bg-gray-800 border-gray-600 text-gray-500'
        }`}>
          <div className="font-medium flex items-center gap-1">
            <Camera className="w-3 h-3" />
            Camera {enhancementToggles.camera ? '✓' : '○'}
          </div>
          <div className="text-xs">
            {getDisplayValue('shotType', proSettings.shotType)} • {getDisplayValue('cameraAngle', proSettings.cameraAngle)}
          </div>
        </div>
        
        <div className={`p-2 rounded border transition-all ${
          enhancementToggles.movement 
            ? 'bg-green-900/30 border-green-500 text-green-100' 
            : 'bg-gray-800 border-gray-600 text-gray-500'
        }`}>
          <div className="font-medium flex items-center gap-1">
            <Move className="w-3 h-3" />
            Movement {enhancementToggles.movement ? '✓' : '○'}
          </div>
          <div className="text-xs">
            {getDisplayValue('cameraMovement', proSettings.cameraMovement)}
          </div>
        </div>
        
        <div className={`p-2 rounded border transition-all ${
          enhancementToggles.vfx 
            ? 'bg-yellow-900/30 border-yellow-500 text-yellow-100' 
            : 'bg-gray-800 border-gray-600 text-gray-500'
        }`}>
          <div className="font-medium flex items-center gap-1">
            <Zap className="w-3 h-3" />
            VFX {enhancementToggles.vfx ? '✓' : '○'}
          </div>
          <div className="text-xs">
            {proSettings.coverage || 'entire-body'} • {proSettings.intensity || 85}%
          </div>
        </div>
        
        <div className={`p-2 rounded border transition-all ${
          enhancementToggles.particles 
            ? 'bg-purple-900/30 border-purple-500 text-purple-100' 
            : 'bg-gray-800 border-gray-600 text-gray-500'
        }`}>
          <div className="font-medium flex items-center gap-1">
            <Atom className="w-3 h-3" />
            Particles {enhancementToggles.particles ? '✓' : '○'}
          </div>
          <div className="text-xs">
            {proSettings.particleType || 'dust'} particles
          </div>
        </div>

        <div className={`p-2 rounded border transition-all ${
          enhancementToggles.lighting 
            ? 'bg-orange-900/30 border-orange-500 text-orange-100' 
            : 'bg-gray-800 border-gray-600 text-gray-500'
        }`}>
          <div className="font-medium flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Lighting {enhancementToggles.lighting ? '✓' : '○'}
          </div>
          <div className="text-xs">
            {getDisplayValue('lightingSetup', proSettings.lightingSetup)} • {getDisplayValue('keyLight', proSettings.keyLight)}
          </div>
        </div>

        <div className={`p-2 rounded border transition-all ${
          enhancementToggles.style 
            ? 'bg-pink-900/30 border-pink-500 text-pink-100' 
            : 'bg-gray-800 border-gray-600 text-gray-500'
        }`}>
          <div className="font-medium flex items-center gap-1">
            <Palette className="w-3 h-3" />
            Style {enhancementToggles.style ? '✓' : '○'}
          </div>
          <div className="text-xs">
            {getDisplayValue('artisticStyle', proSettings.artisticStyle)} • {getDisplayValue('mood', proSettings.mood)}
          </div>
        </div>
      </div>

      {/* Advanced Instructions - Siempre se aplican */}
      {proSettings.optimizationInstructions && (
        <div className="bg-amber-900/20 border border-amber-600 p-2 rounded mb-3">
          <div className="text-xs font-medium text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Advanced Instructions (Always Applied):
          </div>
          <div className="text-xs text-amber-400 mt-1">{proSettings.optimizationInstructions}</div>
        </div>
      )}

      {/* Summary de qué se aplicará */}
      {Object.values(enhancementToggles).some(v => v) && (
        <div className="bg-green-900/20 border border-green-600 p-2 rounded mb-3">
          <div className="text-xs font-medium text-green-300 mb-1">Will be applied:</div>
          <div className="text-xs text-green-400 space-y-1">
            {enhancementToggles.camera && (
              <div>• Camera: {getDisplayValue('shotType', proSettings.shotType)}, {getDisplayValue('cameraAngle', proSettings.cameraAngle)}</div>
            )}
            {enhancementToggles.movement && (
              <div>• Movement: {getDisplayValue('cameraMovement', proSettings.cameraMovement)}</div>
            )}
            {enhancementToggles.vfx && (
              <div>• VFX: {proSettings.coverage || 'entire-body'} coverage, {proSettings.intensity || 85}% intensity</div>
            )}
            {enhancementToggles.particles && (
              <div>• Particles: {proSettings.particleType || 'dust'} particles</div>
            )}
            {enhancementToggles.lighting && (
              <div>• Lighting: {getDisplayValue('lightingSetup', proSettings.lightingSetup)}, {getDisplayValue('keyLight', proSettings.keyLight)} key light</div>
            )}
            {enhancementToggles.style && (
              <div>• Style: {getDisplayValue('artisticStyle', proSettings.artisticStyle)} style, {getDisplayValue('mood', proSettings.mood)} mood</div>
            )}
          </div>
        </div>
      )}

      {enhancedPrompt && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium">Enhanced Prompt:</label>
            <Button
              onClick={copyEnhancedPrompt}
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>
          <Textarea
            value={enhancedPrompt}
            onChange={(e) => setEnhancedPrompt(e.target.value)}
            rows={8}
            className="text-xs font-mono bg-gray-900 text-white border-gray-600"
            placeholder="Enhanced prompt will appear here..."
          />
        </div>
      )}
    </Card>
  );
};