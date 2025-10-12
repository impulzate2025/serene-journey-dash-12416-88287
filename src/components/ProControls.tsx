import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, Lightbulb, Sparkles, Palette, Zap, Eye, Move, Gauge, Waves, Focus, RotateCcw } from 'lucide-react';

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

        // 🎬 GRANULAR MOVEMENT CONTROLS (NEW)
        movementDirection: 'standard',
        movementSpeed: 'normal',
        movementStyle: 'smooth',
        movementPattern: 'linear',

        // 🎯 INTELLIGENT COMBINATIONS (NEW)
        useSmartCombinations: true, // Auto-generate intelligent movement descriptions

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

        // 🎯 SYNC: If selecting a camera effect, auto-update cameraMovement
        if (key === 'selectedEffect' && settings.effectCategory === 'camera') {
            const cameraEffects = ['crash-zoom', 'dolly-zoom', 'fpv-drone', '360-orbit', 'crane-shot', 'handheld'];
            if (cameraEffects.includes(value)) {
                newSettings.cameraMovement = value;
                console.log(`🔄 ProControls: Auto-synced cameraMovement to ${value}`);
            }
        }

        // 🎬 GRANULAR SYNC: Auto-suggest modifiers for specific combinations
        if (key === 'cameraMovement') {
            if (value === 'fpv-drone' && settings.movementDirection === 'standard') {
                console.log('💡 ProControls: FPV drone detected - consider top-view or side-view direction');
            }
            if (value === '360-orbit' && settings.movementDirection === 'standard') {
                newSettings.movementDirection = 'top-view';
                console.log('🔄 ProControls: Auto-synced 360-orbit with top-view direction');
            }
        }

        console.log(`🎛️ ProControls: Updated ${key} = ${value}`);

        // 🎯 DIRECTOR FEEDBACK: Show composed result for complex movements
        if (['cameraMovement', 'movementDirection', 'movementSpeed', 'movementStyle'].includes(key)) {
            const composedMovement = `${newSettings.movementSpeed || 'normal'} ${newSettings.movementStyle || 'smooth'} ${newSettings.cameraMovement || 'dolly-in'}${newSettings.movementDirection !== 'standard' ? ` with ${newSettings.movementDirection} perspective` : ''}`;
            console.log(`🎬 DIRECTOR PREVIEW: "${composedMovement}"`);
        }

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

    // 🎯 INTELLIGENT MOVEMENT COMPOSER
    const getIntelligentMovementDescription = () => {
        const { cameraMovement, movementDirection, movementSpeed, movementStyle } = settings;

        // 🚁 SPECIAL COMBINATIONS - Known working patterns
        const specialCombinations: Record<string, string> = {
            // FPV + 360 combinations
            'fpv-drone+top-view': 'FPV drone 360 movement',
            'fpv-drone+spiral': 'FPV drone spiral 360 movement',
            '360-orbit+top-view': '360 degree orbital movement',
            '360-orbit+spiral': 'spiral 360 degree orbital movement',

            // Crash zoom combinations
            'crash-zoom+dramatic': 'dramatic crash zoom movement',
            'crash-zoom+fast': 'high-speed crash zoom movement',

            // Dolly combinations
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

        // 🎬 FALLBACK: Compose normally but with better logic
        let description = cameraMovement;

        // Add modifiers only if they enhance the movement
        if (movementSpeed !== 'normal' && movementSpeed !== 'smooth') {
            description = `${movementSpeed} ${description}`;
        }

        if (movementStyle !== 'smooth' && movementStyle !== 'normal') {
            description = `${movementStyle} ${description}`;
        }

        // Add direction only for specific cases
        if (movementDirection !== 'standard') {
            if (cameraMovement === 'fpv-drone' && movementDirection === 'top-view') {
                return 'FPV drone 360 movement'; // Override for this specific case
            }
            description += ` with ${movementDirection} perspective`;
        }

        return description;
    };

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

                    {/* 🎬 DIRECTOR'S DASHBOARD */}
                    <div className="mt-2 p-3 bg-gradient-to-r from-gray-900/80 to-black/80 rounded-lg border border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-medium text-purple-300">Director's Dashboard</span>
                        </div>

                        {/* Active Effect */}
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-3 h-3 text-purple-400" />
                            <span className="text-xs text-purple-200 font-medium">Effect:</span>
                            <span className="text-xs text-white">{selectedEffectData?.name || settings.selectedEffect}</span>
                            <Badge variant="outline" className="text-xs border-purple-500 text-purple-200">
                                {settings.effectCategory}
                            </Badge>
                        </div>

                        {/* Quick Status */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-blue-400" />
                                <span className="text-gray-300">{settings.shotType} shot</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <RotateCcw className="w-3 h-3 text-green-400" />
                                <span className="text-gray-300">{settings.cameraAngle}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Move className="w-3 h-3 text-purple-400" />
                                <span className="text-gray-300">{settings.cameraMovement}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Focus className="w-3 h-3 text-indigo-400" />
                                <span className="text-gray-300">{settings.lensType}</span>
                            </div>
                        </div>
                    </div>

                    {/* 🎬 GRANULAR MOVEMENT MODIFIERS SUMMARY */}
                    {(settings.movementDirection !== 'standard' ||
                        settings.movementSpeed !== 'normal' ||
                        settings.movementStyle !== 'smooth') && (
                            <div className="mt-2 p-2 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded border border-gray-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <Move className="w-3 h-3 text-cyan-400" />
                                    <span className="text-xs font-medium text-cyan-300">Movement Modifiers Active</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {settings.movementDirection !== 'standard' && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/30 rounded border border-yellow-500/50">
                                            <Zap className="w-3 h-3 text-yellow-400" />
                                            <span className="text-xs text-white">{settings.movementDirection}</span>
                                        </div>
                                    )}
                                    {settings.movementSpeed !== 'normal' && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-900/30 rounded border border-orange-500/50">
                                            <Gauge className="w-3 h-3 text-orange-400" />
                                            <span className="text-xs text-white">{settings.movementSpeed}</span>
                                        </div>
                                    )}
                                    {settings.movementStyle !== 'smooth' && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-pink-900/30 rounded border border-pink-500/50">
                                            <Waves className="w-3 h-3 text-pink-400" />
                                            <span className="text-xs text-white">{settings.movementStyle}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            </Card>

            {/* 🎬 DIRECTOR QUICK SETUPS */}
            <Card className="p-3 border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-4 h-4 text-amber-500" />
                    <Label className="text-xs font-medium">Director Quick Setups</Label>
                    <Badge variant="secondary" className="text-xs">Pro</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => {
                            const fpvTopSetup = {
                                ...settings,
                                cameraAngle: 'high-angle',
                                cameraMovement: 'fpv-drone',
                                movementDirection: 'top-view', // This triggers the special combination
                                movementSpeed: 'normal',
                                movementStyle: 'smooth',
                                lensType: '24mm-wide',
                                optimizationInstructions: 'FPV drone 360 movement' // Simplified and direct
                            };
                            setSettings(fpvTopSetup);
                            onSettingsChange(fpvTopSetup);
                            console.log('🎬 DIRECTOR SETUP: Applied FPV 360° Top View');
                            console.log('🎯 INTELLIGENT RESULT:', getIntelligentMovementDescription());
                        }}
                        className="p-2 text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                        🚁 FPV 360° Top
                    </button>
                    <button
                        onClick={() => {
                            const crashZoomSetup = {
                                ...settings,
                                cameraAngle: 'low-angle',
                                cameraMovement: 'crash-zoom',
                                movementSpeed: 'dramatic',
                                movementStyle: 'mechanical',
                                shotType: 'close-up'
                            };
                            setSettings(crashZoomSetup);
                            onSettingsChange(crashZoomSetup);
                            console.log('🎬 DIRECTOR SETUP: Applied Dramatic Crash Zoom');
                        }}
                        className="p-2 text-xs bg-gradient-to-r from-red-600 to-orange-600 text-white rounded hover:from-red-700 hover:to-orange-700 transition-all"
                    >
                        ⚡ Crash Zoom
                    </button>
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
                            <Label className="text-xs font-medium">Base Movement</Label>
                            <Select value={settings.cameraMovement} onValueChange={(value) => updateSetting('cameraMovement', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="static">Static</SelectItem>
                                    <SelectItem value="dolly-in">Dolly in</SelectItem>
                                    <SelectItem value="dolly-out">Dolly out</SelectItem>
                                    <SelectItem value="pan">Pan left/right</SelectItem>
                                    <SelectItem value="crash-zoom">Crash Zoom</SelectItem>
                                    <SelectItem value="dolly-zoom">Dolly Zoom (Vertigo)</SelectItem>
                                    <SelectItem value="fpv-drone">FPV Drone</SelectItem>
                                    <SelectItem value="360-orbit">360° Orbit</SelectItem>
                                    <SelectItem value="crane-shot">Crane Up/Down</SelectItem>
                                    <SelectItem value="handheld">Handheld</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Direction</Label>
                            <Select value={settings.movementDirection} onValueChange={(value) => updateSetting('movementDirection', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="top-view">Top View</SelectItem>
                                    <SelectItem value="side-view">Side View</SelectItem>
                                    <SelectItem value="bottom-up">Bottom Up</SelectItem>
                                    <SelectItem value="spiral">Spiral</SelectItem>
                                    <SelectItem value="reverse">Reverse</SelectItem>
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

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Speed</Label>
                            <Select value={settings.movementSpeed} onValueChange={(value) => updateSetting('movementSpeed', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="slow">Slow</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="fast">Fast</SelectItem>
                                    <SelectItem value="dramatic">Dramatic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Style</Label>
                            <Select value={settings.movementStyle} onValueChange={(value) => updateSetting('movementStyle', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="smooth">Smooth</SelectItem>
                                    <SelectItem value="organic">Organic</SelectItem>
                                    <SelectItem value="mechanical">Mechanical</SelectItem>
                                    <SelectItem value="handheld">Handheld</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 🎬 CINEMATOGRAPHY PREVIEW WITH ICONS */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-600">
                        <div className="flex items-center gap-2 mb-3">
                            <Camera className="w-4 h-4 text-white" />
                            <Label className="text-xs font-medium text-white">Active Cinematography Settings</Label>
                        </div>

                        {/* 📐 SHOT & ANGLE */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {settings.shotType !== 'medium' && (
                                <div className="flex items-center gap-1 p-1 bg-blue-900/30 rounded border border-blue-500/50">
                                    <Eye className="w-3 h-3 text-blue-400" />
                                    <span className="text-xs text-blue-200 font-medium">Shot:</span>
                                    <span className="text-xs text-white">{settings.shotType}</span>
                                </div>
                            )}
                            {settings.cameraAngle !== 'high-angle' && (
                                <div className="flex items-center gap-1 p-1 bg-green-900/30 rounded border border-green-500/50">
                                    <RotateCcw className="w-3 h-3 text-green-400" />
                                    <span className="text-xs text-green-200 font-medium">Angle:</span>
                                    <span className="text-xs text-white">{settings.cameraAngle}</span>
                                </div>
                            )}
                        </div>

                        {/* 🎬 MOVEMENT */}
                        <div className="grid grid-cols-1 gap-2 mb-2">
                            {settings.cameraMovement !== 'dolly-in' && (
                                <div className="flex items-center gap-1 p-1 bg-purple-900/30 rounded border border-purple-500/50">
                                    <Move className="w-3 h-3 text-purple-400" />
                                    <span className="text-xs text-purple-200 font-medium">Movement:</span>
                                    <span className="text-xs text-white">{settings.cameraMovement}</span>
                                </div>
                            )}
                        </div>

                        {/* 🎯 MOVEMENT MODIFIERS */}
                        <div className="grid grid-cols-3 gap-1 mb-2">
                            {settings.movementDirection !== 'standard' && (
                                <div className="flex items-center gap-1 p-1 bg-yellow-900/30 rounded border border-yellow-500/50">
                                    <Zap className="w-3 h-3 text-yellow-400" />
                                    <span className="text-xs text-yellow-200 font-medium">Dir:</span>
                                    <span className="text-xs text-white">{settings.movementDirection}</span>
                                </div>
                            )}
                            {settings.movementSpeed !== 'normal' && (
                                <div className="flex items-center gap-1 p-1 bg-orange-900/30 rounded border border-orange-500/50">
                                    <Gauge className="w-3 h-3 text-orange-400" />
                                    <span className="text-xs text-orange-200 font-medium">Speed:</span>
                                    <span className="text-xs text-white">{settings.movementSpeed}</span>
                                </div>
                            )}
                            {settings.movementStyle !== 'smooth' && (
                                <div className="flex items-center gap-1 p-1 bg-pink-900/30 rounded border border-pink-500/50">
                                    <Waves className="w-3 h-3 text-pink-400" />
                                    <span className="text-xs text-pink-200 font-medium">Style:</span>
                                    <span className="text-xs text-white">{settings.movementStyle}</span>
                                </div>
                            )}
                        </div>

                        {/* 🔍 LENS */}
                        {settings.lensType !== '35mm-anamorphic' && (
                            <div className="flex items-center gap-1 p-1 bg-indigo-900/30 rounded border border-indigo-500/50">
                                <Focus className="w-3 h-3 text-indigo-400" />
                                <span className="text-xs text-indigo-200 font-medium">Lens:</span>
                                <span className="text-xs text-white">{settings.lensType}</span>
                            </div>
                        )}


                        {/* 🎯 INTELLIGENT COMPOSED RESULT */}
                        <div className="mt-3 p-2 bg-black/50 rounded border border-gray-500">
                            <div className="text-xs text-gray-400 font-medium mb-1">Intelligent Composed Result:</div>
                            <div className="text-xs text-white">
                                A {settings.shotType} shot at {settings.cameraAngle} angle using {settings.lensType},
                                camera executing <span className="text-cyan-300 font-medium">{getIntelligentMovementDescription()}</span>
                            </div>
                        </div>

                        {/* 🔍 GRANULAR BREAKDOWN (for debugging) */}
                        <div className="mt-2 p-2 bg-gray-900/50 rounded border border-gray-700">
                            <div className="text-xs text-gray-500 font-medium mb-1">Granular Breakdown:</div>
                            <div className="text-xs text-gray-400">
                                Base: {settings.cameraMovement} | Dir: {settings.movementDirection} | Speed: {settings.movementSpeed} | Style: {settings.movementStyle}
                            </div>
                        </div>

                        {/* 🎬 ICON LEGEND */}
                        <div className="mt-3 p-2 bg-gray-800/50 rounded border border-gray-600">
                            <div className="text-xs text-gray-400 font-medium mb-2">Icon Reference:</div>
                            <div className="grid grid-cols-3 gap-1 text-xs">
                                <div className="flex items-center gap-1">
                                    <Eye className="w-3 h-3 text-blue-400" />
                                    <span className="text-gray-300">Shot Type</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <RotateCcw className="w-3 h-3 text-green-400" />
                                    <span className="text-gray-300">Angle</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Move className="w-3 h-3 text-purple-400" />
                                    <span className="text-gray-300">Movement</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-yellow-400" />
                                    <span className="text-gray-300">Direction</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Gauge className="w-3 h-3 text-orange-400" />
                                    <span className="text-gray-300">Speed</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Waves className="w-3 h-3 text-pink-400" />
                                    <span className="text-gray-300">Style</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Focus className="w-3 h-3 text-indigo-400" />
                                    <span className="text-gray-300">Lens</span>
                                </div>
                            </div>
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