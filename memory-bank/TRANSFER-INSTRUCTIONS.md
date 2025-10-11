# 🚀 INSTRUCCIONES DE TRANSFERENCIA

## 📋 Para el Nuevo Asistente de Código

¡Hola! Este es un **memory bank completo** del proyecto VFX Prompt Generator. Aquí tienes toda la información que necesitas para continuar el desarrollo.

## 🎯 PROBLEMA URGENTE A RESOLVER

**El sistema de enhancement de prompts NO está funcionando.** Este es el problema #1 que necesitas resolver:

### 🚨 Síntomas:
- Los prompts "enhanced" son **idénticos** a los originales
- Las configuraciones Pro **no se aplican**
- La IA **ignora** las instrucciones estrictas
- Sigue agregando headers como "Here's a cinematic VFX prompt..."

### 📍 Ubicación del Problema:
- **Frontend**: `src/components/PromptEnhancer.tsx`
- **Backend**: `supabase/functions/enhance-prompt/index.ts`
- **Logs**: Ver `11-current-issues.md` para debugging completo

## 📚 Cómo Usar Este Memory Bank

### 1. Empezar Aquí:
1. **Lee `01-project-overview.md`** - Entender qué es el proyecto
2. **Lee `11-current-issues.md`** - Problema actual y debugging
3. **Lee `02-architecture.md`** - Arquitectura técnica

### 2. Información Específica:
- **Frontend**: `03-frontend-components.md`
- **Backend**: `04-backend-functions.md`
- **Base de Datos**: `05-database-schema.md`
- **Autenticación**: `06-authentication.md`
- **Pro Mode**: `07-pro-mode-system.md`
- **Enhancement**: `08-prompt-enhancement.md`
- **UI**: `09-ui-components.md`
- **Configuración**: `10-configuration-files.md`
- **Contexto**: `12-development-context.md`

## 🔧 Setup Rápido

### Variables de Entorno:
```bash
VITE_SUPABASE_URL=https://nduhgptimbvmlswyfpxn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Comandos Básicos:
```bash
npm install
npm run dev          # Desarrollo local
npm run build        # Build producción
npm run lint         # Linting
```

### Estructura del Proyecto:
```
src/
├── components/      # Componentes React
├── pages/          # Páginas principales
├── contexts/       # Contextos (Auth)
├── hooks/          # Custom hooks
└── integrations/   # Supabase client

supabase/
├── functions/      # Edge Functions
└── migrations/     # DB migrations
```

## 🎯 Prioridades de Desarrollo

### 🚨 URGENTE (Esta semana):
1. **Resolver enhancement bug** - Ver `11-current-issues.md`
2. **Verificar logs del backend** - Supabase Dashboard
3. **Probar función enhance-prompt** directamente
4. **Implementar fallback más robusto**

### 📋 IMPORTANTE (Próximo mes):
1. **Biblioteca de prompts** funcional
2. **Sistema de créditos** real con Supabase
3. **Preset management** para Pro settings
4. **Analytics básicas** de uso

### 🔮 FUTURO (Próximos 3 meses):
1. **Integración Stripe** para pagos
2. **Múltiples modelos IA**
3. **API pública**
4. **Batch processing**

## 🔍 Debugging del Enhancement

### Pasos Inmediatos:
1. **Verificar logs**: Supabase Dashboard → Functions → enhance-prompt → Logs
2. **Probar función directamente**: Con curl o Postman
3. **Revisar configuración**: `supabase/config.toml`
4. **Validar parámetros**: ProSettings llegando correctamente

### Posibles Soluciones:
1. **Temperatura aún más baja**: 0.01 en lugar de 0.1
2. **System prompt más agresivo**: Más prohibiciones explícitas
3. **Múltiples intentos**: Retry con diferentes approaches
4. **Fallback completo**: Enhancement sin IA usando regex

## 📊 Estado Actual del Proyecto

### ✅ Completado:
- Estructura base del proyecto
- Sistema de autenticación completo
- Generación básica de prompts
- Controles Pro Mode (24 efectos)
- UI/UX completa con shadcn/ui
- Análisis de imágenes con IA

### 🔄 En Desarrollo:
- **Enhancement de prompts** (con bugs críticos)
- Biblioteca de prompts
- Sistema de créditos

### 📋 Pendiente:
- Preset management
- Integración de pagos
- Analytics avanzadas
- API pública

## 🛠️ Herramientas y Recursos

### Desarrollo:
- **IDE**: VS Code recomendado
- **Browser**: Chrome DevTools para debugging
- **Database**: Supabase Dashboard
- **Logs**: Supabase Functions logs

### Documentación:
- **React**: https://react.dev/
- **Supabase**: https://supabase.com/docs
- **Tailwind**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/

### APIs:
- **Lovable AI Gateway**: https://ai.gateway.lovable.dev/
- **Gemini 2.5 Flash**: Modelo principal de IA

## 🚨 Notas Importantes

### Seguridad:
- **RLS habilitado** en todas las tablas
- **JWT verification** en Edge Functions
- **Environment variables** para secrets

### Performance:
- **React Query** para caching
- **Code splitting** automático
- **Optimistic updates** donde sea posible

### UX:
- **Mobile first** design
- **Loading states** en todas las acciones
- **Error handling** con toast notifications
- **Progressive enhancement** para Pro features

## 🤝 Contacto y Continuidad

### Información del Usuario Original:
- Proyecto enfocado en **VFX y cinematografía**
- Usuario hispanohablante (logs en español)
- Experiencia técnica avanzada
- Frustración con el bug de enhancement

### Expectativas:
- **Resolver el enhancement bug** es prioridad absoluta
- **Mantener la calidad** del código existente
- **Documentar cambios** para futuras referencias
- **Testing exhaustivo** antes de deploy

## 🎯 Mensaje Final

Este proyecto tiene una **base sólida** y un **gran potencial**. El único problema crítico es el **enhancement system** que necesita ser resuelto urgentemente.

**Todo el contexto está aquí.** Lee los archivos del memory bank, entiende la arquitectura, y enfócate en resolver el enhancement bug. ¡El usuario confía en que puedas solucionarlo!

**¡Buena suerte! 🚀**