# Strimo

Sistema de gestión de suscripciones compartidas. Divide costos de servicios como Netflix, Spotify, HBO entre grupos de personas, con cobros automáticos, seguimiento de pagos y recordatorios inteligentes por WhatsApp y email.

## Características

- **Gestión de plataformas:** Agrega servicios de streaming con costo, ciclo de facturación y slots disponibles
- **Gestión de miembros:** Registra personas con datos de contacto (email, teléfono, avatar)
- **Estrategias de cobro:** División equitativa o rotación mensual
- **Generación de cobros:** Crea cobros mensuales automáticamente
- **Seguimiento de pagos:** Marca pagos como completados con historial detallado
- **Recordatorios IA:** Mensajes personalizados generados con LLaMA 3.3-70B (Groq)
- **Integración WhatsApp:** Enlaces directos para enviar cobros
- **Emails automáticos:** Recordatorios programados vía Supabase Edge Functions

## Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.2.0 | Framework UI |
| TypeScript | 5.9.3 | Tipado estático |
| Vite | 7.2.4 | Bundler y dev server |
| Tailwind CSS | 4.1.18 | Estilos utility-first |
| TanStack Query | 5.90.17 | Estado del servidor |
| React Router | 7.12.0 | Navegación SPA |
| React Hook Form | 7.71.1 | Formularios |
| Supabase | 2.90.1 | Backend (DB + Auth) |
| Groq SDK | 0.37.0 | IA (LLaMA 3.3-70B) |
| Framer Motion | 12.26.2 | Animaciones |

## Requisitos Previos

- **Node.js** 18.0 o superior
- **npm** 9.0 o superior
- Cuenta en [Supabase](https://supabase.com) (gratis)
- API Key de [Groq](https://console.groq.com) (gratis)
- API Key de [Resend](https://resend.com) (opcional, para emails)

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/strimo.git
cd strimo
```

### 2. Instalar Node.js

#### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Linux (Fedora/RHEL)

```bash
sudo dnf install nodejs npm
```

#### Linux (Arch)

```bash
sudo pacman -S nodejs npm
```

#### macOS

```bash
# Con Homebrew
brew install node

# O descarga desde https://nodejs.org
```

#### Windows

1. Descarga el instalador desde [nodejs.org](https://nodejs.org) (versión LTS)
2. Ejecuta el instalador
3. Reinicia la terminal

**Verificar instalación:**
```bash
node --version   # v18.x o superior
npm --version    # 9.x o superior
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)

2. Ve a **SQL Editor** y ejecuta:

```sql
-- Tabla de miembros
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de plataformas
CREATE TABLE platforms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cost NUMERIC NOT NULL,
  billing_cycle TEXT DEFAULT '1',
  payment_strategy TEXT DEFAULT 'equal',
  icon_url TEXT,
  total_slots INTEGER DEFAULT 1,
  active_slots INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de suscripciones
CREATE TABLE member_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
  rotation_order INTEGER,
  share_cost NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, platform_id)
);

-- Tabla de cobros mensuales
CREATE TABLE charges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  due_date TEXT,
  status TEXT DEFAULT 'pending',
  last_reminder_at TIMESTAMPTZ,
  last_reminder_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de historial de pagos
CREATE TABLE payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  charge_id UUID REFERENCES charges(id) ON DELETE CASCADE,
  amount_paid NUMERIC NOT NULL,
  payment_date TEXT,
  method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados
CREATE POLICY "Allow all for authenticated" ON members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON platforms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON member_subscriptions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON charges FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON payment_history FOR ALL USING (auth.role() = 'authenticated');
```

3. Ve a **Settings > API** y copia:
   - Project URL
   - anon/public key

### 5. Configurar variables de entorno

Crea `.env.local` en la raíz:

```bash
# Linux/macOS
touch .env.local

# Windows (PowerShell)
New-Item .env.local -ItemType File
```

Contenido:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

**Obtener API Keys:**
- **Supabase:** Dashboard > Settings > API
- **Groq:** [console.groq.com/keys](https://console.groq.com/keys)
- **Resend:** [resend.com/api-keys](https://resend.com/api-keys) (opcional)

### 6. Ejecutar

```bash
# Desarrollo
npm run dev
# Abre http://localhost:5173

# Producción
npm run build
npm run preview
```

---

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | Ejecuta ESLint |

---

## Estructura del Proyecto

```
strimo/
├── src/
│   ├── components/      # Componentes React (ui/, forms/, Layout)
│   ├── pages/           # Páginas (Login, Dashboard, Members, Platforms)
│   ├── providers/       # Context providers (AuthProvider)
│   ├── lib/             # Utilidades (supabase, billing, templates)
│   ├── App.tsx          # Router principal
│   └── main.tsx         # Entry point
├── supabase/
│   └── functions/       # Edge Functions (process-reminders)
├── public/              # Assets estáticos
├── .env.local           # Variables de entorno (crear)
└── package.json         # Dependencias
```

---

## Uso

1. **Registrarse** en `/login`
2. **Agregar plataformas** (Netflix, Spotify, etc.) en `/platforms`
3. **Agregar miembros** del grupo en `/members`
4. **Asignar miembros** a plataformas desde cada tarjeta
5. **Generar cobros** del mes desde el Dashboard
6. **Enviar recordatorios** por WhatsApp o email con IA
7. **Marcar como pagado** cuando recibas el pago

---

## Solución de Problemas

### Puerto en uso

```bash
# Linux/macOS
lsof -i :5173
kill -9 <PID>

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Módulo no encontrado

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de Supabase

1. Verifica `.env.local`
2. Asegúrate que el proyecto esté activo
3. Verifica que las tablas existan

---

## Licencia

MIT
