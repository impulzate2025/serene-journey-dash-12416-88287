import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, Wand2, Eye, Camera, Zap, Wind, Film, Home, History, Settings, HelpCircle, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Dynamic effects from database
  const [effectCategories, setEffectCategories] = useState<any[]>([]);
  const [isLoadingEffects, setIsLoadingEffects] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { toast } = useToast();

  // Load effects from database
  useEffect(() => {
    const loadEffects = async () => {
      try {
        const { data, error } = await supabase
          .from('effects')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;

        if (data) {
          // Transform database format to UI format
          const grouped = data.reduce((acc: any, effect: any) => {
            const category = effect.category.toLowerCase();
            if (!acc[category]) {
              acc[category] = {
                id: category,
                name: effect.category.charAt(0).toUpperCase() + effect.category.slice(1),
                icon: getCategoryIcon(category),
                color: getCategoryColor(category),
                bgColor: getCategoryBgColor(category),
                count: 0,
                effects: []
              };
            }
            
            acc[category].effects.push({
              id: effect.id,
              name: effect.name,
              description: effect.description,
              tags: [category, effect.is_premium ? 'Pro' : 'Free'],
              isPremium: effect.is_premium
            });
            acc[category].count++;
            
            return acc;
          }, {});

          const categories = Object.values(grouped);
          setEffectCategories(categories as any[]);
          
          // Extract all unique tags
          const tags = new Set<string>();
          data.forEach((effect: any) => {
            tags.add(effect.category.toLowerCase());
            if (effect.is_premium) tags.add('Pro');
            else tags.add('Free');
          });
          setAllTags(Array.from(tags));
        }
      } catch (error) {
        console.error('Error loading effects:', error);
        toast({
          title: "Error",
          description: "Failed to load effects. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingEffects(false);
      }
    };

    loadEffects();
  }, [toast]);

  // Helper functions for category styling
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      visual: Wand2,
      eyes: Eye,
      camera: Camera,
      energy: Zap,
      atmospheric: Wind
    };
    return icons[category] || Sparkles;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      visual: 'text-primary',
      eyes: 'text-secondary',
      camera: 'text-accent',
      energy: 'text-yellow-400',
      atmospheric: 'text-cyan-400'
    };
    return colors[category] || 'text-gray-500';
  };

  const getCategoryBgColor = (category: string): string => {
    const colors: Record<string, string> = {
      visual: 'bg-primary/10',
      eyes: 'bg-secondary/10',
      camera: 'bg-accent/10',
      energy: 'bg-yellow-400/10',
      atmospheric: 'bg-cyan-400/10'
    };
    return colors[category] || 'bg-gray-500/10';
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredCategories = effectCategories.filter(category => {
    if (selectedCategory && category.id !== selectedCategory) return false;
    
    const matchingEffects = category.effects.filter(effect => {
      const matchesSearch = effect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           effect.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => effect.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
    
    return matchingEffects.length > 0;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <Film className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Effect Library</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">{effectCategories.reduce((acc, cat) => acc + cat.count, 0)} Effects</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-16 border-r border-border bg-card flex flex-col items-center py-4 gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="w-12 h-12">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/history">
            <Button variant="ghost" size="icon" className="w-12 h-12">
              <History className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="w-12 h-12">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="w-12 h-12">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search effects by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-card border-border text-base"
                />
              </div>
            </div>

            {/* Category Filters - Flora Style Cards */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <Card
                  onClick={() => setSelectedCategory(null)}
                  className={`p-4 cursor-pointer transition-all hover:shadow-glow ${
                    selectedCategory === null
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-medium">All Effects</div>
                    <div className="text-xs text-muted-foreground">
                      {effectCategories.reduce((acc, cat) => acc + cat.count, 0)}
                    </div>
                  </div>
                </Card>
                
                {effectCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
                      className={`p-4 cursor-pointer transition-all hover:shadow-glow ${
                        selectedCategory === category.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="text-center space-y-2">
                        <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center mx-auto`}>
                          <Icon className={`w-5 h-5 ${category.color}`} />
                        </div>
                        <div className="text-sm font-medium">{category.name}</div>
                        <div className="text-xs text-muted-foreground">{category.count}</div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Tag Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Filter by Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Effects Grid */}
            <div className="max-w-4xl mx-auto space-y-8">
              {isLoadingEffects ? (
                <Card className="p-12 text-center bg-card border border-border">
                  <p className="text-muted-foreground">Loading effects...</p>
                </Card>
              ) : filteredCategories.length === 0 ? (
                <Card className="p-12 text-center bg-card border border-border">
                  <p className="text-muted-foreground">No effects found matching your filters</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory(null);
                      setSelectedTags([]);
                    }}
                  >
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                filteredCategories.map((category) => {
                const Icon = category.icon;
                const filteredEffects = category.effects.filter(effect => {
                  const matchesSearch = effect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       effect.description.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesTags = selectedTags.length === 0 || 
                                     selectedTags.some(tag => effect.tags.includes(tag));
                  return matchesSearch && matchesTags;
                });

                if (filteredEffects.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${category.color}`} />
                      </div>
                      <h2 className="text-xl font-bold">{category.name}</h2>
                      <Badge variant="outline" className="text-xs">
                        {filteredEffects.length}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredEffects.map((effect) => (
                        <Card
                          key={effect.id}
                          className="p-5 bg-card border border-border hover:shadow-glow transition-all cursor-pointer group hover:border-primary/50"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                                {effect.name}
                              </h3>
                              {effect.isPremium && (
                                <Badge variant="outline" className="bg-gradient-primary text-white border-0">
                                  <Star className="w-3 h-3 mr-1" />
                                  Pro
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {effect.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {effect.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              asChild
                            >
                              <Link to="/generator">
                                Use Effect
                              </Link>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Bar */}
      <footer className="border-t border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">📚 Library</span>
            <span className="text-xs text-muted-foreground">
              {filteredCategories.reduce((acc, cat) => 
                acc + cat.effects.filter(effect => {
                  const matchesSearch = effect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       effect.description.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesTags = selectedTags.length === 0 || 
                                     selectedTags.some(tag => effect.tags.includes(tag));
                  return matchesSearch && matchesTags;
                }).length, 0
              )} effects shown
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Library;
