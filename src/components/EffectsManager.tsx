import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const EffectsManager = () => {
  const [effects, setEffects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEffect, setEditingEffect] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'visual',
    description: '',
    icon: '✨',
    color: '#8B5CF6',
    is_premium: false,
    is_active: true,
    prompt_template: '',
    default_intensity: 80,
    default_duration: '3s'
  });

  useEffect(() => {
    loadEffects();
  }, []);

  const loadEffects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('effects')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setEffects(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEffect) {
      const { error } = await supabase
        .from('effects')
        .update(formData)
        .eq('id', editingEffect.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Effect updated successfully' });
        resetForm();
        loadEffects();
      }
    } else {
      const { error } = await supabase
        .from('effects')
        .insert([formData]);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Effect created successfully' });
        resetForm();
        loadEffects();
      }
    }
  };

  const handleEdit = (effect: any) => {
    setEditingEffect(effect);
    setFormData({
      name: effect.name,
      category: effect.category,
      description: effect.description,
      icon: effect.icon || '✨',
      color: effect.color || '#8B5CF6',
      is_premium: effect.is_premium,
      is_active: effect.is_active,
      prompt_template: effect.prompt_template,
      default_intensity: effect.default_intensity,
      default_duration: effect.default_duration
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this effect?')) return;

    const { error } = await supabase
      .from('effects')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Effect deleted successfully' });
      loadEffects();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('effects')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Effect status updated' });
      loadEffects();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'visual',
      description: '',
      icon: '✨',
      color: '#8B5CF6',
      is_premium: false,
      is_active: true,
      prompt_template: '',
      default_intensity: 80,
      default_duration: '3s'
    });
    setEditingEffect(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Effects Database</h3>
          <p className="text-sm text-muted-foreground">{effects.length} effects total</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Effect
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEffect ? 'Edit Effect' : 'Create New Effect'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual Effects</SelectItem>
                      <SelectItem value="eyes">Eyes & Face</SelectItem>
                      <SelectItem value="camera">Camera Controls</SelectItem>
                      <SelectItem value="energy">Energy & Light</SelectItem>
                      <SelectItem value="atmospheric">Atmospheric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Prompt Template</Label>
                <Textarea
                  value={formData.prompt_template}
                  onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
                  rows={3}
                  placeholder="e.g., A cinematic shot with {effect} effect..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Icon Emoji</Label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Intensity</Label>
                  <Input
                    type="number"
                    value={formData.default_intensity}
                    onChange={(e) => setFormData({ ...formData, default_intensity: parseInt(e.target.value) })}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Duration</Label>
                  <Input
                    value={formData.default_duration}
                    onChange={(e) => setFormData({ ...formData, default_duration: e.target.value })}
                    placeholder="3s"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_premium}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                  />
                  <Label>Premium Effect</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {editingEffect ? 'Update Effect' : 'Create Effect'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : effects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No effects found. Create your first effect!
                </TableCell>
              </TableRow>
            ) : (
              effects.map((effect) => (
                <TableRow key={effect.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{effect.icon}</span>
                      {effect.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{effect.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={effect.is_active}
                      onCheckedChange={() => toggleActive(effect.id, effect.is_active)}
                    />
                  </TableCell>
                  <TableCell>
                    {effect.is_premium && <Badge>Pro</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(effect)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(effect.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
