import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, User, Shirt, Palette, Lightbulb, Box, Camera, MapPin, Download } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { exportPrompt } from '@/lib/exportUtils';

interface DeepAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: any;
}

export const DeepAnalysisModal = ({ open, onOpenChange, analysis }: DeepAnalysisModalProps) => {
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState({
    hair: true,
    makeup: true,
    accessories: true,
    wardrobe: true,
    textures: true,
    props: true,
    sceneContext: true,
    advancedLighting: true
  });

  if (!analysis) return null;

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleExport = (format: 'txt' | 'json' | 'markdown') => {
    const filteredAnalysis = Object.entries(analysis)
      .filter(([key]) => selectedCategories[key as keyof typeof selectedCategories])
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    try {
      if (format === 'txt') {
        const text = Object.entries(filteredAnalysis)
          .map(([category, data]) => {
            const header = `\n=== ${category.toUpperCase()} ===\n`;
            const content = typeof data === 'object' 
              ? Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n')
              : data;
            return header + content;
          })
          .join('\n');
        exportPrompt.toTXT(text, 'deep-analysis.txt');
      } else if (format === 'json') {
        exportPrompt.toJSON({ deep_analysis: filteredAnalysis }, 'deep-analysis.json');
      } else if (format === 'markdown') {
        const md = Object.entries(filteredAnalysis)
          .map(([category, data]) => {
            const header = `\n## ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
            const content = typeof data === 'object'
              ? Object.entries(data).map(([k, v]) => `- **${k}**: ${v}`).join('\n')
              : data;
            return header + content;
          })
          .join('\n');
        exportPrompt.toTXT(`# Deep Analysis Results\n${md}`, 'deep-analysis.md');
      }
      
      toast({
        title: 'Exported Successfully',
        description: `Deep analysis exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

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
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Deep Analysis Results
              <Badge variant="secondary">Ultra-Detailed</Badge>
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('txt')}>
                <Download className="w-4 h-4 mr-2" />
                TXT
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('markdown')}>
                <Download className="w-4 h-4 mr-2" />
                MD
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Category Filters */}
        <div className="border-b border-border pb-4">
          <p className="text-sm text-muted-foreground mb-3">Select categories to export:</p>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(selectedCategories).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox 
                  id={key} 
                  checked={value}
                  onCheckedChange={() => toggleCategory(key)}
                />
                <label htmlFor={key} className="text-sm capitalize cursor-pointer">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </div>

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
