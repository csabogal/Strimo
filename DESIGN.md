# Strimo — Design System Specification
> *Gestión inteligente y elegante de suscripciones compartidas con estética Dark-first inspirada en Linear y Raycast.*

**Theme:** Dark (Primary)  
**Standard:** RicoUI / DTCG  
**Stack Target:** React 19 + Tailwind CSS v4 + Framer Motion  

Strimo proyecta la precisión y serenidad de un dashboard de ingeniería moderna. La interfaz se asienta sobre un lienzo oscuro profundo teñido de violeta que elimina distracciones y reduce la fatiga visual. Las superficies no son tarjetas planas: son planos de cristal translúcido (*frosted glass*) que capturan la luz mediante bordes sutiles y gradientes atmosféricos en tonos índigo y violeta. La tipografía prioriza la legibilidad de datos financieros y estados de pago, alternando pesos sólidos con micro-etiquetas de alta densidad. El elemento distintivo de la marca es su sistema de micro-interacciones fluidas: botones con sutil elevación háptica (`active:scale-95`) y modales que respiran con Framer Motion.

---

## 1. Tokens — Colores

### 1.1 Paleta Semántica Base

| Nombre | Hex / CSS | Token | Rol |
|--------|-----------|-------|-----|
| **Canvas** | `#0a0b10` | `--color-canvas` | Fondo principal de la aplicación |
| **Surface Deep** | `#10121a` | `--color-surface-deep` | Fondo de sidebar y barras de navegación |
| **Surface Glass** | `rgba(255, 255, 255, 0.03)` | `--color-surface-glass` | Fondo de tarjetas con `backdrop-blur-md` |
| **Surface Hover** | `rgba(255, 255, 255, 0.07)` | `--color-surface-hover` | Estado hover de tarjetas y filas |
| **Border Subtle** | `rgba(255, 255, 255, 0.08)` | `--color-border-subtle` | Separadores y bordes estándar de cards |
| **Border Focus** | `rgba(99, 102, 241, 0.4)` | `--color-border-focus` | Borde activo / hover interactivo |
| **Text High** | `#f8fafc` | `--color-text-high` | Títulos principales y montos monetarios (Slate 50) |
| **Text Body** | `#cbd5e1` | `--color-text-body` | Nombres de miembros, plataformas y textos (Slate 300) |
| **Text Muted** | `#64748b` | `--color-text-muted` | Metadatos, fechas de corte y subtítulos (Slate 500) |

### 1.2 Acentos y Estados

| Nombre | Hex / Gradiente | Token | Rol |
|--------|-----------------|-------|-----|
| **Brand Primary** | `#6366f1` | `--color-brand-primary` | Acento principal (Indigo 500) |
| **Brand Gradient** | `linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)` | `--gradient-primary` | Botones principales y badges destacados |
| **Success** | `#10b981` | `--color-success` | Pagos confirmados y miembros al día (Emerald 500) |
| **Success Glow** | `rgba(16, 185, 129, 0.15)` | `--color-success-glow` | Fondo de badges de pago |
| **Danger** | `#ef4444` | `--color-danger` | Pagos vencidos, botones destructivos (Red 500) |
| **Danger Glow** | `rgba(239, 68, 68, 0.12)` | `--color-danger-glow` | Fondos de alerta y cobros pendientes |
| **Warning** | `#f59e0b` | `--color-warning` | Recordatorios pendientes y días próximos (Amber 500) |

---

## 2. Tokens — Tipografía

### Familia Primaria
- **Familia:** `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Sustituto Web Recomendado:** `Inter` o `Geist Sans`
- **Monoespaciada (Cifras y Fechas):** `'JetBrains Mono', 'SF Mono', Consolas, monospace`

### Escala Tipográfica

| Rol | Tamaño | Line Height | Tracking | Token | Tailwind Equiv |
|-----|--------|-------------|----------|-------|----------------|
| **Display** | 32px (2rem) | 1.2 | -0.025em | `--text-display` | `text-2xl sm:text-3xl font-bold tracking-tight` |
| **Title** | 24px (1.5rem) | 1.25 | -0.02em | `--text-title` | `text-xl sm:text-2xl font-semibold tracking-tight` |
| **Subtitle** | 18px (1.125rem)| 1.4 | -0.015em | `--text-subtitle` | `text-lg font-medium` |
| **Body** | 15px (0.9375rem)| 1.5 | normal | `--text-body` | `text-sm sm:text-base font-normal` |
| **Caption** | 12px (0.75rem) | 1.4 | +0.01em | `--text-caption` | `text-xs text-slate-500 font-medium` |
| **Number** | 16px (1rem) | 1 | tabular-nums | `--text-mono` | `font-mono tabular-nums` |

---

## 3. Tokens — Espaciado y Radios

**Densidad:** Comfortable (optimizado para navegación táctil móvil y escritorio de 44px touch targets).

### 3.1 Radios de Borde (`border-radius`)

| Elemento | Valor | Token | Tailwind Class |
|----------|-------|-------|----------------|
| **Buttons** | 12px | `--radius-button` | `rounded-xl` |
| **Inputs** | 12px | `--radius-input` | `rounded-xl` |
| **Cards & Surfaces** | 16px | `--radius-card` | `rounded-2xl` |
| **Modales & Drawers**| 24px | `--radius-modal` | `rounded-3xl` |
| **Pills & Badges** | 9999px | `--radius-full` | `rounded-full` |

### 3.2 Elevación y Sombras (`box-shadow`)

```css
/* Sombra base sutil para tarjetas flotantes */
--shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);

/* Resplandor violeta en botones primarios y acciones CTA */
--shadow-brand-glow: 0 10px 25px -5px rgba(99, 102, 241, 0.35);

/* Efecto de foco accesible */
--focus-ring: 0 0 0 2px #0a0b10, 0 0 0 4px rgba(99, 102, 241, 0.6);
```

---

## 4. Recetas de Componentes (`Component Recipes`)

### 4.1 Botón Primario
```tsx
<button className="h-11 min-h-[44px] px-6 inline-flex items-center justify-center rounded-xl font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer">
  {label}
</button>
```

### 4.2 Tarjeta de Plataforma / Suscripción (Glass Card)
```tsx
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all duration-200">
  {/* Header con icono y estado de cobro */}
</div>
```

### 4.3 Badge de Estado Financiero
```tsx
// Pagado
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
  Al día
</span>

// Pendiente
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
  Cobro pendiente
</span>
```

---

## 5. Reglas de Oro (Do's & Don'ts)

### ✅ Do's
1. **Mantener siempre el mínimo táctil de 44px:** Todos los botones e inputs interactivos en móvil deben tener `min-h-[44px]` para garantizar accesibilidad según directrices Apple/Android.
2. **Tabular Nums en montos:** Al mostrar dinero (`$45.000 COP`), utiliza siempre la clase `tabular-nums` para que los números no salten de posición al actualizarse.
3. **Tintado cromático:** Todo gris o borde debe tener una gota de azul o violeta (`slate-*` o `white/10`), nunca grises fríos puros de CSS (`#808080`).

### ❌ Don'ts
1. **No anidar tarjetas:** Jamás metas un card con borde dentro de otro card con borde. Usa divisores `border-t border-white/5` o fondos planos `bg-white/[0.02]`.
2. **No texto gris sobre botones de acento:** En botones violetas o gradientes, el texto es estrictamente blanco puro (`text-white`).
3. **No scroll horizontal no controlado:** Asegura que las tablas y listas de miembros usen contenedores responsivos con scroll suave y fading masks.

---

*Especificación certificada por el Agente Artesano bajo el estándar RicoUI Brands para el Dojo de Camilo Sabogal.*
