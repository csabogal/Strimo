# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con el código en este repositorio.

## Descripción del Proyecto

Strimo es un SaaS de gestión de suscripciones compartidas (Netflix, Spotify, etc.) entre miembros. Permite dividir costos, generar cobros mensuales, rastrear pagos, e incluye funciones con IA para análisis financiero y generación de mensajes de cobro por WhatsApp.

## Comandos de Desarrollo

```bash
npm run dev      # Inicia servidor de desarrollo Vite con HMR
npm run build    # Compilación TypeScript + build de producción Vite
npm run lint     # Ejecuta ESLint
npm run preview  # Vista previa del build de producción
```

## Stack Tecnológico

- **Frontend:** React 19, TypeScript, Vite
- **Estilos:** Tailwind CSS 4 con tema oscuro (estética glassmorphism)
- **Estado:** TanStack React Query para estado del servidor, Context API para auth
- **Backend:** Supabase (auth, base de datos, realtime)
- **Formularios:** React Hook Form
- **IA:** Google Gemini API para insights y generación de mensajes
- **Animaciones:** Framer Motion

## Arquitectura

### Estructura de Directorios
```
src/
├── components/
│   ├── ui/          # Componentes reutilizables (Button, Input, Modal)
│   ├── forms/       # Componentes de formulario con React Hook Form
│   └── Layout.tsx   # Layout con navegación sidebar
├── pages/           # Páginas de rutas (Dashboard, Members, Platforms, Login)
├── providers/       # AuthProvider context
└── lib/
    ├── supabase.ts       # Cliente de Supabase
    ├── database.types.ts # Tipos auto-generados de Supabase
    └── billing.ts        # Lógica de generación de cobros
```

### Patrones Clave

**Obtención de Datos:** Todas las operaciones de datos usan React Query con query keys como `['platforms']`, `['members']`, `['charges', 'pending']`. Las mutaciones invalidan queries relacionadas al completarse.

**Autenticación:** Supabase Auth envuelto en `AuthProvider`. Las rutas están protegidas mediante el componente `ProtectedRoute`.

**Estrategias de Facturación:**
- `equal` - Costo dividido equitativamente entre todos los miembros suscritos
- `rotation` - Cada mes un miembro diferente paga el costo total (usa el campo `rotation_order` y módulo: `(year * 12 + month - 1) % members.length`)

### Esquema de Base de Datos (Supabase)

- **members** - Perfiles de usuario (name, email, phone, active)
- **platforms** - Servicios de suscripción (name, cost, billing_cycle, payment_strategy, slots)
- **member_subscriptions** - Vincula miembros con plataformas (incluye rotation_order, share_cost)
- **charges** - Cobros mensuales (member_id, platform_id, amount, month, year, status: pending/paid)
- **payment_history** - Registros de pagos completados

## Variables de Entorno

Requeridas en `.env.local`:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GEMINI_API_KEY=
```

## Idioma de la UI

La interfaz de la aplicación está en español. Los mensajes toast, etiquetas y texto visible al usuario deben permanecer en español.
