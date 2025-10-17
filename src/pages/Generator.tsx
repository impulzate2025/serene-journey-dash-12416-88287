import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Upload, ArrowLeft, Zap, Copy, Check, Film, Home, History, Settings, HelpCircle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { ProModeToggle } from "@/components/ProModeToggle";
import { ProControls } from "@/components/ProControls";
import { ProTeaser } from "@/components/ProTeaser";
import { AIAnalysisDisplay } from "@/components/AIAnalysisDisplay";
import { PromptEnhancer } from "@/components/PromptEnhancer";
import { VariationsModal } from "@/components/VariationsModal";
import { ExportMenu } from "@/components/ExportMenu";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const imageUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((f) => f.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine((f) => f.type.startsWith('image/'), 'File must be an image'),
});

const effectCategories = [
  {
    value: "visual",
    label: "Visual Effects",
    effects: ["Portal Effect", "Explosion", "Disintegration", "Turning Metal", "Melting", "Set on Fire"]
  },
  {
    value: "eyes",
    label: "Eyes & Face",
    effects: ["Eyes In (Signature)", "Laser Eyes", "Glowing Eyes", "Face Morph"]
  },
  {
    value: "camera",
    label: "Camera Controls",
    effects: ["Crash Zoom", "Dolly Zoom", "FPV Drone", "360° Orbit", "Crane Shot"]
  },
  {
    value: "energy",
    label: "Energy & Light",
    effects: ["Lightning Strike", "Energy Aura", "Hologram", "Light Beams"]
  },
];

const Generator = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("visual");
  const [selectedEffect, setSelectedEffect] = useState("Portal Effect");
  const [intensity, setIntensity] = useState([85]);
  const [duration, setDuration] = useState("3");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  
  // NEW: Pro Mode State
  const [isProMode, setIsProMode] = useState(false);
  const [proSettings, setProSettings] = useState<any>({});
  
  // NEW: Variations State
  const [variations, setVariations] = useState<any[]>([]);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [generatingVariations, setGeneratingVariations] = useState(false);
  
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { subscription, canUseProFeatures, canGenerate } = useSubscription();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    try {
      // Validate file
      imageUploadSchema.parse({ file });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = e.target?.result as string;
        setSelectedImage(img);
        analyzeImage(img);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Invalid File",
          description: err.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const analyzeImage = async (image?: string) => {
    const img = image ?? selectedImage;
    if (!img) return;

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { imageBase64: img }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to analyze image",
          variant: "destructive",
        });
        setAnalyzing(false);
        return;
      }

      if (data?.analysis) {
        setAiAnalysis(data.analysis);
        toast({
          title: "✨ Image Analyzed",
          description: "AI has analyzed your image successfully",
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      toast({
        title: "Error",
        description: "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    if (!canGenerate()) {
      toast({
        title: "Daily Limit Reached",
        description: `You've used ${subscription.dailyGenerations}/${subscription.maxGenerations} generations today`,
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-prompt', {
        body: {
          // Use Pro effect selection if available, otherwise fallback to basic
          effect: isProMode && proSettings.selectedEffect ? proSettings.selectedEffect : selectedEffect,
          intensity: isProMode && proSettings.intensity ? proSettings.intensity : intensity[0],
          duration: duration,
          style: 'cinematic',
          analysis: aiAnalysis,
          imageBase64: selectedImage,
          // NEW: Pro Mode Settings
          isProMode,
          proSettings: isProMode ? proSettings : null
        }
      });

      if (error) {
        console.error('Generation error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to generate prompt",
          variant: "destructive",
        });
        setAnalyzing(false);
        return;
      }

      if (data?.prompt) {
        setGeneratedPrompt(data.prompt);
        
        // 🔥 SAVE TO DATABASE
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { error: saveError } = await supabase
            .from('generations')
            .insert({
              user_id: userData.user.id,
              effect_category: selectedCategory,
              effect_type: isProMode && proSettings.selectedEffect ? proSettings.selectedEffect : selectedEffect,
              image_url: selectedImage,
              ai_analysis: aiAnalysis,
              generated_prompt: data.prompt,
              intensity: isProMode && proSettings.intensity ? proSettings.intensity : intensity[0],
              duration: duration,
              style: 'cinematic'
            });
          
          if (saveError) {
            console.error('Error saving generation:', saveError);
          }
        }
        
        toast({
          title: "✨ Prompt Generated",
          description: "Saved to your history!",
        });
      }
    } catch (err) {
      console.error('Generation error:', err);
      toast({
        title: "Error",
        description: "Failed to generate prompt",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast({
        title: "📋 Copiado",
        description: "Prompt copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = generatedPrompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      toast({
        title: "📋 Copiado",
        description: "Prompt copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar - Flora Style */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <Film className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">AI Prompt Generator Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-semibold">127/500</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Flora Style */}
        <aside className="w-16 border-r border-border bg-card flex flex-col items-center py-4 gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="w-12 h-12">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/history">
            <Button variant="ghost" size="icon" className="w-12 h-12">
              <History className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="w-12 h-12">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="w-12 h-12">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Image Upload Block */}
            <Card className="bg-card border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Reference Image</span>
                  {selectedImage && (
                    <span className="text-xs text-primary">● Ready</span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {!selectedImage ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          📤 Upload Reference Image
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or drag & drop here
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supported: JPG, PNG • Max size: 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" size="lg" className="cursor-pointer" asChild>
                          <span>Select Image</span>
                        </Button>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full rounded-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(null);
                        setAiAnalysis(null);
                      }}
                      className="w-full"
                    >
                      Change Image
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* AI Analysis Block */}
            {aiAnalysis && (
              <AIAnalysisDisplay 
                analysis={aiAnalysis} 
                isProMode={isProMode && canUseProFeatures()}
                imageUrl={selectedImage || undefined}
              />
            )}

            {/* Generate Button */}
            {selectedImage && (
              <Button 
                size="lg" 
                className="w-full bg-gradient-primary hover:opacity-90"
                onClick={handleGenerate}
                disabled={analyzing}
              >
                <Sparkles className="w-5 h-5" />
                {analyzing ? "Generating..." : "✨ Generate Prompt"}
              </Button>
            )}

            {/* Generated Prompt Block */}
            {generatedPrompt && (
              <div className="space-y-4">
                <Card className="bg-card border border-border animate-fade-in">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-medium">Generated Prompt</span>
                    <div className="flex gap-2">
                      <ExportMenu 
                        prompt={generatedPrompt} 
                        generationData={{ 
                          prompt: generatedPrompt,
                          effect_type: selectedEffect,
                          effect_category: selectedCategory,
                          ai_analysis: aiAnalysis,
                          intensity: intensity[0],
                          duration: duration,
                          style: 'cinematic'
                        }} 
                      />
                      <Button variant="ghost" size="sm" onClick={handleCopy}>
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm leading-relaxed text-foreground/90">{generatedPrompt}</p>
                  </div>
                </Card>

                {/* Prompt Enhancer - Only show in Pro Mode */}
                {isProMode && canUseProFeatures() && (
                  <PromptEnhancer
                    originalPrompt={generatedPrompt}
                    proSettings={proSettings}
                    onEnhancedPrompt={setEnhancedPrompt}
                  />
                )}
                
                {/* Generate Variations Button - Pro Feature */}
                {isProMode && canUseProFeatures() && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={async () => {
                      setGeneratingVariations(true);
                      try {
                        const promptToVary = enhancedPrompt || generatedPrompt;
                        const { data, error } = await supabase.functions.invoke('generate-variations', {
                          body: { 
                            originalPrompt: promptToVary,
                            aiAnalysis,
                            proSettings
                          }
                        });
                        
                        if (error) {
                          toast({
                            title: 'Error',
                            description: error.message,
                            variant: 'destructive'
                          });
                        } else if (data?.variations) {
                          setVariations(data.variations);
                          setShowVariationsModal(true);
                        }
                      } catch (err) {
                        toast({
                          title: 'Error',
                          description: 'Failed to generate variations',
                          variant: 'destructive'
                        });
                      } finally {
                        setGeneratingVariations(false);
                      }
                    }}
                    disabled={generatingVariations}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {generatingVariations ? 'Generating...' : 'Generate Variations'}
                  </Button>
                )}
              </div>
            )}
            
            {/* Variations Modal */}
            <VariationsModal
              open={showVariationsModal}
              onOpenChange={setShowVariationsModal}
              variations={variations}
              onSelectVariation={(prompt) => {
                setGeneratedPrompt(prompt);
                setEnhancedPrompt('');
                setShowVariationsModal(false);
                toast({
                  title: 'Variation Applied',
                  description: 'Prompt updated successfully'
                });
              }}
            />
          </div>
        </main>

        {/* Right Sidebar - Settings Panel */}
        <aside className="w-96 border-l border-border bg-card overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Pro Mode Toggle */}
            <ProModeToggle 
              isProMode={isProMode} 
              onToggle={setIsProMode}
            />

            {/* Show Pro Controls or Basic Controls */}
            {isProMode && canUseProFeatures() ? (
              <ProControls onSettingsChange={setProSettings} />
            ) : (
              <>
                {/* Basic Controls (Existing) */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Effect Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {effectCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Effect Type</label>
              <Select value={selectedEffect} onValueChange={setSelectedEffect}>
                <SelectTrigger className="w-full bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {effectCategories.find(c => c.value === selectedCategory)?.effects.map(effect => (
                    <SelectItem key={effect} value={effect}>{effect}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Intensity</label>
                <span className="text-sm text-muted-foreground">{intensity[0]}</span>
              </div>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-full bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="1">1 second</SelectItem>
                  <SelectItem value="2">2 seconds</SelectItem>
                  <SelectItem value="3">3 seconds</SelectItem>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="8">8 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Style</label>
                  <Select defaultValue="cinematic">
                    <SelectTrigger className="w-full bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="dramatic">Dramatic</SelectItem>
                      <SelectItem value="moody">Moody</SelectItem>
                      <SelectItem value="neon">Neon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pro Teaser for Freemium Users */}
                {!canUseProFeatures() && (
                  <ProTeaser />
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom Queue Bar - Flora Style */}
      <footer className="border-t border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">🔄 Generations</span>
            <span className="text-xs text-muted-foreground">0 active</span>
          </div>
          <Button variant="ghost" size="sm">
            <span className="text-xs">[&gt;]</span>
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Generator;
