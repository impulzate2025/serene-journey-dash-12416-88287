import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, User, Shirt, Palette, Lightbulb, Box, Camera, MapPin } from 'lucide-react';

interface DeepAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: any;
}

export const DeepAnalysisModal = ({ open, onOpenChange, analysis }: DeepAnalysisModalProps) => {
  if (!analysis) return null;

  const renderSection = (title: string, data: any, icon: React.ReactNode) => (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="space-y-2 text-sm">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="grid grid-cols-3 gap-2">
            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
            <span className="col-span-2 font-medium">
              {Array.isArray(value) ? value.join(', ') : 
               typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) :
               value?.toString() || 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Deep Analysis Results
            <Badge variant="secondary">Ultra-Detailed</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="hair" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hair">Hair & Makeup</TabsTrigger>
            <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
            <TabsTrigger value="props">Props & Stage</TabsTrigger>
            <TabsTrigger value="lighting">Lighting</TabsTrigger>
          </TabsList>

          <TabsContent value="hair" className="space-y-4 mt-4">
            {analysis.hair && renderSection('Hair Details', analysis.hair, <User className="w-4 h-4 text-blue-500" />)}
            {analysis.makeup && renderSection('Makeup', analysis.makeup, <Palette className="w-4 h-4 text-pink-500" />)}
            {analysis.accessories && renderSection('Accessories', analysis.accessories, <Sparkles className="w-4 h-4 text-yellow-500" />)}
          </TabsContent>

          <TabsContent value="wardrobe" className="space-y-4 mt-4">
            {analysis.wardrobe && renderSection('Wardrobe', analysis.wardrobe, <Shirt className="w-4 h-4 text-purple-500" />)}
            {analysis.textures && renderSection('Textures & Materials', analysis.textures, <Box className="w-4 h-4 text-orange-500" />)}
          </TabsContent>

          <TabsContent value="props" className="space-y-4 mt-4">
            {analysis.props && renderSection('Props & Stage', analysis.props, <Box className="w-4 h-4 text-green-500" />)}
            {analysis.sceneContext && renderSection('Scene Context', analysis.sceneContext, <MapPin className="w-4 h-4 text-red-500" />)}
          </TabsContent>

          <TabsContent value="lighting" className="space-y-4 mt-4">
            {analysis.advancedLighting && (
              <>
                {analysis.advancedLighting.keyLight && renderSection('Key Light', analysis.advancedLighting.keyLight, <Lightbulb className="w-4 h-4 text-yellow-500" />)}
                {analysis.advancedLighting.fillLight && renderSection('Fill Light', analysis.advancedLighting.fillLight, <Lightbulb className="w-4 h-4 text-blue-500" />)}
                {analysis.advancedLighting.rimLight && renderSection('Rim Light', analysis.advancedLighting.rimLight, <Lightbulb className="w-4 h-4 text-purple-500" />)}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="w-4 h-4 text-cyan-500" />
                    <h3 className="font-semibold text-sm">Overall Lighting</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Shadows:</span>
                      <span className="col-span-2 font-medium">{analysis.advancedLighting.shadows}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Mood:</span>
                      <span className="col-span-2 font-medium">{analysis.advancedLighting.mood}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Time of Day:</span>
                      <span className="col-span-2 font-medium">{analysis.advancedLighting.timeOfDay}</span>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
