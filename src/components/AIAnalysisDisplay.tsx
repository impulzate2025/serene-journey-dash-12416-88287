import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Lightbulb, User, Settings, Sparkles } from 'lucide-react';

interface AIAnalysisDisplayProps {
  analysis: any;
  isProMode?: boolean;
}

export const AIAnalysisDisplay = ({ analysis, isProMode = false }: AIAnalysisDisplayProps) => {
  if (!analysis) return null;

  // Basic display for freemium users
  if (!isProMode) {
    return (
      <Card className="bg-card border border-border animate-fade-in">
        <div className="p-4 border-b border-border">
          <span className="text-sm font-medium">AI Analysis</span>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Detected:</span>
          </div>
          <ul className="space-y-2 text-sm">
            <li>• Subject: <span className="text-foreground">{analysis.subject}</span></li>
            <li>• Style: <span className="text-foreground">{analysis.style}</span></li>
            <li>• Colors: <span className="text-foreground">{analysis.colors?.join(", ")}</span></li>
            <li>• Lighting: <span className="text-foreground">{analysis.lighting}</span></li>
          </ul>
        </div>
      </Card>
    );
  }

  // Advanced display for Pro users
  return (
    <Card className="bg-card border border-border animate-fade-in">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-medium">Pro AI Analysis</span>
        <Badge variant="secondary" className="text-xs">Complete</Badge>
      </div>
      
      <div className="p-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-8">
            <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
            <TabsTrigger value="camera" className="text-xs">
              <Camera className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="lighting" className="text-xs">
              <Lightbulb className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="subject" className="text-xs">
              <User className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="technical" className="text-xs">
              <Settings className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Subject:</span>
                <div className="font-medium">{analysis.subject}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Style:</span>
                <div className="font-medium">{analysis.style}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Lighting:</span>
                <div className="font-medium">{analysis.lighting}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Energy:</span>
                <div className="font-medium">{analysis.energy}</div>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Colors:</span>
              <div className="flex gap-1 mt-1">
                {analysis.colors?.map((color: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Camera Analysis */}
          <TabsContent value="camera" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Angle:</span>
                <div className="font-medium">{analysis.cameraAngle || 'eye-level'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Shot Type:</span>
                <div className="font-medium">{analysis.shotType || 'medium'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Composition:</span>
                <div className="font-medium">{analysis.composition || 'centered'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Depth:</span>
                <div className="font-medium">{analysis.depth || 'shallow'}</div>
              </div>
            </div>
          </TabsContent>

          {/* Lighting Analysis */}
          <TabsContent value="lighting" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Setup:</span>
                <div className="font-medium">{analysis.lightingSetup || 'studio'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Key Light:</span>
                <div className="font-medium">{analysis.keyLightDirection || 'above-right'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Mood:</span>
                <div className="font-medium">{analysis.lightingMood || 'high-contrast'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Shadows:</span>
                <div className="font-medium">{analysis.shadows || 'soft'}</div>
              </div>
            </div>
          </TabsContent>

          {/* Subject Analysis */}
          <TabsContent value="subject" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Gender:</span>
                <div className="font-medium">{analysis.gender || 'neutral'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Age:</span>
                <div className="font-medium">{analysis.age || 'adult'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Expression:</span>
                <div className="font-medium">{analysis.expression || 'confident'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Pose:</span>
                <div className="font-medium">{analysis.pose || 'standing'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Clothing:</span>
                <div className="font-medium">{analysis.clothing || 'casual'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Vibe:</span>
                <div className="font-medium">{analysis.vibe || 'professional'}</div>
              </div>
            </div>
          </TabsContent>

          {/* Technical Analysis */}
          <TabsContent value="technical" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Background:</span>
                <div className="font-medium">{analysis.backgroundType || 'studio'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Quality:</span>
                <div className="font-medium">{analysis.imageQuality || 'professional'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Color Grade:</span>
                <div className="font-medium">{analysis.colorGrade || 'cinematic'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Mood:</span>
                <div className="font-medium">{analysis.mood || 'dramatic'}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};