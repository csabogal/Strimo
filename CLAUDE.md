# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con el código en este repositorio.

## Descripción del Proyecto

Strimo es un SaaS para gestionar suscripciones compartidas (Netflix, Spotify, HBO, etc.) entre grupos de personas. Permite dividir costos equitativamente o por rotación, generar cobros mensuales automáticos, rastrear pagos, y enviar recordatorios personalizados por WhatsApp y email usando IA.

## Comandos de Desarrollo

```bash
npm run dev      # Servidor de desarrollo Vite con HMR (http://localhost:5173)
npm run build    # Compilación TypeScript + build producción
npm run lint     # Ejecutar ESLint
npm run preview  # Vista previa del build de producción
```

## Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Frontend** | React | 19.2.0 |
| **Lenguaje** | TypeScript | 5.9.3 |
| **Bundler** | Vite | 7.2.4 |
| **Estilos** | Tailwind CSS | 4.1.18 |
| **Estado** | TanStack React Query | 5.90.17 |
| **Routing** | React Router DOM | 7.12.0 |
| **Formularios** | React Hook Form | 7.71.1 |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) | 2.90.1 |
| **IA** | Groq SDK (LLaMA 3.3-70B) | 0.37.0 |
| **Email** | Resend API | - |
| **Animaciones** | Framer Motion | 12.26.2 |
| **Iconos** | Lucide React | 0.562.0 |
| **Notificaciones** | Sonner | 2.0.7 |
| **Fechas** | date-fns | 4.1.0 |
| **Utilidades CSS** | clsx + tailwind-merge | 2.1.1 / 3.4.0 |

## Arquitectura

### Estructura de Directorios
```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx             # Botón con variantes (primary, secondary, danger, ghost, outline)
│   │   ├── Input.tsx              # Input con label y estados de error
│   │   └── Modal.tsx              # Modal animado con Framer Motion
│   ├── forms/
│   │   ├── MemberForm.tsx         # Formulario crear/editar miembros
│   │   └── PlatformForm.tsx       # Formulario crear/editar plataformas
│   ├── Layout.tsx                 # Sidebar desktop + bottom nav mobile
│   ├── ProtectedRoute.tsx         # Guard de autenticación
│   └── PlatformMembersModal.tsx   # Modal gestión miembros por plataforma
├── pages/
│   ├── Login.tsx                  # Autenticación email/password
│   ├── Dashboard.tsx              # Cobros, pagos, recordatorios IA
│   ├── Members.tsx                # CRUD miembros
│   └── Platforms.tsx              # CRUD plataformas
├── providers/
│   └── AuthProvider.tsx           # Contexto Supabase Auth
├── lib/
│   ├── supabase.ts                # Cliente Supabase
│   ├── database.types.ts          # Tipos auto-generados
│   ├── billing.ts                 # Lógica generación de cobros
│   ├── emailTemplate.ts           # Plantilla HTML para emails
│   └── whatsappTemplate.ts        # Formato mensajes WhatsApp
├── App.tsx                        # Router principal
├── main.tsx                       # Entry point
└── index.css                      # Imports Tailwind

supabase/
└── functions/
    └── process-reminders/         # Edge Function recordatorios automáticos
        └── index.ts
```

### Esquema de Base de Datos

| Tabla | Campos Principales | Descripción |
|-------|-------------------|-------------|
| **members** | id, name, email, phone, avatar_url, active | Perfiles de personas del grupo |
| **platforms** | id, name, cost, billing_cycle, payment_strategy, icon_url, total_slots, active_slots | Servicios de streaming |
| **member_subscriptions** | id, member_id, platform_id, rotation_order, share_cost | Relación N:N miembro-plataforma |
| **charges** | id, member_id, platform_id, amount, month, year, due_date, status, last_reminder_at, last_reminder_type | Cobros mensuales |
| **payment_history** | id, charge_id, amount_paid, payment_date, method, notes | Historial de pagos completados |

### Estrategias de Cobro

**Equal (Equitativo):**
```typescript
share = platform.cost / subscribers.length
// Cada miembro paga su parte proporcional
```

**Rotation (Rotación):**
```typescript
globalMonthIndex = (year * 12) + (month - 1)
payerIndex = globalMonthIndex % subscribers.length
// Un miembro paga el total, rota mensualmente según rotation_order
```

### Query Keys (React Query)

```typescript
['members']                    // Todos los miembros
['platforms']                  // Todas las plataformas
['charges', 'pending']         // Cobros pendientes
['subscriptions', platformId]  // Suscripciones de una plataforma
['payment_history']            // Historial de pagos recientes
```

### Integraciones API

| Servicio | Uso | Endpoint |
|----------|-----|----------|
| **Supabase** | DB + Auth + Edge Functions | Configurado en `lib/supabase.ts` |
| **Groq** | IA para mensajes personalizados | `https://api.groq.com/openai/v1/chat/completions` |
| **Resend** | Envío de emails (Edge Function) | `https://api.resend.com/emails` |
| **WhatsApp** | Links directos (sin API key) | `https://api.whatsapp.com/send?phone={}&text={}` |

### Patrones de Código

**Formato de moneda (COP):**
```typescript
new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
}).format(amount)  // Resultado: $ 50.000
```

**WhatsApp Links:**
```typescript
`https://api.whatsapp.com/send?phone=${phone.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`
```

**Autenticación:**
```typescript
const { session, user, loading, signOut } = useAuth()
```

## Variables de Entorno

Crear archivo `.env.local`:
```env
# Requeridas
VITE_SUPABASE_URL=https://[proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GROQ_API_KEY=gsk_...

# Opcional (solo si usas Edge Function de emails)
VITE_RESEND_API_KEY=re_...
```

**Edge Function Secrets (configurar en Supabase Dashboard):**
```
GROQ_API_KEY
RESEND_API_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Rutas de la Aplicación

| Ruta | Página | Acceso |
|------|--------|--------|
| `/login` | Login/Registro | Público |
| `/` | Dashboard | Protegido |
| `/members` | Gestión de miembros | Protegido |
| `/platforms` | Gestión de plataformas | Protegido |
| `*` | Redirect a `/` | Protegido |

## Diseño y Estilos

- **Tema:** Dark mode fijo (`bg-[#0f172a]`, `bg-[#1e293b]`)
- **Efectos:** Glassmorphism, blur gradients, backdrop-blur
- **Colores primarios:** Gradientes indigo/violet (`from-violet-600 to-indigo-600`)
- **Mobile-first:** Breakpoints `sm:` (640px), `md:` (768px), `lg:` (1024px)
- **Touch targets:** Mínimo 44x44px en botones

## Edge Function: process-reminders

**Lógica de recordatorios:**
1. Agrupa cobros pendientes por miembro
2. Determina tipo según fecha de vencimiento:
   - `pre`: 5 días antes
   - `due`: Día de vencimiento
   - `overdue`: 5 días después
   - `manual`: Trigger manual
3. Genera mensaje IA con Groq (LLaMA 3.3-70B)
4. Crea email HTML premium con tabla de cobros
5. Envía via Resend
6. Actualiza `last_reminder_at` y `last_reminder_type`

## Funcionalidades Principales

1. **Dashboard:** Generar cobros mensuales, ver pendientes agrupados por miembro, marcar pagos
2. **Recordatorios IA:** Mensajes personalizados con Groq para WhatsApp individual o grupal
3. **Email automático:** Edge Function envía recordatorios T-5, T0, T+5 días
4. **Gestión de slots:** Control de cuántos miembros puede tener cada plataforma
5. **Reordenamiento de rotación:** UI con flechas para cambiar orden de pago
6. **Historial de pagos:** Registro completo con método y notas

## Idioma

La UI está completamente en español. Mantener todos los textos, toasts y mensajes en español.
