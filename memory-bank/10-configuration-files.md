# ⚙️ ARCHIVOS DE CONFIGURACIÓN

## 📁 Estructura de Configuración

```
proyecto/
├── .env                    # Variables de entorno
├── components.json         # Configuración shadcn/ui
├── eslint.config.js        # Configuración ESLint
├── postcss.config.js       # Configuración PostCSS
├── tailwind.config.ts      # Configuración Tailwind
├── tsconfig.json           # Configuración TypeScript
├── vite.config.ts          # Configuración Vite
└── package.json            # Dependencias y scripts
```

## 🔐 Variables de Entorno (.env)

### Configuración Actual:
```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="nduhgptimbvmlswyfpxn"
VITE_SUPABASE_URL="https://nduhgptimbvmlswyfpxn.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Variables Requeridas:
```bash
# Frontend (Vite)
VITE_SUPABASE_URL=https://nduhgptimbvmlswyfpxn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Backend (Supabase Secrets)
LOVABLE_API_KEY=your_lovable_api_key_here
```

### Uso en el Código:
```typescript
// Frontend
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Backend (Supabase Functions)
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
```

## 🎨 Configuración shadcn/ui (components.json)

### Configuración Completa:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,              // No React Server Components
  "tsx": true,               // TypeScript + JSX
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",    // Color base del sistema
    "cssVariables": true,    // Usar CSS variables
    "prefix": ""             // Sin prefijo en clases
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Características:
- **Style**: Default shadcn/ui style
- **TypeScript**: Habilitado con JSX
- **CSS Variables**: Para theming dinámico
- **Path Aliases**: Importaciones limpias con @/

### Comandos shadcn/ui:
```bash
# Agregar componente
npx shadcn@latest add button

# Agregar múltiples componentes
npx shadcn@latest add card select tabs

# Actualizar componentes
npx shadcn@latest update
```

## 🔍 Configuración ESLint (eslint.config.js)

### Configuración Moderna (ESM):
```javascript
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",  // Deshabilitado para desarrollo
    },
  },
);
```

### Características:
- **Flat Config**: Nueva configuración ESLint 9+
- **TypeScript**: Soporte completo con typescript-eslint
- **React Hooks**: Reglas para hooks de React
- **React Refresh**: Compatibilidad con HMR
- **Flexible**: Reglas relajadas para desarrollo

### Scripts de Linting:
```bash
# Ejecutar linting
npm run lint

# Auto-fix problemas
npm run lint -- --fix
```

## 🎨 Configuración PostCSS (postcss.config.js)

### Configuración Simple:
```javascript
export default {
  plugins: {
    tailwindcss: {},      // Procesamiento Tailwind
    autoprefixer: {},     // Prefijos automáticos CSS
  },
};
```

### Propósito:
- **Tailwind CSS**: Procesamiento de utilidades
- **Autoprefixer**: Compatibilidad cross-browser
- **Build optimization**: Optimización en build

## 🏗️ Configuración Tailwind (tailwind.config.ts)

### Configuración Extendida:
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Sistema de colores personalizado
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        // ... más colores
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-hero': 'var(--gradient-hero)',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'card': 'var(--shadow-card)',
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" }
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

## ⚡ Configuración Vite (vite.config.ts)

### Configuración Completa:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",           // Bind a todas las interfaces
    port: 8080,           // Puerto específico
  },
  plugins: [
    react(),              // Plugin React con SWC
    mode === "development" && componentTagger()  // Lovable tagger solo en dev
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // Alias @ para src/
    },
  },
}));
```

### Características:
- **React SWC**: Compilación ultra rápida
- **Path Aliases**: @/ apunta a src/
- **Lovable Tagger**: Solo en desarrollo
- **Host Configuration**: Para desarrollo en red

## 📦 Configuración TypeScript (tsconfig.json)

### Configuración Principal:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" }, 
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]     // Path mapping para @/
    },
    "noImplicitAny": false,  // Relajado para desarrollo
    "noUnusedParameters": false,
    "skipLibCheck": true,
    "allowJs": true,
    "noUnusedLocals": false,
    "strictNullChecks": false
  }
}
```

### Configuraciones Separadas:
- **tsconfig.app.json**: Para código de aplicación
- **tsconfig.node.json**: Para scripts de Node.js
- **Configuración relajada**: Para desarrollo rápido

## 📋 Configuración Package.json

### Scripts Principales:
```json
{
  "scripts": {
    "dev": "vite",                    // Desarrollo local
    "build": "vite build",            // Build de producción
    "build:dev": "vite build --mode development",
    "lint": "eslint .",               // Linting
    "preview": "vite preview"         // Preview del build
  }
}
```

### Dependencias Principales:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.75.0",
    "@tanstack/react-query": "^5.83.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "tailwindcss": "^3.4.17",
    "lucide-react": "^0.462.0",
    // ... más dependencias
  },
  "devDependencies": {
    "@vitejs/plugin-react-swc": "^3.11.0",
    "typescript": "^5.8.3",
    "eslint": "^9.32.0",
    "autoprefixer": "^10.4.21",
    // ... más dev dependencies
  }
}
```

## 🔧 Configuración Supabase (supabase/config.toml)

### Configuración de Functions:
```toml
project_id = "nduhgptimbvmlswyfpxn"

[functions.analyze-image]
verify_jwt = true

[functions.generate-prompt]
verify_jwt = true
```

### Características:
- **JWT Verification**: Habilitado para seguridad
- **Project ID**: Identificador único del proyecto
- **Function-specific**: Configuración por función

## 🚀 Scripts de Desarrollo

### Comandos Útiles:
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Linting
npm run lint

# Supabase (si está instalado)
supabase start
supabase functions serve
supabase db reset
```

## 🔧 Configuraciones IDE

### VS Code Settings (.vscode/settings.json):
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 🌐 Configuración de Deploy

### Lovable Deploy:
- **Automático**: Via Lovable dashboard
- **Build command**: `npm run build`
- **Output directory**: `dist/`
- **Environment variables**: Configuradas en Lovable

### Variables de Producción:
```bash
# Producción
VITE_SUPABASE_URL=https://nduhgptimbvmlswyfpxn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Supabase Secrets
LOVABLE_API_KEY=production_key_here
```