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
import { Plus, Edit, Trash2, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const PresetsManager = () => {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPreset, setEditingPreset] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🎬',
    category: 'action',
    is_active: true,
    settings: '{}'
  });

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('director_presets')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setPresets(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate JSON
    try {
      JSON.parse(formData.settings);
    } catch {
      toast({ title: 'Error', description: 'Invalid JSON in settings', variant: 'destructive' });
      return;
    }

    const payload = {
      ...formData,
      settings: JSON.parse(formData.settings)
    };

    if (editingPreset) {
      const { error } = await supabase
        .from('director_presets')
        .update(payload)
        .eq('id', editingPreset.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Preset updated successfully' });
        resetForm();
        loadPresets();
      }
    } else {
      const { error } = await supabase
        .from('director_presets')
        .insert([payload]);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Preset created successfully' });
        resetForm();
        loadPresets();
      }
    }
  };

  const handleEdit = (preset: any) => {
    setEditingPreset(preset);
    setFormData({
      name: preset.name,
      description: preset.description || '',
      icon: preset.icon || '🎬',
      category: preset.category,
      is_active: preset.is_active,
      settings: JSON.stringify(preset.settings, null, 2)
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this preset?')) return;

    const { error } = await supabase
      .from('director_presets')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Preset deleted successfully' });
      loadPresets();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('director_presets')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Preset status updated' });
      loadPresets();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '🎬',
      category: 'action',
      is_active: true,
      settings: '{}'
    });
    setEditingPreset(null);
    setIsDialogOpen(false);
  };

  const presetTemplate = {
    shotType: 'medium',
    cameraAngle: 'high-angle',
    cameraMovement: 'dolly-in',
    lensType: '35mm-anamorphic',
    lightingSetup: 'studio',
    intensity: 85,
    mood: 'intense'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Director Presets</h3>
          <p className="text-sm text-muted-foreground">{presets.length} presets configured</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Preset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPreset ? 'Edit Preset' : 'Create New Preset'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Action Hero Setup"
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
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="drama">Drama</SelectItem>
                      <SelectItem value="horror">Horror</SelectItem>
                      <SelectItem value="comedy">Comedy</SelectItem>
                      <SelectItem value="thriller">Thriller</SelectItem>
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
                  placeholder="Describe this preset..."
                />
              </div>

              <div className="space-y-2">
                <Label>Icon Emoji</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Settings (JSON)</Label>
                <Textarea
                  value={formData.settings}
                  onChange={(e) => setFormData({ ...formData, settings: e.target.value })}
                  rows={10}
                  className="font-mono text-xs"
                  placeholder={JSON.stringify(presetTemplate, null, 2)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter valid JSON with Pro Mode settings
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  <Film className="w-4 h-4 mr-2" />
                  {editingPreset ? 'Update Preset' : 'Create Preset'}
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : presets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No presets found. Create your first preset!
                </TableCell>
              </TableRow>
            ) : (
              presets.map((preset) => (
                <TableRow key={preset.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{preset.icon}</span>
                      {preset.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{preset.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={preset.is_active}
                      onCheckedChange={() => toggleActive(preset.id, preset.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(preset)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(preset.id)}>
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
