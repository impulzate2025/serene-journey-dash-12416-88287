-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles enum and table
CREATE TYPE public.app_role AS ENUM ('user', 'pro', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create generations table to store all user generations
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  effect_category TEXT NOT NULL,
  effect_type TEXT NOT NULL,
  effect_description TEXT,
  image_url TEXT,
  ai_analysis JSONB,
  generated_prompt TEXT NOT NULL,
  intensity INTEGER DEFAULT 80,
  duration TEXT DEFAULT '3s',
  style TEXT DEFAULT 'cinematic',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create credits table to track user credits
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  credits INTEGER DEFAULT 5,
  daily_credits INTEGER DEFAULT 5,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  total_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create templates table for effect templates
CREATE TABLE public.effect_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.effect_templates ENABLE ROW LEVEL SECURITY;

-- Function to check user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for generations
CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_credits
CREATE POLICY "Users can view own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON public.user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for effect_templates (public read)
CREATE POLICY "Anyone can view templates"
  ON public.effect_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage templates"
  ON public.effect_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.user_credits (user_id, credits, daily_credits)
  VALUES (NEW.id, 5, 5);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to reset daily credits
CREATE OR REPLACE FUNCTION public.reset_daily_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_credits
  SET 
    credits = CASE 
      WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_credits.user_id AND role = 'pro')
      THEN 150
      ELSE 5
    END,
    daily_credits = CASE 
      WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_credits.user_id AND role = 'pro')
      THEN 150
      ELSE 5
    END,
    last_reset_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE last_reset_date < CURRENT_DATE;
END;
$$;

-- Insert initial effect templates
INSERT INTO public.effect_templates (name, category, description, prompt_template, icon, color, is_pro, popularity) VALUES
('Portal Effect', 'visual-effects', 'Mystical portal with swirling energy', 'Create a mystical portal effect with swirling energy particles, glowing edges, and dimensional distortion', '🌀', 'from-purple-500 to-pink-500', false, 95),
('Explosion', 'visual-effects', 'Dramatic explosion with particles', 'Generate a cinematic explosion with realistic fire, smoke particles, and shockwave distortion', '💥', 'from-orange-500 to-red-500', false, 88),
('Glitch Effect', 'distortion', 'Digital glitch and distortion', 'Apply digital glitch effect with RGB split, scan lines, and pixel corruption', '⚡', 'from-cyan-500 to-blue-500', false, 82),
('Hologram', 'futuristic', 'Futuristic holographic display', 'Transform into a futuristic hologram with scan lines, flicker, and blue glow', '📡', 'from-blue-500 to-cyan-500', true, 76),
('Fire Trail', 'particle-effects', 'Blazing fire particle trail', 'Add a blazing fire trail with embers, smoke, and heat distortion', '🔥', 'from-yellow-500 to-orange-500', false, 84),
('Neon Glow', 'lighting', 'Vibrant neon lighting', 'Apply vibrant neon glow with color bleeding and electric energy', '✨', 'from-pink-500 to-purple-500', false, 79),
('Slow Motion', 'time-effects', 'Cinematic slow motion', 'Create dramatic slow motion with motion blur and time remapping', '⏱️', 'from-gray-500 to-slate-500', true, 71),
('Teleportation', 'visual-effects', 'Instant teleportation effect', 'Instant teleportation with particle dispersion and energy surge', '🚀', 'from-indigo-500 to-purple-500', true, 68);