# 🔐 SISTEMA DE AUTENTICACIÓN

## 🏗️ Arquitectura de Autenticación

El sistema utiliza **Supabase Auth** como proveedor principal de autenticación con **JWT tokens** y **Row Level Security (RLS)**.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │   SUPABASE AUTH  │    │   DATABASE      │
│   AuthContext   │◄──►│   JWT Tokens     │◄──►│   RLS Policies  │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 AuthContext.tsx

**Propósito**: Context principal para manejo de estado de autenticación

### Configuración del Context:
```typescript
interface AuthContextType {
  user: User | null;              // Usuario actual
  session: Session | null;        // Sesión activa
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;               // Estado de carga
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

### Inicialización del Auth State:
```typescript
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Configurar listener de cambios de auth PRIMERO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // 2. DESPUÉS verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
};
```

### Métodos de Autenticación:

#### Sign Up:
```typescript
const signUp = async (email: string, password: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl  // Redirect después de confirmación
    }
  });
  return { error };
};
```

#### Sign In:
```typescript
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};
```

#### Sign Out:
```typescript
const signOut = async () => {
  await supabase.auth.signOut();
};
```

### Hook de Uso:
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 🛡️ ProtectedRoute.tsx

**Propósito**: Componente para proteger rutas que requieren autenticación

### Implementación:
```typescript
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir a /auth si no hay usuario autenticado
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Mostrar loading mientras se verifica auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // No renderizar nada si no hay usuario
  if (!user) {
    return null;
  }

  // Renderizar contenido protegido
  return <>{children}</>;
};
```

### Uso en App.tsx:
```typescript
<Routes>
  <Route path="/auth" element={<Auth />} />
  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/generator" element={<ProtectedRoute><Generator /></ProtectedRoute>} />
  <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## 💳 Sistema de Suscripciones

### use-subscription.tsx

**Propósito**: Hook para manejo de suscripciones y permisos Pro

#### Tipos de Usuario:
```typescript
export type UserTier = 'freemium' | 'pro';

interface SubscriptionData {
  tier: UserTier;
  dailyGenerations: number;      // Generaciones usadas hoy
  maxGenerations: number;        // Límite diario
  features: string[];            // Características disponibles
}
```

#### Implementación Actual (Modo Testing):
```typescript
export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: 'freemium',
    dailyGenerations: 0,
    maxGenerations: 10,
    features: ['basic_effects', 'short_prompts']
  });

  const fetchSubscription = async () => {
    // TEMPORAL: Modo Pro habilitado para todos durante testing
    const mockData: SubscriptionData = {
      tier: 'pro', // HABILITADO PARA TESTING
      dailyGenerations: 3,
      maxGenerations: 999, // Unlimited for testing
      features: ['all_effects', 'long_prompts', 'advanced_controls']
    };
    
    setSubscription(mockData);
  };

  const canUseProFeatures = () => subscription.tier === 'pro';
  const canGenerate = () => subscription.dailyGenerations < subscription.maxGenerations;

  const getFeatureAccess = () => ({
    advancedControls: canUseProFeatures(),
    longPrompts: canUseProFeatures(),
    allEffects: canUseProFeatures(),
    unlimitedGenerations: canUseProFeatures()
  });

  return {
    subscription,
    loading,
    canUseProFeatures,
    canGenerate,
    getFeatureAccess,
    refreshSubscription: fetchSubscription
  };
};
```

## 🔧 Cliente Supabase

### client.ts

**Propósito**: Configuración del cliente Supabase con tipos TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,        // Persistir en localStorage
    persistSession: true,         // Mantener sesión activa
    autoRefreshToken: true,       // Refresh automático de tokens
  }
});
```

### Variables de Entorno:
```bash
# .env
VITE_SUPABASE_URL=https://nduhgptimbvmlswyfpxn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

## 🔐 Flujo de Autenticación

### 1. Registro de Usuario:
```
1. Usuario completa formulario → signUp()
2. Supabase envía email de confirmación
3. Usuario confirma email → redirect a app
4. Trigger automático crea:
   - Perfil en public.profiles
   - Rol 'user' en public.user_roles  
   - Créditos iniciales en public.user_credits
5. AuthContext actualiza estado
6. Usuario redirigido a Dashboard
```

### 2. Inicio de Sesión:
```
1. Usuario ingresa credenciales → signIn()
2. Supabase valida credenciales
3. Genera JWT token con claims
4. AuthContext actualiza estado
5. ProtectedRoute permite acceso
6. Usuario accede a app
```

### 3. Verificación de Sesión:
```
1. App carga → AuthProvider inicializa
2. Verifica sesión existente en localStorage
3. Si existe token válido → auto-login
4. Si token expirado → auto-refresh
5. Si no hay sesión → redirect a /auth
```

## 🛡️ Seguridad

### JWT Token Claims:
```json
{
  "aud": "authenticated",
  "exp": 1697123456,
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "role": "authenticated",
  "aal": "aal1",
  "amr": [{"method": "password", "timestamp": 1697037056}]
}
```

### Row Level Security (RLS):
```sql
-- Ejemplo: Solo el usuario puede ver sus generaciones
CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);
```

### Verificación en Edge Functions:
```typescript
// Supabase Functions automáticamente verifican JWT
// cuando verify_jwt = true en config.toml
const { data: { user } } = await supabase.auth.getUser(
  req.headers.get('Authorization')?.replace('Bearer ', '')
);
```

## 🔄 Estados de Autenticación

### Loading States:
```typescript
// AuthContext maneja 3 estados principales:
// 1. loading: true  → Verificando autenticación
// 2. loading: false, user: null → No autenticado
// 3. loading: false, user: User → Autenticado
```

### Error Handling:
```typescript
// Manejo de errores en signIn/signUp
const { error } = await signIn(email, password);
if (error) {
  // Mostrar error al usuario
  toast({
    title: "Error de autenticación",
    description: error.message,
    variant: "destructive"
  });
}
```

## 🚀 Optimizaciones

### Performance:
- **Persistent sessions** en localStorage
- **Auto-refresh** de tokens
- **Lazy loading** de subscription data
- **Memoization** en AuthContext

### UX Improvements:
- **Loading states** durante auth
- **Redirect preservation** después de login
- **Error messages** claros
- **Auto-logout** en token expiry

## 🔮 Futuras Mejoras

### Características Planeadas:
1. **OAuth providers** (Google, GitHub)
2. **Two-factor authentication** (2FA)
3. **Session management** avanzado
4. **Role-based permissions** granulares
5. **Subscription tiers** reales con Stripe