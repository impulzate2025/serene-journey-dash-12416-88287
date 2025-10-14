import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Filter, Copy, Trash2, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Generation {
  id: string;
  effect_type: string;
  effect_category: string;
  generated_prompt: string;
  image_url: string | null;
  created_at: string;
  intensity: number;
  duration: string;
  ai_analysis: any;
}

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [filteredGenerations, setFilteredGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    filterGenerations();
  }, [searchQuery, categoryFilter, dateFilter, generations]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load prompt history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterGenerations = () => {
    let filtered = [...generations];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(gen => 
        gen.generated_prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gen.effect_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(gen => gen.effect_category === categoryFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === '7days') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === '30days') {
        filterDate.setDate(now.getDate() - 30);
      }

      filtered = filtered.filter(gen => 
        new Date(gen.created_at) >= filterDate
      );
    }

    setFilteredGenerations(filtered);
    setCurrentPage(1);
  };

  const handleCopy = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGenerations(generations.filter(gen => gen.id !== id));
      toast({
        title: 'Deleted',
        description: 'Prompt deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete prompt',
        variant: 'destructive',
      });
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredGenerations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGenerations = filteredGenerations.slice(startIndex, startIndex + itemsPerPage);

  const categories = Array.from(new Set(generations.map(gen => gen.effect_category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Prompt History</h1>
          <p className="text-muted-foreground">View and manage your generated prompts</p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search prompts or effects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredGenerations.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No prompts found</p>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {paginatedGenerations.map((gen) => (
                <Card key={gen.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{gen.effect_type}</Badge>
                        <Badge variant="outline">{gen.effect_category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(gen.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mb-2 line-clamp-2">{gen.generated_prompt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Intensity: {gen.intensity}%</span>
                        <span>Duration: {gen.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(gen.generated_prompt)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate('/generator')}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(gen.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
