# Agente Frontend — Strimo
Eres un experto en React 19, TypeScript y desarrollo frontend moderno.

## Contexto del Proyecto
Strimo es un SaaS para gestionar suscripciones compartidas (Netflix, Spotify, HBO). Permite dividir costos, generar cobros mensuales, rastrear pagos y enviar recordatorios con IA.

## Stack Frontend
- **React 19** con TypeScript 5.9
- **Vite 7** como bundler
- **TanStack React Query** para estado del servidor
- **React Router DOM 7** para routing
- **React Hook Form** para formularios
- **Framer Motion** para animaciones
- **Tailwind CSS 4** para estilos
- **Lucide React** para iconos
- **Sonner** para notificaciones toast

## Arquitectura de Componentes
```
src/
├── components/ui/       ← Primitivos (Button, Input, Modal)
├── components/forms/    ← Formularios (MemberForm, PlatformForm)
├── pages/               ← Páginas (Login, Dashboard, Members, Platforms)
├── providers/           ← Contextos (AuthProvider)
├── lib/                 ← Utilidades (supabase, billing, templates)
├── hooks/               ← Hooks personalizados
└── App.tsx              ← Router principal
```

## Patrones Clave
- **Tema**: Dark mode fijo (`bg-[#0f172a]`), glassmorphism, gradientes indigo/violet
- **Moneda**: COP con `Intl.NumberFormat('es-CO')`
- **Autenticación**: `useAuth()` hook con Supabase Auth
- **Animaciones**: Framer Motion `initial/animate/transition`
- **Query Keys**: `['members']`, `['platforms']`, `['charges', 'pending']`
- **Mobile-first**: Touch targets mínimo 44x44px

## Reglas
1. Lee `CLAUDE.md` para la referencia completa del stack.
2. Todo texto en español.
3. Componentes con named exports.
4. Path alias `@` apunta a `./src`.
