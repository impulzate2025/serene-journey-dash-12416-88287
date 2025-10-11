import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, Lightbulb, Sparkles, Palette, Zap } from 'lucide-react';

// COMPLETE EFFECTS DATABASE - 24 Effects
interface Effect {
    id: string;
    name: string;
    description: string;
    tags: string[];
    pro?: boolean;
}

const EFFECTS_DATABASE: Record<string, Effect[]> = {
    visual: [
        { id: 'portal-effect', name: 'Portal Effect', description: 'Portal dimensional detrás del sujeto', tags: ['popular', '3d'] },
        { id: 'building-explosion', name: 'Building Explosion', description: 'Explosión cinematográfica realista', tags: ['action', '3d'], pro: true },
        { id: 'disintegration', name: 'Disintegration', description: 'Desintegración en partículas luminosas', tags: ['magic'] },
        { id: 'turning-metal', name: 'Turning Metal', description: 'Transformación en metal realista', tags: ['transform'] },
        { id: 'melting-effect', name: 'Melting Effect', description: 'Efecto de derretimiento con física real', tags: ['physics'] },
        { id: 'set-on-fire', name: 'Set on Fire', description: 'Ignición realista con física de fuego', tags: ['fire', 'action'], pro: true }
    ],
    eyes: [
        { id: 'eyes-in', name: 'Eyes In (Mouth to Tunnel)', description: 'Zoom a través de los ojos - Signature effect', tags: ['signature', 'popular'], pro: true },
        { id: 'laser-eyes', name: 'Laser Eyes', description: 'Rayos láser desde los ojos', tags: ['energy'] },
        { id: 'glowing-eyes', name: 'Glowing Eyes', description: 'Ojos brillantes con energía', tags: ['glow'] },
        { id: 'face-morph', name: 'Face Morph', description: 'Morphing facial cinematográfico', tags: ['transform'], pro: true }
    ],
    camera: [
        { id: 'crash-zoom', name: 'Crash Zoom In', description: 'Zoom dramático de alta velocidad', tags: ['popular'] },
        { id: 'dolly-zoom', name: 'Dolly Zoom', description: 'Efecto Vertigo (Hitchcock)', tags: ['classic'], pro: true },
        { id: 'fpv-drone', name: 'FPV Drone Shot', description: 'Cinematografía de dron FPV', tags: ['drone', 'popular'], pro: true },
        { id: '360-orbit', name: '360° Orbit', description: 'Movimiento orbital 360 grados', tags: ['360'] },
        { id: 'crane-shot', name: 'Crane Up/Down', description: 'Movimiento de grúa revelador', tags: ['reveal'] },
        { id: 'handheld', name: 'Handheld Camera', description: 'Cámara en mano documental', tags: ['documentary'] }
    ],
    energy: [
        { id: 'lightning-strike', name: 'Lightning Strike', description: 'Rayo impactando al sujeto', tags: ['energy'] },
        { id: 'energy-aura', name: 'Energy Aura', description: 'Aura de energía envolvente', tags: ['glow'] },
        { id: 'hologram', name: 'Hologram', description: 'Efecto holográfico futurista', tags: ['sci-fi'], pro: true },
        { id: 'light-beams', name: 'Light Beams', description: 'Rayos de luz dramáticos', tags: ['light'] }
    ],
    atmospheric: [
        { id: 'smoke-reveal', name: 'Smoke Reveal', description: 'Revelación a través del humo', tags: ['reveal'] },
        { id: 'fog-roll', name: 'Fog Roll', description: 'Niebla cinematográfica rodante', tags: ['atmospheric'] },
        { id: 'dust-particles', name: 'Dust Particles', description: 'Partículas de polvo volumétricas', tags: ['particles'] },
        { id: 'rain-effect', name: 'Rain Effect', description: 'Lluvia cinematográfica', tags: ['weather'] }
    ]
};

interface ProControlsProps {
    onSettingsChange: (settings: any) => void;
    imageAnalysis?: any; // AI analysis data to auto-populate settings
    selectedEffect?: string; // Currently selected effect to sync
}

export const ProControls = ({ onSettingsChange, imageAnalysis, selectedEffect }: ProControlsProps) => {
    const [settings, setSettings] = useState({
        // EFFECT SELECTION (NEW - PRIORITY)
        effectCategory: 'visual',
        selectedEffect: 'portal-effect',

        // Camera Controls
        shotType: 'medium',
        cameraAngle: 'high-angle',
        cameraMovement: 'dolly-in',
        lensType: '35mm-anamorphic',
        aperture: 'f2.8',
        focusType: 'sharp',

        // Lighting Controls
        lightingSetup: 'studio',
        keyLight: 'above-right',
        fillLight: 'soft',
        rimLight: 'blue',
        colorGrade: 'high-contrast',

        // VFX Advanced
        coverage: 'entire-body',
        intensity: 85,
        particleType: 'dust',
        direction: 'center-outward',

        // Style & Mood
        artisticStyle: 'cinematic',
        genre: 'dramatic',
        mood: 'intense',

        // Prompt Settings
        promptLength: 'short',
        optimizationInstructions: ''
    });

    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        console.log(`🎛️ ProControls: Updated ${key} = ${value}`);
        console.log('📋 Full settings:', newSettings);
        setSettings(newSettings);
        onSettingsChange(newSettings);
    };

    // Send initial settings when component mounts
    useEffect(() => {
        console.log('🚀 ProControls mounted, sending initial settings');
        onSettingsChange(settings);
    }, []); // Only run once on mount

    // Get current category effects
    const currentEffects = EFFECTS_DATABASE[settings.effectCategory as keyof typeof EFFECTS_DATABASE] || [];
    const selectedEffectData = currentEffects.find(e => e.id === settings.selectedEffect);

    return (
        <div className="space-y-4">
            {/* EFFECT SELECTION - TOP PRIORITY */}
            <Card className="p-3 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <Label className="text-xs font-medium">Effect Selection</Label>
                    <Badge variant="secondary" className="text-xs">24 Effects</Badge>
                </div>

                <div className="space-y-2">
                    <div>
                        <Label className="text-xs font-medium mb-1 block">Category</Label>
                        <Select value={settings.effectCategory} onValueChange={(value) => updateSetting('effectCategory', value)}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="visual">Visual Effects (6)</SelectItem>
                                <SelectItem value="eyes">Eyes & Face (4)</SelectItem>
                                <SelectItem value="camera">Camera Controls (6)</SelectItem>
                                <SelectItem value="energy">Energy & Light (4)</SelectItem>
                                <SelectItem value="atmospheric">Atmospheric (4)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-xs font-medium mb-1 block">Effect</Label>
                        <Select value={settings.selectedEffect} onValueChange={(value) => updateSetting('selectedEffect', value)}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {currentEffects.map(effect => (
                                    <SelectItem key={effect.id} value={effect.id}>
                                        <div className="flex items-center gap-2">
                                            {effect.name}
                                            {effect.pro && <Badge variant="outline" className="text-xs px-1">Pro</Badge>}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedEffectData && (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            {selectedEffectData.description}
                        </div>
                    )}
                </div>
            </Card>

            {/* Prompt Length Selector */}
            <Card className="p-3">
                <Label className="text-xs font-medium mb-2 block">Prompt Length</Label>
                <RadioGroup
                    value={settings.promptLength}
                    onValueChange={(value) => updateSetting('promptLength', value)}
                    className="flex gap-3"
                >
                    <div className="flex items-center space-x-1">
                        <RadioGroupItem value="short" id="short" />
                        <Label htmlFor="short" className="text-xs">Short (268w)</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                        <RadioGroupItem value="long" id="long" />
                        <Label htmlFor="long" className="text-xs">Long (500w)</Label>
                    </div>
                </RadioGroup>
            </Card>

            {/* Advanced Controls Tabs */}
            <Tabs defaultValue="vfx" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-8">
                    <TabsTrigger value="vfx" className="flex items-center gap-1 text-xs px-2">
                        <Sparkles className="w-3 h-3" />
                        <span className="hidden sm:inline">VFX</span>
                    </TabsTrigger>
                    <TabsTrigger value="camera" className="flex items-center gap-1 text-xs px-2">
                        <Camera className="w-3 h-3" />
                        <span className="hidden sm:inline">Camera</span>
                    </TabsTrigger>
                    <TabsTrigger value="lighting" className="flex items-center gap-1 text-xs px-2">
                        <Lightbulb className="w-3 h-3" />
                        <span className="hidden sm:inline">Light</span>
                    </TabsTrigger>
                    <TabsTrigger value="style" className="flex items-center gap-1 text-xs px-2">
                        <Palette className="w-3 h-3" />
                        <span className="hidden sm:inline">Style</span>
                    </TabsTrigger>
                </TabsList>

                {/* Camera Controls */}
                <TabsContent value="camera" className="space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Shot Type</Label>
                            <Select value={settings.shotType} onValueChange={(value) => updateSetting('shotType', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="close-up">Close-up</SelectItem>
                                    <SelectItem value="medium">Medium Shot</SelectItem>
                                    <SelectItem value="wide">Wide Shot</SelectItem>
                                    <SelectItem value="extreme-close">Extreme Close-up</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Camera Angle</Label>
                            <Select value={settings.cameraAngle} onValueChange={(value) => updateSetting('cameraAngle', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high-angle">High-angle</SelectItem>
                                    <SelectItem value="low-angle">Low-angle</SelectItem>
                                    <SelectItem value="eye-level">Eye-level</SelectItem>
                                    <SelectItem value="birds-eye">Bird's eye</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Movement</Label>
                            <Select value={settings.cameraMovement} onValueChange={(value) => updateSetting('cameraMovement', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="static">Static</SelectItem>
                                    <SelectItem value="dolly-in">Dolly in</SelectItem>
                                    <SelectItem value="dolly-out">Dolly out</SelectItem>
                                    <SelectItem value="pan">Pan left/right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Lens</Label>
                            <Select value={settings.lensType} onValueChange={(value) => updateSetting('lensType', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="35mm-anamorphic">35mm Anamorphic</SelectItem>
                                    <SelectItem value="50mm-prime">50mm Prime</SelectItem>
                                    <SelectItem value="85mm-portrait">85mm Portrait</SelectItem>
                                    <SelectItem value="24mm-wide">24mm Wide</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </TabsContent>

                {/* Lighting Controls */}
                <TabsContent value="lighting" className="space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Setup</Label>
                            <Select value={settings.lightingSetup} onValueChange={(value) => updateSetting('lightingSetup', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="studio">Studio Professional</SelectItem>
                                    <SelectItem value="natural">Natural Light</SelectItem>
                                    <SelectItem value="dramatic">Dramatic Moody</SelectItem>
                                    <SelectItem value="soft">Soft Portrait</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Key Light</Label>
                            <Select value={settings.keyLight} onValueChange={(value) => updateSetting('keyLight', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="above-right">Above-right</SelectItem>
                                    <SelectItem value="above-left">Above-left</SelectItem>
                                    <SelectItem value="front">Front key</SelectItem>
                                    <SelectItem value="side">Side dramatic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Fill Light</Label>
                            <Select value={settings.fillLight} onValueChange={(value) => updateSetting('fillLight', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="soft">Soft fill</SelectItem>
                                    <SelectItem value="hard">Hard fill</SelectItem>
                                    <SelectItem value="bounce">Bounce fill</SelectItem>
                                    <SelectItem value="none">No fill</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Rim Light</Label>
                            <Select value={settings.rimLight} onValueChange={(value) => updateSetting('rimLight', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="blue">Blue rim</SelectItem>
                                    <SelectItem value="white">White rim</SelectItem>
                                    <SelectItem value="warm">Warm rim</SelectItem>
                                    <SelectItem value="none">No rim</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </TabsContent>

                {/* VFX Controls */}
                <TabsContent value="vfx" className="space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Coverage</Label>
                            <Select value={settings.coverage} onValueChange={(value) => updateSetting('coverage', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="entire-body">Entire Body</SelectItem>
                                    <SelectItem value="face-only">Face Only</SelectItem>
                                    <SelectItem value="hands-only">Hands Only</SelectItem>
                                    <SelectItem value="torso">Torso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Particle Type</Label>
                            <Select value={settings.particleType} onValueChange={(value) => updateSetting('particleType', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dust">Dust particles</SelectItem>
                                    <SelectItem value="smoke">Smoke</SelectItem>
                                    <SelectItem value="energy">Energy</SelectItem>
                                    <SelectItem value="fire">Fire</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Intensity Slider */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium">Intensity</Label>
                            <span className="text-xs text-muted-foreground">{settings.intensity}%</span>
                        </div>
                        <input
                            type="range"
                            min="30"
                            max="100"
                            step="5"
                            value={settings.intensity}
                            onChange={(e) => updateSetting('intensity', parseInt(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </TabsContent>

                {/* Style Controls */}
                <TabsContent value="style" className="space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Artistic Style</Label>
                            <Select value={settings.artisticStyle} onValueChange={(value) => updateSetting('artisticStyle', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cinematic">Cinematic</SelectItem>
                                    <SelectItem value="realistic">Realistic</SelectItem>
                                    <SelectItem value="anime">Anime</SelectItem>
                                    <SelectItem value="3d-render">3D Render</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Mood</Label>
                            <Select value={settings.mood} onValueChange={(value) => updateSetting('mood', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dramatic">Dramatic</SelectItem>
                                    <SelectItem value="mysterious">Mysterious</SelectItem>
                                    <SelectItem value="energetic">Energetic</SelectItem>
                                    <SelectItem value="calm">Calm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Optimization Instructions */}
            <Card className="p-3">
                <Label className="text-xs font-medium mb-2 block">Advanced Instructions</Label>
                <Textarea
                    placeholder="e.g., 'apply to entire body', 'slow dolly', 'dramatic lighting'..."
                    value={settings.optimizationInstructions}
                    onChange={(e) => updateSetting('optimizationInstructions', e.target.value)}
                    rows={2}
                    className="text-xs resize-none"
                />
            </Card>
        </div>
    );
};