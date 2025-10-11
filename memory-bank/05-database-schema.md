# 🗄️ DATABASE SCHEMA

## 📊 Esquema General

La base de datos utiliza **PostgreSQL** en Supabase con **Row Level Security (RLS)** habilitado en todas las tablas.

## 🔐 Autenticación Base

### auth.users (Supabase Auth)
```sql
-- Tabla manejada por Supabase Auth
auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  raw_user_meta_data JSONB,
  -- ... más campos de Supabase Auth
)
```

## 👤 Perfiles de Usuario

### public.profiles
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Propósito**: Información extendida de usuarios
**Relación**: 1:1 con auth.users
**RLS**: Solo el usuario puede ver/editar su perfil

## 🎭 Sistema de Roles

### public.app_role (ENUM)
```sql
CREATE TYPE public.app_role AS ENUM ('user', 'pro', 'admin');
```

### public.user_roles
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);
```

**Propósito**: Gestión de roles y permisos
**Roles Disponibles**:
- `user`: Usuario básico (5 créditos diarios)
- `pro`: Usuario Pro (150 créditos diarios)
- `admin`: Administrador (acceso completo)

## 🎬 Generaciones de Prompts

### public.generations
```sql
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
```

**Propósito**: Almacenar todas las generaciones de prompts
**Campos Principales**:
- `effect_category`: Categoría del efecto ('visual', 'camera', etc.)
- `effect_type`: Tipo específico ('portal-effect', '360-orbit', etc.)
- `ai_analysis`: Análisis completo de imagen (JSONB)
- `generated_prompt`: Prompt final generado
- `intensity`: Intensidad del efecto (30-100)
- `duration`: Duración ('3s', '5s', etc.)

### Estructura de ai_analysis (JSONB):
```json
{
  "subject": "Professional portrait subject",
  "style": "Cinematic portrait",
  "colors": ["Blue", "Silver", "Black"],
  "lighting": "Studio lighting",
  "cameraAngle": "eye-level",
  "shotType": "medium",
  "composition": "centered",
  "depth": "shallow",
  "lightingSetup": "studio",
  "keyLightDirection": "above-right",
  "lightingMood": "high-contrast",
  "shadows": "soft",
  "gender": "neutral",
  "age": "adult",
  "expression": "confident",
  "pose": "standing",
  "clothing": "casual",
  "backgroundType": "studio",
  "imageQuality": "professional",
  "colorGrade": "cinematic",
  "energy": "confident",
  "mood": "dramatic",
  "vibe": "professional"
}
```

## 💳 Sistema de Créditos

### public.user_credits
```sql
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
```

**Propósito**: Control de créditos y límites de uso
**Campos**:
- `credits`: Créditos actuales disponibles
- `daily_credits`: Límite diario de créditos
- `last_reset_date`: Última fecha de reset diario
- `total_used`: Total de créditos usados (estadística)

**Lógica de Créditos**:
- **Usuario básico**: 5 créditos diarios
- **Usuario Pro**: 150 créditos diarios
- **Reset automático**: Cada día a medianoche

## 🎨 Templates de Efectos

### public.effect_templates
```sql
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
```

**Propósito**: Catálogo de efectos disponibles
**Campos**:
- `name`: Nombre del efecto
- `category`: Categoría ('visual-effects', 'camera', etc.)
- `prompt_template`: Template base para el prompt
- `is_pro`: Si requiere suscripción Pro
- `popularity`: Score de popularidad (0-100)

### Templates Iniciales:
```sql
INSERT INTO public.effect_templates VALUES
('Portal Effect', 'visual-effects', 'Mystical portal with swirling energy', '...', '🌀', 'from-purple-500 to-pink-500', false, 95),
('Explosion', 'visual-effects', 'Dramatic explosion with particles', '...', '💥', 'from-orange-500 to-red-500', false, 88),
('Glitch Effect', 'distortion', 'Digital glitch and distortion', '...', '⚡', 'from-cyan-500 to-blue-500', false, 82),
('Hologram', 'futuristic', 'Futuristic holographic display', '...', '📡', 'from-blue-500 to-cyan-500', true, 76),
-- ... más efectos
```

## 🔐 Row Level Security (RLS)

### Políticas de Seguridad:

#### Profiles:
```sql
-- Solo el usuario puede ver su perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Solo el usuario puede actualizar su perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- El usuario puede crear su perfil durante signup
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

#### Generations:
```sql
-- Solo el usuario puede ver sus generaciones
CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el usuario puede crear sus generaciones
CREATE POLICY "Users can create own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo el usuario puede editar sus generaciones
CREATE POLICY "Users can update own generations" 
  ON public.generations FOR UPDATE 
  USING (auth.uid() = user_id);

-- Solo el usuario puede eliminar sus generaciones
CREATE POLICY "Users can delete own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);
```

#### User Credits:
```sql
-- Solo el usuario puede ver sus créditos
CREATE POLICY "Users can view own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el usuario puede actualizar sus créditos
CREATE POLICY "Users can update own credits"
  ON public.user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Sistema puede crear créditos durante signup
CREATE POLICY "System can insert user credits" 
  ON public.user_credits FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

#### Effect Templates:
```sql
-- Cualquier usuario autenticado puede ver templates
CREATE POLICY "Anyone can view templates"
  ON public.effect_templates FOR SELECT
  TO authenticated
  USING (true);

-- Solo admins pueden gestionar templates
CREATE POLICY "Admins can manage templates"
  ON public.effect_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
```

## 🔧 Funciones de Base de Datos

### Función de Verificación de Roles:
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$;
```

### Trigger de Nuevo Usuario:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  -- Crear perfil
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Asignar rol de usuario
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Crear créditos iniciales
  INSERT INTO public.user_credits (user_id, credits, daily_credits)
  VALUES (NEW.id, 5, 5);
  
  RETURN NEW;
END;
$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Función de Reset de Créditos Diarios:
```sql
CREATE OR REPLACE FUNCTION public.reset_daily_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  UPDATE public.user_credits
  SET 
    credits = CASE 
      WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_credits.user_id AND role = 'pro')
      THEN 150  -- Pro users get 150 credits
      ELSE 5    -- Regular users get 5 credits
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
$;
```

## 📊 Índices y Performance

### Índices Automáticos:
- **Primary Keys**: Índices automáticos en todas las PKs
- **Foreign Keys**: Índices automáticos en todas las FKs
- **UNIQUE constraints**: Índices automáticos

### Índices Recomendados:
```sql
-- Para búsquedas por usuario
CREATE INDEX idx_generations_user_created 
ON public.generations (user_id, created_at DESC);

-- Para búsquedas por categoría
CREATE INDEX idx_generations_category 
ON public.generations (effect_category);

-- Para templates por popularidad
CREATE INDEX idx_templates_popularity 
ON public.effect_templates (popularity DESC);
```

## 🔄 Migraciones

### Migración 1: Schema Base
- **Archivo**: `20251011002147_f20b9c39-df37-4907-becc-a21d3d5ad48f.sql`
- **Contenido**: Creación de todas las tablas base, RLS, triggers

### Migración 2: Políticas de INSERT
- **Archivo**: `20251011003317_ea263d80-0cbc-4faf-a236-6e548a468ed2.sql`
- **Contenido**: Políticas faltantes para INSERT durante signup

### Migración 3: Características Avanzadas
- **Archivo**: `20251011120000_add_advanced_prompt_features.sql`
- **Estado**: Vacía (preparada para futuras características)

## 🚀 Escalabilidad

### Consideraciones de Performance:
- **RLS**: Optimizado con índices en user_id
- **JSONB**: Análisis de imagen almacenado eficientemente
- **Partitioning**: Considerar para generations por fecha
- **Archiving**: Política de retención para generaciones antiguas

### Límites Actuales:
- **Generaciones**: Sin límite (considerar archiving)
- **Análisis JSONB**: ~1KB promedio por análisis
- **Prompts**: ~2KB promedio por prompt
- **Imágenes**: URLs externas (no almacenadas en DB)