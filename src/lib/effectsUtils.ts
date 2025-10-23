/**
 * Utility functions for managing effects and presets
 */

interface Effect {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  color?: string;
  is_premium: boolean;
  is_active: boolean;
  prompt_template: string;
}

interface EffectCategory {
  value: string;
  label: string;
  icon?: string;
  color?: string;
  bgColor?: string;
  count: number;
  effects: Effect[];
}

/**
 * Groups effects by category for UI display
 */
export const groupEffectsByCategory = (effects: Effect[]): EffectCategory[] => {
  // Only include active effects
  const activeEffects = effects.filter(e => e.is_active);
  
  const grouped = activeEffects.reduce((acc: Record<string, Effect[]>, effect) => {
    const category = effect.category.toLowerCase();
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(effect);
    return acc;
  }, {});

  // Convert to array format with proper labels
  return Object.entries(grouped).map(([category, categoryEffects]) => ({
    value: category,
    label: category.charAt(0).toUpperCase() + category.slice(1),
    icon: categoryEffects[0]?.icon,
    color: categoryEffects[0]?.color,
    bgColor: getCategoryBgColor(category),
    count: categoryEffects.length,
    effects: categoryEffects
  }));
};

/**
 * Apply preset settings to current settings
 */
export const applyPresetToSettings = (currentSettings: any, presetSettings: any) => {
  return { ...currentSettings, ...presetSettings };
};

/**
 * Get background color for category
 */
const getCategoryBgColor = (category: string): string => {
  const colors: Record<string, string> = {
    visual: 'bg-purple-500/10',
    eyes: 'bg-cyan-500/10',
    camera: 'bg-blue-500/10',
    energy: 'bg-yellow-500/10',
    atmospheric: 'bg-gray-500/10',
    lighting: 'bg-amber-500/10'
  };
  return colors[category] || 'bg-gray-500/10';
};

/**
 * Format effects for ProControls usage (grouped by category)
 */
export const formatEffectsForProControls = (effects: Effect[]): Record<string, any[]> => {
  const activeEffects = effects.filter(e => e.is_active);
  
  return activeEffects.reduce((acc: Record<string, any[]>, effect) => {
    const category = effect.category.toLowerCase();
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      id: effect.id,
      name: effect.name,
      description: effect.description,
      tags: [], // Tags can be added if needed
      pro: effect.is_premium
    });
    return acc;
  }, {});
};

/**
 * Get effect tags for Library display
 */
export const getEffectTags = (effects: Effect[]): string[] => {
  const tags = new Set<string>();
  
  effects.forEach(effect => {
    if (effect.is_premium) tags.add('Pro');
    tags.add(effect.category);
  });
  
  return Array.from(tags);
};
