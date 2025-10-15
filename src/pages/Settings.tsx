import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EffectsManager } from '@/components/EffectsManager';
import { PresetsManager } from '@/components/PresetsManager';
import { Film, ArrowLeft } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <Film className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Admin Settings</h1>
          </div>
          <Link to="/generator">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Generator
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">System Management</h2>
            <p className="text-muted-foreground">Manage effects, presets, and system configuration</p>
          </div>

          <Tabs defaultValue="effects" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="effects">Effects Manager</TabsTrigger>
              <TabsTrigger value="presets">Director Presets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="effects" className="mt-6">
              <EffectsManager />
            </TabsContent>
            
            <TabsContent value="presets" className="mt-6">
              <PresetsManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
