import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Lightbulb, User, Settings, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DeepAnalysisModal } from './DeepAnalysisModal';
import { useSubscription } from '@/hooks/use-subscription';

interface AIAnalysisDisplayProps {
  analysis: any;
  isProMode?: boolean;
  imageUrl?: string;
}

export const AIAnalysisDisplay = ({ analysis, isProMode = false, imageUrl }: AIAnalysisDisplayProps) => {
  const { canUseProFeatures } = useSubscription();
  const { toast } = useToast();
  const [deepAnalysis, setDeepAnalysis] = useState<any>(null);
  const [deepAnalysisLoading, setDeepAnalysisLoading] = useState(false);
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);

  if (!analysis) return null;

  const handleDeepAnalysis = async () => {
    if (!imageUrl) {
      toast({
        title: 'Error',
        description: 'No image available for deep analysis',
        variant: 'destructive',
      });
      return;
    }

    setDeepAnalysisLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('deep-analyze-image', {
        body: { imageUrl }
      });

      if (error) throw error;

      setDeepAnalysis(data.deepAnalysis);
      setShowDeepAnalysis(true);
      toast({
        title: 'Deep Analysis Complete',
        description: 'Ultra-detailed analysis ready',
      });
    } catch (error) {
      console.error('Deep analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not perform deep analysis',
        variant: 'destructive',
      });
    } finally {
      setDeepAnalysisLoading(false);
    }
  };

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
    <>
      <Card className="bg-card border border-border animate-fade-in">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Pro AI Analysis</span>
            <Badge variant="secondary" className="text-xs">Complete</Badge>
          </div>
          {canUseProFeatures() && imageUrl && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleDeepAnalysis}
              disabled={deepAnalysisLoading}
            >
              {deepAnalysisLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Deep Analysis
            </Button>
          )}
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

      <DeepAnalysisModal 
        open={showDeepAnalysis}
        onOpenChange={setShowDeepAnalysis}
        analysis={deepAnalysis}
      />
    </>
  );
};
