import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Camera, Lightbulb, Sparkles, Palette } from 'lucide-react';

export const ProTeaser = () => {
  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-blue-600/10 border-purple-200 dark:border-purple-800">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg">Unlock Pro Cinematic Controls</h3>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
            Upgrade to Pro
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Get professional-grade control over every aspect of your video generation
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <Camera className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Camera Controls</div>
              <div className="text-xs text-muted-foreground">Angles, movement, lenses</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <div>
              <div className="text-sm font-medium">Lighting Setup</div>
              <div className="text-xs text-muted-foreground">Professional lighting</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <div>
              <div className="text-sm font-medium">Advanced VFX</div>
              <div className="text-xs text-muted-foreground">Particle control</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <Palette className="w-4 h-4 text-green-500" />
            <div>
              <div className="text-sm font-medium">Style Control</div>
              <div className="text-xs text-muted-foreground">500-word prompts</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
            ✨ Pro Features Include:
          </div>
          <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1 space-y-1">
            <li>• Unlimited daily generations</li>
            <li>• Long prompts (500 words)</li>
            <li>• All VFX effects</li>
            <li>• Priority processing</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};