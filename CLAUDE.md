# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con el código en este repositorio.

## Descripción del Proyecto

Strimo es un SaaS para gestionar suscripciones compartidas (Netflix, Spotify, HBO, etc.) entre grupos de personas. Permite dividir costos equitativamente o por rotación, generar cobros mensuales automáticos, rastrear pagos, y enviar recordatorios personalizados por WhatsApp y email usando IA.

## Comandos de Desarrollo

```bash
npm run dev      # Servidor de desarrollo Vite con HMR
npm run build    # Compilación TypeScript + build producción
npm run lint     # Ejecutar ESLint
npm run preview  # Vista previa del build de producción
```

## Stack Tecnológico

- **Frontend:** React 19, TypeScript 5.9, Vite 7
- **Estilos:** Tailwind CSS 4 (tema oscuro, glassmorphism)
- **Estado:** TanStack React Query 5, Context API (auth)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Formularios:** React Hook Form 7
- **IA:** Groq API con LLaMA 3.3-70B para mensajes personalizados
- **Email:** Resend API
- **Animaciones:** Framer Motion 12
- **Iconos:** Lucide React
- **Notificaciones:** Sonner (toasts)

## Arquitectura

### Estructura de Directorios
```
src/
├── components/
│   ├── ui/                    # Button, Input, Modal
│   ├── forms/                 # MemberForm, PlatformForm
│   ├── Layout.tsx             # Sidebar con navegación
│   ├── ProtectedRoute.tsx     # Guard de autenticación
│   └── PlatformMembersModal.tsx
├── pages/
│   ├── Dashboard.tsx          # Cobros, pagos, recordatorios IA
│   ├── Members.tsx            # CRUD miembros
│   ├── Platforms.tsx          # CRUD plataformas
│   └── Login.tsx              # Autenticación
├── providers/
│   └── AuthProvider.tsx       # Contexto de Supabase Auth
└── lib/
    ├── supabase.ts            # Cliente Supabase
    ├── database.types.ts      # Tipos auto-generados
    ├── billing.ts             # Lógica de generación de cobros
    ├── emailTemplate.ts       # Plantilla HTML para emails
    └── whatsappTemplate.ts    # Formato de mensajes WhatsApp

supabase/
└── functions/
    └── process-reminders/     # Edge Function para recordatorios automáticos
        └── index.ts
```

### Esquema de Base de Datos

| Tabla | Descripción |
|-------|-------------|
| **members** | Perfiles (name, email, phone, avatar_url, active) |
| **platforms** | Servicios (name, cost, billing_cycle, payment_strategy, icon_url, total_slots) |
| **member_subscriptions** | Relación miembro-plataforma (rotation_order, share_cost) |
| **charges** | Cobros mensuales (amount, month, year, due_date, status: pending/paid) |
| **payment_history** | Pagos completados (amount_paid, payment_date, method, notes) |

### Estrategias de Cobro

**Equal (Equitativo):**
```typescript
share = platform.cost / members.length
// Cada miembro paga su parte
```

**Rotation (Rotación):**
```typescript
globalMonthIndex = (year * 12) + (month - 1)
payerIndex = globalMonthIndex % members.length
// Un miembro paga todo, rotando cada mes según rotation_order
```

### Patrones Clave

**Query Keys de React Query:**
```typescript
['platforms']                    // Todas las plataformas
['members']                      // Todos los miembros
['charges', 'pending']           // Cobros pendientes
['subscriptions', platformId]    // Suscripciones de una plataforma
['payment_history']              // Historial de pagos
```

**Formato de moneda (COP):**
```typescript
new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
}).format(amount)
```

**WhatsApp Links:**
```typescript
`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
```

## Variables de Entorno

Crear archivo `.env.local`:
```
VITE_SUPABASE_URL=https://[proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GROQ_API_KEY=gsk_...
VITE_RESEND_API_KEY=re_...
```

## Rutas de la Aplicación

| Ruta | Página | Acceso |
|------|--------|--------|
| `/login` | Login/Registro | Público |
| `/` | Dashboard | Protegido |
| `/members` | Gestión de miembros | Protegido |
| `/platforms` | Gestión de plataformas | Protegido |

## Funcionalidades Principales

1. **Dashboard:** Generar cobros, ver pendientes agrupados por miembro, marcar pagos, historial
2. **Recordatorios IA:** Genera mensajes personalizados con Groq para WhatsApp individual o grupal
3. **Email automático:** Edge Function envía recordatorios T-5, T0, T+5 días
4. **Gestión de slots:** Controla cuántos miembros puede tener cada plataforma
5. **Reordenamiento de rotación:** UI con flechas para cambiar orden de pago

## Idioma

La UI está completamente en español. Mantener todos los textos, toasts y mensajes en español.
