import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Variation {
  approach: string;
  prompt: string;
  changes: string[];
}

interface VariationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variations: Variation[];
  onSelectVariation: (prompt: string) => void;
}

export const VariationsModal = ({ open, onOpenChange, variations, onSelectVariation }: VariationsModalProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: 'Copied!',
        description: 'Variation copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleUse = (prompt: string) => {
    onSelectVariation(prompt);
    onOpenChange(false);
    toast({
      title: 'Variation Applied',
      description: 'The selected variation is now your active prompt',
    });
  };

  const getBadgeColor = (approach: string) => {
    const colors: Record<string, string> = {
      'More Dramatic': 'bg-red-500',
      'Faster Pace': 'bg-orange-500',
      'Cinematic Wide': 'bg-blue-500',
      'Minimalist': 'bg-gray-500',
      'Experimental': 'bg-purple-500',
    };
    return colors[approach] || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Prompt Variations
            <Badge variant="secondary">{variations.length} Options</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          {variations.map((variation, index) => (
            <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={getBadgeColor(variation.approach)}>
                    {variation.approach}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(variation.prompt, index)}
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUse(variation.prompt)}
                  >
                    Use This
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {variation.prompt}
              </p>

              {variation.changes && variation.changes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {variation.changes.map((change, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {change}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
