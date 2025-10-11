import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { useToast } from '@/hooks/use-toast';

interface ProModeToggleProps {
  isProMode: boolean;
  onToggle: (enabled: boolean) => void;
}

export const ProModeToggle = ({ isProMode, onToggle }: ProModeToggleProps) => {
  const { canUseProFeatures } = useSubscription();
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    if (checked && !canUseProFeatures()) {
      toast({
        title: "🔒 Pro Feature",
        description: "Upgrade to Pro to unlock advanced cinematic controls",
        variant: "default",
      });
      return;
    }
    onToggle(checked);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${!isProMode ? 'text-foreground' : 'text-muted-foreground'}`}>
          Simple
        </span>
        <Switch 
          checked={isProMode}
          onCheckedChange={handleToggle}
          disabled={!canUseProFeatures() && !isProMode}
        />
        <span className={`text-xs font-medium flex items-center gap-1 ${isProMode ? 'text-foreground' : 'text-muted-foreground'}`}>
          Pro Mode
          {!canUseProFeatures() && <Crown className="w-3 h-3 text-amber-500" />}
        </span>
      </div>
      
      {!canUseProFeatures() && (
        <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-6">
          <Sparkles className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};