# 📋 PROJECT OVERVIEW

## 🎯 Qué es el proyecto

**Nombre**: VFX Prompt Generator  
**Tipo**: Aplicación web React para generar prompts cinematográficos con IA  
**Plataforma**: Web (React + TypeScript + Supabase)

## 🚀 Funcionalidad Principal

La aplicación permite a los usuarios:

1. **Subir imágenes** y generar prompts cinematográficos automáticamente
2. **Analizar imágenes** con IA para extraer elementos visuales
3. **Configurar parámetros Pro** (cámara, movimiento, efectos VFX, partículas)
4. **Enhancear prompts existentes** aplicando configuraciones Pro
5. **Guardar y gestionar** una biblioteca de prompts generados

## 🏗️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes UI
- **React Router** para navegación
- **React Query** para manejo de estado
- **Lucide React** para iconos

### Backend
- **Supabase** como BaaS (Backend as a Service)
- **Supabase Functions** (Deno) para lógica del servidor
- **Supabase Auth** para autenticación
- **PostgreSQL** como base de datos

### IA y APIs
- **Lovable AI Gateway** para procesamiento de imágenes y generación de prompts
- **Gemini 2.5 Flash** como modelo de IA principal

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes UI base (shadcn)
│   ├── ProControls.tsx # Controles del modo Pro
│   ├── PromptEnhancer.tsx # Sistema de enhancement
│   └── ...
├── pages/              # Páginas principales
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Generator.tsx   # Generador de prompts
│   ├── Library.tsx     # Biblioteca de prompts
│   └── Auth.tsx        # Autenticación
├── contexts/           # Contextos React
├── hooks/              # Custom hooks
├── integrations/       # Integraciones (Supabase)
└── lib/                # Utilidades

supabase/
├── functions/          # Edge Functions
│   ├── generate-prompt/
│   ├── enhance-prompt/
│   └── analyze-image/
└── migrations/         # Migraciones de DB
```

## 🎨 Características Principales

### 1. Generación de Prompts
- Análisis automático de imágenes
- Generación de prompts cinematográficos detallados
- Configuración de parámetros técnicos (cámara, lentes, movimiento)

### 2. Modo Pro
- Controles avanzados para profesionales
- Configuración de shot types, ángulos de cámara
- Efectos VFX y sistemas de partículas
- Instrucciones de optimización personalizadas

### 3. Sistema de Enhancement
- Mejora de prompts existentes con configuraciones Pro
- Reescritura inteligente manteniendo el contexto original
- Integración natural de parámetros técnicos

### 4. Autenticación y Persistencia
- Sistema de usuarios con Supabase Auth
- Biblioteca personal de prompts
- Historial de generaciones

## 🎯 Usuarios Objetivo

- **Creadores de contenido VFX**
- **Directores de fotografía**
- **Artistas digitales**
- **Productores de video**
- **Estudiantes de cine y VFX**

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
LOVABLE_API_KEY=your_lovable_api_key  # En Supabase Functions
```

### Scripts Disponibles
```bash
npm run dev      # Desarrollo local
npm run build    # Build de producción
npm run lint     # Linting
npm run preview  # Preview del build
```

## 🌐 URLs del Proyecto

- **Lovable Project**: https://lovable.dev/projects/734bf22a-b795-4af2-bd71-3c54bb8bd98d
- **Repositorio**: Conectado automáticamente con Lovable
- **Deploy**: Automático via Lovable (Share -> Publish)

## 📊 Estado Actual

✅ **Completado**:
- Estructura base del proyecto
- Sistema de autenticación
- Generación básica de prompts
- Interfaz de usuario completa
- Controles Pro Mode
- **Sistema de enhancement de prompts funcionando**
- **Movement selector expandido (10 opciones)**
- **Badge visual "Active Effect"**
- **Sincronización automática camera effect → movement**
- **Backend actualizado con descripciones detalladas**

⚠️ **En Desarrollo**:
- Optimización de la IA
- Biblioteca de prompts
- Sistema de créditos

✅ **Recientemente Solucionado**:
- Enhancement de prompts funcionando correctamente
- Función enhance-prompt deployada y operativa
- Logging completo implementado