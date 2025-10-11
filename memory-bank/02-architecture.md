# 🏗️ ARQUITECTURA TÉCNICA

## 📐 Arquitectura General

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    SUPABASE      │    │   EXTERNAL APIs │
│   React + TS    │◄──►│   Backend        │◄──►│   Lovable AI    │
│                 │    │                  │    │   Gateway       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 Frontend Architecture (React)

### Estructura de Componentes
```
App.tsx (Root)
├── AuthProvider (Context)
├── QueryClientProvider (React Query)
├── BrowserRouter (Routing)
└── Routes
    ├── /auth → Auth.tsx
    ├── / → Dashboard.tsx (Protected)
    ├── /generator → Generator.tsx (Protected)
    └── /library → Library.tsx (Protected)
```

### Configuración Vite
```typescript
// vite.config.ts
export default defineConfig({
  server: { host: "::", port: 8080 },
  plugins: [react(), componentTagger()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  }
});
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "noImplicitAny": false,
    "skipLibCheck": true,
    "allowJs": true
  }
}
```

## 🎨 Styling Architecture

### Tailwind CSS Setup
- **Framework**: Tailwind CSS v3.4.17
- **Plugin**: tailwindcss-animate
- **Theme**: Custom design system con variables CSS

### Design System
```css
/* Variables CSS personalizadas */
:root {
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-accent: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --shadow-glow: 0 0 20px rgba(102, 126, 234, 0.3);
}
```

### Componentes UI
- **Base**: shadcn/ui components
- **Customización**: Tema personalizado con colores y animaciones
- **Iconos**: Lucide React

## 🔧 Backend Architecture (Supabase)

### Supabase Configuration
```toml
project_id = "nduhgptimbvmlswyfpxn"

[functions.analyze-image]
verify_jwt = true

[functions.generate-prompt]
verify_jwt = true
```

### Edge Functions (Deno)
```
supabase/functions/
├── analyze-image/     # Análisis de imágenes con IA
├── generate-prompt/   # Generación de prompts principales
└── enhance-prompt/    # Enhancement de prompts existentes
```

### Database Schema
```sql
-- Usuarios (manejado por Supabase Auth)
auth.users

-- Prompts generados
prompts (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  original_prompt text,
  enhanced_prompt text,
  image_analysis jsonb,
  pro_settings jsonb,
  created_at timestamp
)

-- Configuraciones Pro
pro_configurations (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  name text,
  settings jsonb,
  created_at timestamp
)
```

## 🔌 API Architecture

### Lovable AI Gateway
```typescript
// Endpoint principal
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions"

// Modelo utilizado
const MODEL = "google/gemini-2.5-flash-image-preview"

// Autenticación
Authorization: `Bearer ${LOVABLE_API_KEY}`
```

### Supabase Client
```typescript
// Cliente configurado
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)
```

## 📊 State Management

### React Query
- **Propósito**: Manejo de estado del servidor
- **Cache**: Automático para llamadas a APIs
- **Invalidación**: Automática en mutaciones

### React Context
```typescript
// AuthContext para autenticación
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}>()
```

### Local State
- **useState**: Para estado local de componentes
- **useEffect**: Para efectos y lifecycle
- **Custom Hooks**: Para lógica reutilizable

## 🔐 Security Architecture

### Authentication Flow
```
1. Usuario → Supabase Auth
2. Supabase Auth → JWT Token
3. JWT Token → Edge Functions (verify_jwt: true)
4. Edge Functions → Lovable AI Gateway
```

### Protected Routes
```typescript
<ProtectedRoute>
  <Component />
</ProtectedRoute>
```

### Environment Variables
```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://nduhgptimbvmlswyfpxn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Backend (Supabase Secrets)
LOVABLE_API_KEY=your_lovable_api_key
```

## 🚀 Deployment Architecture

### Frontend Deployment
- **Platform**: Lovable (automático)
- **Build**: Vite build optimizado
- **CDN**: Automático via Lovable

### Backend Deployment
- **Platform**: Supabase Edge Functions
- **Runtime**: Deno
- **Scaling**: Automático

### Database
- **Platform**: Supabase PostgreSQL
- **Backups**: Automáticos
- **Scaling**: Managed by Supabase

## 📈 Performance Considerations

### Frontend Optimizations
- **Code Splitting**: Automático con Vite
- **Tree Shaking**: Automático
- **Asset Optimization**: Vite optimizations
- **React Query Caching**: Reduce API calls

### Backend Optimizations
- **Edge Functions**: Baja latencia global
- **Connection Pooling**: Supabase managed
- **Caching**: React Query + browser cache

## 🔄 Data Flow

### Generación de Prompts
```
1. Usuario sube imagen → Frontend
2. Frontend → analyze-image function
3. analyze-image → Lovable AI Gateway
4. AI Gateway → Análisis de imagen
5. Análisis → generate-prompt function
6. generate-prompt → Lovable AI Gateway
7. AI Gateway → Prompt generado
8. Prompt → Frontend → Usuario
```

### Enhancement de Prompts
```
1. Usuario configura Pro Settings → Frontend
2. Frontend → enhance-prompt function
3. enhance-prompt → Lovable AI Gateway
4. AI Gateway → Prompt mejorado
5. Prompt mejorado → Frontend → Usuario
```