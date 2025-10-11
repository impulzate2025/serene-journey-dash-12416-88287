# 🎨 UI COMPONENTS Y SISTEMA DE DISEÑO

## 🎯 Visión General

El sistema UI está construido sobre **shadcn/ui** con **Tailwind CSS** y un **design system personalizado** inspirado en Flora con tema oscuro y gradientes vibrantes.

## 🏗️ Arquitectura UI

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   SHADCN/UI     │    │   TAILWIND CSS   │    │   CUSTOM THEME  │
│   Base Components│◄──►│   Utility Classes│◄──►│   Design System │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎨 Design System

### Paleta de Colores (HSL):
```css
:root {
  /* Flora-inspired Dark Theme */
  --background: 0 0% 4%;           /* Negro profundo */
  --foreground: 0 0% 100%;         /* Blanco puro */

  --card: 0 0% 10%;                /* Gris muy oscuro */
  --card-foreground: 0 0% 100%;    /* Blanco */

  /* Primary: Purple */
  --primary: 270 91% 65%;          /* Púrpura vibrante */
  --primary-foreground: 0 0% 100%; /* Blanco */
  --primary-glow: 270 100% 75%;    /* Púrpura brillante */

  /* Secondary: Pink */
  --secondary: 330 81% 60%;        /* Rosa vibrante */
  --secondary-foreground: 0 0% 100%;

  /* Accent: Blue */
  --accent: 217 91% 60%;           /* Azul vibrante */
  --accent-foreground: 0 0% 100%;

  /* Muted */
  --muted: 0 0% 16%;               /* Gris oscuro */
  --muted-foreground: 0 0% 63%;    /* Gris medio */

  /* Borders */
  --border: 0 0% 16%;              /* Gris oscuro */
  --input: 0 0% 16%;               /* Gris oscuro */
  --ring: 270 91% 65%;             /* Púrpura (focus) */
}
```

### Gradientes Personalizados:
```css
/* Gradientes principales */
--gradient-primary: linear-gradient(135deg, hsl(270 91% 65%), hsl(330 81% 60%));
--gradient-accent: linear-gradient(135deg, hsl(330 81% 60%), hsl(217 91% 60%));
--gradient-hero: linear-gradient(180deg, hsl(0 0% 4%), hsl(0 0% 6%));
```

### Sombras y Efectos:
```css
/* Sombras con glow */
--shadow-glow: 0 0 40px hsl(270 100% 75% / 0.2);
--shadow-card: 0 8px 24px hsl(0 0% 0% / 0.5);

/* Transiciones suaves */
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

## 🔘 Button Component

### Variantes Disponibles:
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-foreground hover:bg-primary/10",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent/10 hover:text-accent",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-gradient-accent text-accent-foreground hover:opacity-90",
      },
      size: {
        default: "h-14 px-8 py-3",      // Botones grandes y accesibles
        sm: "h-11 px-6 text-sm",
        lg: "h-16 px-10 text-lg",
        icon: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

### Características Especiales:
- **Gradientes**: Botones principales usan gradientes vibrantes
- **Glow effect**: Sombra luminosa en botones primarios
- **Accesibilidad**: Tamaños grandes (h-14 por defecto)
- **Iconos**: Soporte automático para iconos con `[&_svg]:size-5`

### Ejemplos de Uso:
```typescript
// Botón principal con gradiente
<Button variant="default">Generate Prompt</Button>

// Botón Pro con gradiente accent
<Button variant="accent">Upgrade to Pro</Button>

// Botón outline para acciones secundarias
<Button variant="outline">Cancel</Button>

// Botón pequeño para controles
<Button size="sm" variant="ghost">
  <Settings className="w-4 h-4" />
</Button>
```

## 🃏 Card Component

### Estructura Base:
```typescript
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} 
      {...props} 
    />
  )
);
```

### Componentes Relacionados:
```typescript
// Estructura completa de Card
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenido principal */}
  </CardContent>
  <CardFooter>
    {/* Acciones o información adicional */}
  </CardFooter>
</Card>
```

### Variaciones Personalizadas:
```typescript
// Card con borde Pro (púrpura)
<Card className="border-purple-200 dark:border-purple-800">

// Card con fondo negro para Pro features
<Card className="bg-black dark:bg-black text-white">

// Card con gradiente sutil
<Card className="bg-gradient-to-br from-card to-muted/50">
```

## 📋 Select Component

### Implementación Base:
```typescript
<Select value={value} onValueChange={onChange}>
  <SelectTrigger className="h-8 text-xs">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opción 1</SelectItem>
    <SelectItem value="option2">Opción 2</SelectItem>
  </SelectContent>
</Select>
```

### Características:
- **Radix UI**: Base sólida y accesible
- **Animaciones**: Fade in/out suaves
- **Backdrop blur**: Efecto de desenfoque en dropdown
- **Scroll buttons**: Para listas largas
- **Keyboard navigation**: Navegación completa por teclado

### Customizaciones:
```typescript
// Select compacto para Pro Controls
<SelectTrigger className="h-8 text-xs">

// Select con indicador visual
<SelectItem value="pro-feature">
  <div className="flex items-center gap-2">
    Feature Name
    <Badge variant="outline">Pro</Badge>
  </div>
</SelectItem>
```

## 🎭 Tabs System

### Implementación en ProControls:
```typescript
<Tabs defaultValue="vfx" className="w-full">
  <TabsList className="grid w-full grid-cols-4 h-8">
    <TabsTrigger value="vfx" className="flex items-center gap-1 text-xs px-2">
      <Sparkles className="w-3 h-3" />
      <span className="hidden sm:inline">VFX</span>
    </TabsTrigger>
    <TabsTrigger value="camera" className="flex items-center gap-1 text-xs px-2">
      <Camera className="w-3 h-3" />
      <span className="hidden sm:inline">Camera</span>
    </TabsTrigger>
    {/* Más tabs */}
  </TabsList>

  <TabsContent value="vfx" className="space-y-3 mt-3">
    {/* Contenido VFX */}
  </TabsContent>
</Tabs>
```

### Características:
- **Responsive**: Iconos en mobile, texto en desktop
- **Grid layout**: Distribución uniforme
- **Compact design**: Altura reducida (h-8)
- **Icon integration**: Iconos Lucide React

## 🏷️ Badge System

### Variantes:
```typescript
// Badge por defecto
<Badge>Default</Badge>

// Badge secundario
<Badge variant="secondary">Pro Mode</Badge>

// Badge outline
<Badge variant="outline">24 Effects</Badge>

// Badge destructivo
<Badge variant="destructive">Error</Badge>
```

### Uso en el Proyecto:
```typescript
// Indicador Pro
<Badge variant="secondary" className="text-xs">Pro Mode</Badge>

// Contador de efectos
<Badge variant="secondary" className="text-xs">24 Effects</Badge>

// Indicador de características Pro
{effect.pro && <Badge variant="outline" className="text-xs px-1">Pro</Badge>}
```

## 🎨 Animaciones y Transiciones

### Animaciones Personalizadas:
```css
/* Definidas en tailwind.config.ts */
keyframes: {
  "fade-in": {
    "0%": { opacity: "0", transform: "translateY(10px)" },
    "100%": { opacity: "1", transform: "translateY(0)" }
  },
  "pulse-glow": {
    "0%, 100%": { opacity: "1" },
    "50%": { opacity: "0.5" }
  },
}

animation: {
  "fade-in": "fade-in 0.5s ease-out",
  "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
}
```

### Uso en Componentes:
```typescript
// Fade in para cards
<Card className="animate-fade-in">

// Pulse glow para elementos destacados
<div className="animate-pulse-glow">

// Spin para loading
<Sparkles className="w-4 h-4 mr-1 animate-spin" />
```

## 📱 Responsive Design

### Breakpoints:
```css
/* Mobile First Approach */
.grid-cols-1        /* Mobile (default) */
.sm:grid-cols-2     /* Tablet (640px+) */
.md:grid-cols-3     /* Desktop (768px+) */
.lg:grid-cols-4     /* Large Desktop (1024px+) */
.xl:grid-cols-5     /* Extra Large (1280px+) */
```

### Patrones Responsive:
```typescript
// Grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Texto responsive
<span className="hidden sm:inline">Desktop Text</span>

// Padding responsive
<div className="p-4 sm:p-6 lg:p-8">

// Tamaños responsive
<Button className="w-full sm:w-auto">
```

## 🎯 Patrones de Diseño

### Loading States:
```typescript
// Spinner con mensaje
<div className="min-h-screen bg-background flex items-center justify-center">
  <div className="text-center space-y-4">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
    <p className="text-muted-foreground">Loading...</p>
  </div>
</div>

// Button loading
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Sparkles className="w-4 h-4 mr-1 animate-spin" />
      Processing...
    </>
  ) : (
    <>
      <Sparkles className="w-4 h-4 mr-1" />
      Generate
    </>
  )}
</Button>
```

### Error States:
```typescript
// Toast de error
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
});

// Card de error
<Card className="border-destructive">
  <CardContent className="p-4">
    <div className="flex items-center gap-2 text-destructive">
      <AlertCircle className="w-4 h-4" />
      <span>Error message</span>
    </div>
  </CardContent>
</Card>
```

### Success States:
```typescript
// Toast de éxito
toast({
  title: "Success! 🎬",
  description: "Prompt generated successfully",
});

// Indicador de éxito
<div className="flex items-center gap-2 text-green-500">
  <CheckCircle className="w-4 h-4" />
  <span>Completed</span>
</div>
```

## 🔧 Utilidades y Helpers

### cn() Function:
```typescript
// Combina clases con class-variance-authority
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)} />
```

### Patrones Comunes:
```typescript
// Flex center
<div className="flex items-center justify-center">

// Grid responsive con gap
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Texto truncado
<p className="truncate">Long text that will be truncated</p>

// Scroll area
<div className="max-h-96 overflow-y-auto">
```

## 🚀 Performance y Optimización

### CSS Optimizations:
- **Purge CSS**: Tailwind elimina clases no usadas
- **Critical CSS**: Estilos críticos inline
- **CSS Variables**: Para theming dinámico

### Component Optimizations:
- **React.forwardRef**: Para mejor composición
- **Memoization**: En componentes pesados
- **Lazy loading**: Para componentes grandes

### Bundle Optimizations:
- **Tree shaking**: Importaciones específicas
- **Code splitting**: Por rutas y componentes
- **Asset optimization**: Imágenes y fonts optimizados