import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Library, Film, Home, History, Settings, HelpCircle, Wand2, Eye, Camera } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar - Flora Style */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-semibold">AI Prompt Generator Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-semibold">127/500</span>
            </div>
            <Button variant="ghost" size="icon">
              <div className="w-8 h-8 bg-gradient-primary rounded-full" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Flora Style */}
        <aside className="w-16 border-r border-border bg-card flex flex-col items-center py-4 gap-4">
          <Button variant="ghost" size="icon" className="w-12 h-12 bg-primary/10">
            <Home className="w-5 h-5 text-primary" />
          </Button>
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <h2 className="text-5xl font-bold leading-tight">
                Genera Prompts de VFX
                <br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  en 30 Segundos
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Sube una imagen, elige un efecto, y obtén prompts profesionales optimizados para AI
              </p>
            </div>

            {/* Action Cards - Flora Block Style */}
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/generator">
                <Card className="p-8 hover:shadow-glow transition-all cursor-pointer group bg-card border-2 border-border hover:border-primary">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold">Generar Prompt</h3>
                    <p className="text-base text-muted-foreground">
                      Sube una imagen y genera prompts de efectos VFX automáticamente
                    </p>
                    <div className="pt-2">
                      <Button size="lg" variant="default" className="w-full">
                        Comenzar Ahora
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to="/library">
                <Card className="p-8 hover:shadow-glow transition-all cursor-pointer group bg-card border-2 border-border hover:border-secondary">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Library className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-bold">Biblioteca de Efectos</h3>
                    <p className="text-base text-muted-foreground">
                      Explora más de 50 efectos profesionales categorizados
                    </p>
                    <div className="pt-2">
                      <Button size="lg" variant="outline" className="w-full">
                        Ver Efectos
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Quick Access Grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Categorías Populares</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Visual Effects", icon: Wand2, count: 6, color: "text-primary", bg: "bg-primary/10" },
                  { name: "Eyes & Face", icon: Eye, count: 4, color: "text-secondary", bg: "bg-secondary/10" },
                  { name: "Camera Controls", icon: Camera, count: 6, color: "text-accent", bg: "bg-accent/10" },
                  { name: "Energy & Light", icon: Zap, count: 4, color: "text-yellow-400", bg: "bg-yellow-400/10" },
                ].map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card
                      key={category.name}
                      className="p-6 bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all cursor-pointer"
                    >
                      <div className="space-y-3 text-center">
                        <div className={`w-12 h-12 ${category.bg} rounded-lg flex items-center justify-center mx-auto`}>
                          <Icon className={`w-6 h-6 ${category.color}`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{category.name}</div>
                          <div className="text-xs text-muted-foreground">{category.count} efectos</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Stats Block */}
            <Card className="p-8 bg-card border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Efectos Profesionales</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-secondary">30s</div>
                  <div className="text-sm text-muted-foreground">Generación Rápida</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-accent">AI</div>
                  <div className="text-sm text-muted-foreground">Análisis Inteligente</div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {/* Bottom Bar */}
      <footer className="border-t border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">🏠 Dashboard</span>
            <span className="text-xs text-muted-foreground">Ready to create</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
