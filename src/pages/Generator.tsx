import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Upload, ArrowLeft, Zap, Copy, Check, Film, Home, History, Settings, HelpCircle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("visual");
  const [selectedEffect, setSelectedEffect] = useState("Portal Effect");
  const [intensity, setIntensity] = useState([85]);
  const [duration, setDuration] = useState("3");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { signOut } = useAuth();

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
        setSelectedImage(e.target?.result as string);
        analyzeImage();
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

  const analyzeImage = () => {
    setAnalyzing(true);
    // Simulación de análisis AI
    setTimeout(() => {
      setAiAnalysis({
        subject: "Urban artist",
        style: "Night photography",
        colors: ["Blue", "Pink", "Purple"],
        lighting: "Dramatic"
      });
      setAnalyzing(false);
    }, 1500);
  };

  const handleGenerate = () => {
    setGeneratedPrompt(`Cinematic ${selectedEffect.toLowerCase()} sequence. Subject stands at 2 meters from camera. Dramatic lighting with volumetric fog. Camera performs slow dolly in (${duration}s) while portal materializes behind subject with swirling purple energy particles. Effect intensity: ${intensity[0]}%. Portal diameter: 3 meters. Particle density increases progressively. Lens: 35mm, f/2.0. Motion blur on particles. Subject remains in sharp focus as portal reaches full brightness. VFX: Chromatic aberration on portal edges, god rays, atmospheric depth.`);
    
    toast({
      title: "✨ Prompt Generado",
      description: "Tu prompt está listo para usar",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast({
      title: "📋 Copiado",
      description: "Prompt copiado al portapapeles",
    });
    setTimeout(() => setCopied(false), 2000);
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
          <Button variant="ghost" size="icon" className="w-12 h-12">
            <History className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-12 h-12">
            <Settings className="w-5 h-5" />
          </Button>
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
              <Card className="bg-card border border-border animate-fade-in">
                <div className="p-4 border-b border-border">
                  <span className="text-sm font-medium">AI Analysis</span>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Detected:</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>• Subject: <span className="text-foreground">{aiAnalysis.subject}</span></li>
                    <li>• Style: <span className="text-foreground">{aiAnalysis.style}</span></li>
                    <li>• Colors: <span className="text-foreground">{aiAnalysis.colors.join(", ")}</span></li>
                    <li>• Lighting: <span className="text-foreground">{aiAnalysis.lighting}</span></li>
                  </ul>
                </div>
              </Card>
            )}

            {/* Generate Button */}
            {selectedImage && (
              <Button 
                size="lg" 
                className="w-full bg-gradient-primary hover:opacity-90"
                onClick={handleGenerate}
              >
                <Sparkles className="w-5 h-5" />
                ✨ Generate Prompt
              </Button>
            )}

            {/* Generated Prompt Block */}
            {generatedPrompt && (
              <Card className="bg-card border border-border animate-fade-in">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium">Generated Prompt</span>
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
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-foreground/90">{generatedPrompt}</p>
                </div>
              </Card>
            )}
          </div>
        </main>

        {/* Right Sidebar - Settings Panel */}
        <aside className="w-80 border-l border-border bg-card overflow-y-auto">
          <div className="p-6 space-y-6">
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
