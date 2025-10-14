-- ============================================
-- FASE 1: Deep Analysis Support
-- ============================================

-- Add deep_analysis column to generations table
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS deep_analysis JSONB;

-- ============================================
-- FASE 2: Admin Panel - Dynamic Effects & Presets
-- ============================================

-- Create effects table (replaces hardcoded effectCategories)
CREATE TABLE IF NOT EXISTS public.effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  prompt_template TEXT NOT NULL,
  default_intensity INTEGER DEFAULT 80,
  default_duration TEXT DEFAULT '3s',
  parameters JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on effects
ALTER TABLE public.effects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for effects
CREATE POLICY "Anyone can view active effects"
ON public.effects FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage effects"
ON public.effects FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create director_presets table (Quick Setups)
CREATE TABLE IF NOT EXISTS public.director_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  settings JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  category TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on director_presets
ALTER TABLE public.director_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for director_presets
CREATE POLICY "Anyone can view active presets"
ON public.director_presets FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage presets"
ON public.director_presets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_effects_category ON public.effects(category);
CREATE INDEX IF NOT EXISTS idx_effects_active ON public.effects(is_active);
CREATE INDEX IF NOT EXISTS idx_presets_category ON public.director_presets(category);
CREATE INDEX IF NOT EXISTS idx_presets_active ON public.director_presets(is_active);
CREATE INDEX IF NOT EXISTS idx_generations_user_created ON public.generations(user_id, created_at DESC);

-- Insert initial effects data from current effectCategories
INSERT INTO public.effects (name, category, description, icon, color, is_premium, prompt_template) VALUES
  ('Slow Motion', 'temporal', 'Dramatic slow-motion effect for action sequences', '⏱️', 'blue', false, 'Cinematic slow-motion sequence at {intensity}% speed, capturing {subject} with crystal-clear detail and dramatic timing'),
  ('Time Freeze', 'temporal', 'Complete time freeze with bullet-time effect', '⏸️', 'blue', false, 'Time-freeze moment with bullet-time cinematography, {subject} suspended in motion with {intensity}% frozen particles'),
  ('Time Reversal', 'temporal', 'Reverse playback with temporal distortion', '⏪', 'blue', true, 'Temporal reversal sequence showing {subject} in reverse motion with {intensity}% temporal distortion'),
  
  ('Portal Effect', 'visual', 'Dimensional portal with energy ripples', '🌀', 'purple', false, 'Swirling dimensional portal effect with {intensity}% energy distortion, framing {subject} in otherworldly light'),
  ('Glitch Art', 'visual', 'Digital glitch and data corruption aesthetic', '⚡', 'purple', false, 'Digital glitch aesthetic with {intensity}% data corruption, fragmenting {subject} with cyberpunk artifacts'),
  ('Mirror World', 'visual', 'Reflective parallel dimension effect', '🪞', 'purple', true, 'Mirror dimension effect with {intensity}% reality reflection, duplicating {subject} in parallel planes'),
  
  ('Particle Explosion', 'particles', 'Dynamic particle burst effect', '💥', 'orange', false, 'Explosive particle burst with {intensity}% energy dispersion, emanating from {subject}'),
  ('Dust Cloud', 'particles', 'Atmospheric dust and debris effect', '💨', 'orange', false, 'Swirling dust cloud with {intensity}% atmospheric density, enveloping {subject}'),
  ('Energy Trails', 'particles', 'Luminous motion trails', '✨', 'orange', true, 'Luminous energy trails with {intensity}% light persistence, following {subject} movement'),
  
  ('Fog Overlay', 'atmospheric', 'Dense atmospheric fog', '🌫️', 'cyan', false, 'Dense atmospheric fog with {intensity}% opacity, creating mysterious ambiance around {subject}'),
  ('Light Rays', 'atmospheric', 'Volumetric god rays', '☀️', 'cyan', false, 'Volumetric light rays penetrating with {intensity}% intensity, illuminating {subject} dramatically'),
  ('Rain Effect', 'atmospheric', 'Realistic rainfall simulation', '🌧️', 'cyan', false, 'Dynamic rain simulation with {intensity}% precipitation, creating mood around {subject}'),
  
  ('Lens Flare', 'optical', 'Anamorphic lens flare', '🔆', 'yellow', false, 'Anamorphic lens flare with {intensity}% bloom, adding cinematic flair to {subject}'),
  ('Depth of Field', 'optical', 'Shallow focus depth effect', '📷', 'yellow', false, 'Shallow depth of field with {intensity}% bokeh, isolating {subject} from background'),
  ('Chromatic Aberration', 'optical', 'RGB color separation', '🎨', 'yellow', true, 'Chromatic aberration with {intensity}% color fringing, adding optical distortion to {subject}'),
  
  ('Fire Sparks', 'elemental', 'Flying fire embers', '🔥', 'red', false, 'Flying fire sparks with {intensity}% particle density, surrounding {subject}'),
  ('Water Splash', 'elemental', 'Dynamic water simulation', '💧', 'red', false, 'Dynamic water splash with {intensity}% fluid dynamics, interacting with {subject}'),
  ('Lightning Strike', 'elemental', 'Electric discharge effect', '⚡', 'red', true, 'Lightning strike with {intensity}% electrical energy, illuminating {subject}'),
  
  ('Screen Shake', 'camera', 'Dynamic camera vibration', '📹', 'green', false, 'Camera shake with {intensity}% vibration intensity, emphasizing impact around {subject}'),
  ('Zoom Blur', 'camera', 'Radial motion blur', '🎯', 'green', false, 'Radial zoom blur with {intensity}% speed, focusing attention on {subject}'),
  ('Dolly Zoom', 'camera', 'Vertigo effect zoom', '🎬', 'green', true, 'Dolly zoom vertigo effect with {intensity}% focal shift, creating disorientation around {subject}'),
  
  ('Film Grain', 'vintage', 'Analog film texture', '📽️', 'gray', false, 'Vintage film grain with {intensity}% texture, giving {subject} classic cinema aesthetic'),
  ('VHS Distortion', 'vintage', 'Retro VHS artifacts', '📼', 'gray', false, 'VHS tracking distortion with {intensity}% analog artifacts, framing {subject} in retro style'),
  ('Sepia Tone', 'vintage', 'Classic sepia color grading', '🎞️', 'gray', false, 'Sepia tone color grade with {intensity}% warmth, giving {subject} timeless feel');

-- Insert initial director presets
INSERT INTO public.director_presets (name, description, icon, category, settings) VALUES
  ('Action Hero', 'High-intensity action sequence setup', '💪', 'action', '{"cameraMovement":"dynamic","cameraAngle":"low","shotComposition":"rule-of-thirds","lightingSetup":"dramatic","colorGrading":"teal-orange","filmGrain":30,"vignette":40,"contrast":70}'),
  ('Horror Atmosphere', 'Tense horror scene configuration', '👻', 'horror', '{"cameraMovement":"handheld","cameraAngle":"dutch","shotComposition":"centered","lightingSetup":"low-key","colorGrading":"desaturated","filmGrain":60,"vignette":70,"contrast":80}'),
  ('Romantic Drama', 'Emotional romantic scene setup', '❤️', 'drama', '{"cameraMovement":"slow-pan","cameraAngle":"eye-level","shotComposition":"rule-of-thirds","lightingSetup":"soft","colorGrading":"warm","filmGrain":20,"vignette":30,"contrast":50}'),
  ('Sci-Fi Epic', 'Futuristic science fiction setup', '🚀', 'scifi', '{"cameraMovement":"drone","cameraAngle":"wide","shotComposition":"symmetrical","lightingSetup":"high-key","colorGrading":"cool","filmGrain":10,"vignette":20,"contrast":60}'),
  ('Thriller Tension', 'Suspenseful thriller configuration', '🔪', 'thriller', '{"cameraMovement":"static","cameraAngle":"high","shotComposition":"negative-space","lightingSetup":"dramatic","colorGrading":"desaturated","filmGrain":40,"vignette":60,"contrast":75}');