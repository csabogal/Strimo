# Strimo

Sistema de gestión de suscripciones compartidas. Permite dividir costos de servicios como Netflix, Spotify, HBO entre grupos de personas, con cobros automáticos, seguimiento de pagos y recordatorios inteligentes por WhatsApp y email.

## Características

- **Gestión de plataformas:** Agrega servicios de streaming con costo, ciclo de facturación y slots disponibles
- **Gestión de miembros:** Registra personas con sus datos de contacto
- **Estrategias de cobro:** División equitativa o rotación mensual
- **Generación de cobros:** Crea cobros mensuales automáticamente
- **Seguimiento de pagos:** Marca pagos como completados con historial
- **Recordatorios IA:** Mensajes personalizados generados con LLaMA 3.3-70B
- **Integración WhatsApp:** Enlaces directos para cobrar
- **Emails automáticos:** Recordatorios programados vía Edge Functions

## Requisitos Previos

- **Node.js** 18.0 o superior
- **npm** 9.0 o superior (incluido con Node.js)
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
# Usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
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
# Usando Homebrew
brew install node

# O descarga el instalador desde https://nodejs.org
```

#### Windows

1. Descarga el instalador desde [https://nodejs.org](https://nodejs.org) (versión LTS recomendada)
2. Ejecuta el instalador y sigue las instrucciones
3. Reinicia la terminal después de instalar

**Verificar instalación (todos los SO):**
```bash
node --version   # Debe mostrar v18.x o superior
npm --version    # Debe mostrar 9.x o superior
```

### 3. Instalar dependencias del proyecto

```bash
npm install
```

### 4. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)

2. Ve a **SQL Editor** y ejecuta el siguiente script para crear las tablas:

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

-- Tabla de suscripciones (relación miembro-plataforma)
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

-- Habilitar Row Level Security (opcional pero recomendado)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo para usuarios autenticados)
CREATE POLICY "Allow all for authenticated users" ON members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON platforms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON member_subscriptions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON charges FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON payment_history FOR ALL USING (auth.role() = 'authenticated');
```

3. Ve a **Settings > API** y copia:
   - Project URL
   - anon/public key

### 5. Configurar variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```bash
# Linux/macOS
touch .env.local

# Windows (PowerShell)
New-Item .env.local -ItemType File

# Windows (CMD)
type nul > .env.local
```

Agrega las siguientes variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

**Obtener las API Keys:**

- **Supabase:** Dashboard > Settings > API
- **Groq:** [console.groq.com/keys](https://console.groq.com/keys) (crear cuenta gratis)
- **Resend:** [resend.com/api-keys](https://resend.com/api-keys) (opcional, para emails)

### 6. Ejecutar el proyecto

#### Modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

#### Build de producción

```bash
npm run build
npm run preview
```

---

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con HMR |
| `npm run build` | Compila TypeScript y genera build de producción |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | Ejecuta ESLint para verificar código |

---

## Estructura del Proyecto

```
strimo/
├── src/
│   ├── components/      # Componentes React reutilizables
│   ├── pages/           # Páginas de la aplicación
│   ├── providers/       # Context providers (Auth)
│   └── lib/             # Utilidades y cliente Supabase
├── supabase/
│   └── functions/       # Edge Functions (recordatorios)
├── public/              # Archivos estáticos
├── .env.local           # Variables de entorno (crear)
└── package.json         # Dependencias y scripts
```

---

## Uso Básico

1. **Registrarse/Iniciar sesión** en `/login`
2. **Agregar plataformas** (Netflix, Spotify, etc.) en `/platforms`
3. **Agregar miembros** (personas del grupo) en `/members`
4. **Asignar miembros** a plataformas desde la tarjeta de cada plataforma
5. **Generar cobros** del mes actual desde el Dashboard
6. **Enviar recordatorios** por WhatsApp o email
7. **Marcar como pagado** cuando recibas el pago

---

## Solución de Problemas

### Error: "port already in use"

```bash
# Linux/macOS
lsof -i :5173
kill -9 <PID>

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Error: "module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de conexión a Supabase

1. Verifica que las variables en `.env.local` sean correctas
2. Asegúrate de que el proyecto en Supabase esté activo
3. Revisa que las tablas estén creadas correctamente

### La aplicación no carga

1. Limpia la caché del navegador
2. Verifica la consola del navegador (F12) para errores
3. Reinicia el servidor de desarrollo

---

## Tecnologías

- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Supabase](https://supabase.com)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com)
- [Framer Motion](https://www.framer.com/motion)
- [Groq API](https://groq.com)

---

## Licencia

MIT
