# TAGA Design System — UX/UI v1.0

> Diseñado para usuarios con poco conocimiento técnico
> Inspirado en: Notion (claridad), Slack (calidez), Stripe (confianza)

---

## PRINCIPIOS DE DISEÑO

1. **Obvio sobre clever** — Cada acción debe ser evidente, no requiere manual
2. **Una cosa a la vez** — Las pantallas no sobrecargan; revelan información progresivamente
3. **Errar no cuesta** — Toda acción destructiva tiene confirmación y undo
4. **Idioma del usuario** — "Ofertas", no "Cotizaciones"; "Clientes", no "Entidades"
5. **Toque humano** — Mensajes amigables, no códigos de error; ilustraciones en empty states

---

## COLORES

Seleccionados para máxima legibilidad y contraste WCAG 2.1 AA.

```css
--primary: #0A6E4F;        /* Verde bosque — acción principal */
--primary-foreground: #FFFFFF;

--secondary: #F0FDF4;      /* Verde muy claro — fondos secundarios */
--secondary-foreground: #166534;

--accent: #E8F5E9;         /* Acento hover */

--background: #FAFAF9;     /* Fondo cálido claro */
--foreground: #1C1917;     /* Texto principal alto contraste */

--muted: #F5F5F4;          /* Fondos de tarjetas */
--muted-foreground: #78716C;

--destructive: #DC2626;    /* Solo para errores/eliminar */
--warning: #F59E0B;
--success: #10B981;
--info: #3B82F6;

--border: #E7E5E4;
--ring: #0A6E4F;

--sidebar: #1C1917;        /* Sidebar oscura pero no negra */
--sidebar-foreground: #FAFAF9;
```

**Modo oscuro**: Inversión con matices más suaves para reducir fatiga visual.

---

## TIPOGRAFÍA

```css
--font-family: 'Inter', sans-serif;    /* UI general */
--font-mono: 'JetBrains Mono', monospace;  /* Código/datos */

--text-xs: 0.75rem;    /* 12px - etiquetas */
--text-sm: 0.875rem;   /* 14px - metadata */
--text-base: 1rem;     /* 16px - cuerpo principal (base mínima) */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px - subtítulos */
--text-2xl: 1.5rem;    /* 24px - títulos de sección */
--text-3xl: 1.875rem;  /* 30px - títulos de página */
--text-4xl: 2.25rem;   /* 36px - dashboard */

--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Reglas**:
- Mínimo 16px para texto de contenido
- Interlineado mínimo 1.5
- Títulos con tracking (letter-spacing) -0.01em para legibilidad

---

## SPACING

Basado en 4px con escala exponencial:

```
0 / 1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 56 / 64
```

- **Card padding**: p-6 (24px)
- **Section gap**: gap-8 (32px)
- **Form spacing**: space-y-4 (16px)
- **List items**: gap-3 (12px)

---

## LAYOUT

```
┌──────────┬──────────────────────────────────────────┐
│          │  HEADER                                  │
│  SIDEBAR │  breadcrumbs / search / user             │
│          ├──────────────────────────────────────────┤
│  Icon    │                                          │
│  + text  │  MAIN CONTENT                            │
│          │  (max-w-7xl mx-auto)                     │
│  Naveg.  │                                          │
│  primaria│                                          │
│          │                                          │
│  ———     │                                          │
│          │                                          │
│  Naveg.  │                                          │
│  secund. │                                          │
│          │                                          │
│          └──────────────────────────────────────────┘
│          │  FOOTER (minimal)                        │
└──────────┴──────────────────────────────────────────┘

Sidebar: w-64 (256px) colapsable a w-16 (64px)
Header:  h-16 (64px) sticky
Content: max-w-7xl (1280px) centered
```

---

## COMPONENTES CLAVE

### Sidebar
- Iconos grandes (24x24) + etiquetas siempre visibles
- Subrayado de sección activa con barra de color (pill)
- Colapsable con tooltips; modo "iconos solamente" en dispositivos pequeños
- Favoritos al inicio (configurables por usuario)

### Header
- Breadcrumbs con separador "/"
- Barra de búsqueda global (⌘K) accesible siempre
- Avatar de usuario + menú desplegable
- Notificaciones con badge

### Tablas
- Diseño tipo "lista" más que "cuadrícula" — más legible
- Filas con hover sutil
- Paginación numérica + "Ver más"
- Scroll horizontal solo si es necesario
- Búsqueda y filtros inline (no en modal)

### Formularios
- Una columna para simplicidad (dos columnas solo en pantallas grandes)
- Etiquetas siempre visibles (no placeholders como labels)
- Botón de guardar siempre visible, no al final de scroll
- Validación inline (no al enviar)
- Wizard paso a paso para procesos complejos (crear oferta)

### Botones
- **Primario**: Filled, color corporativo, tamaño grande (h-11)
- **Secundario**: Outline, para acciones alternativas
- **Ghost**: Para acciones en tablas (editar, eliminar)
- **Icono + texto**: Siempre que sea posible
- Mínimo área táctil 44x44 (accesibilidad)

### Cards
- Border sutil, shadow suave (sm)
- Padding generoso (p-6)
- Hover con translate-y-(-1) + shadow-md

---

## ANIMACIONES

```css
/* Transiciones base */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;

/* Page transitions: fade + slide up */
Page enter: opacity 0 → 1, translateY 8 → 0
Page exit: opacity 1 → 0

/* Micro-interacciones */
Button hover: scale 1.02
Card hover: translateY -2px + shadow increase
Sidebar item: background color transition
Modal: backdrop blur + scale 0.95 → 1
Toast: slide in from right
```

---

## DISEÑO RESPONSIVE

| Breakpoint | Width | Layout |
|------------|-------|--------|
| mobile | < 640px | Sidebar como bottom nav, contenido full-width |
| tablet | 640-1024px | Sidebar colapsada (iconos), contenido ajustado |
| desktop | 1024-1536px | Sidebar completa, max-w-7xl content |
| wide | > 1536px | Sin límite máximo, espaciado generoso |

**Mobile first** — las pantallas se diseñan primero para móvil y se expanden.

---

## PANTALLAS WIREFRAME

### 1. Dashboard Ejecutivo
```
┌──────────────────────────────────────────────────┐
│ Header: [TAGA logo] [⌘K Buscar...] [🔔] [👤]     │
├──────────────────────────────────────────────────┤
│                                                    │
│  📊 Resumen del Mes                                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  │$450K  │ │$230K  │ │$89K   │ │12     │             │
│  │Ventas │ │Cobrado│ │Pend.  │ │Ofertas│             │
│  │+12%   │ │-5%    │ │  ↓    │ │+3     │             │
│  └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                    │
│  📈 Ventas Últimos 12 Meses  [Gráfico de barras]  │
│                                                    │
│  🚢 Operaciones Activas  📋 Cobros Pendientes     │
│  ┌─────────────────┐  ┌─────────────────┐        │
│  │ Contenedor XXXX │  │ Factura F-001   │        │
│  │ 🟢 En tránsito  │  │ Cliente XYZ     │        │
│  │ ETA: 05/07      │  │ $12,500 - Vence │        │
│  └─────────────────┘  │  10/07          │        │
│                        └─────────────────┘        │
└──────────────────────────────────────────────────┘
```

### 2. Lista de Ofertas
```
┌──────────────────────────────────────────────────┐
│ Header: Dashboard > Ofertas                       │
│                                                    │
│  [🔍 Buscar ofertas...]  [➕ Nueva Oferta]         │
│  [Filtros: Estado ▾] [Fecha ▾] [Comercial ▾]     │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ OF-2026-00123 │ Cliente ABC  │ $45,000 │ 🟢 │ │
│  │ Hace 2 días   │ Juan Pérez   │ Aceptada│     │ │
│  ├──────────────────────────────────────────────┤ │
│  │ OF-2026-00122 │ Cliente XYZ  │ $23,000 │ 🟡 │ │
│  │ Hace 5 días   │ María López  │ Borrador│     │ │
│  ├──────────────────────────────────────────────┤ │
│  │ OF-2026-00121 │ Cliente DEF  │ $67,000 │ 🔴 │ │
│  │ Hace 1 semana │ Juan Pérez   │ Rechazad│     │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ← Anterior  1 2 3 ... 15  Siguiente →            │
└──────────────────────────────────────────────────┘
```

### 3. Nueva Oferta (Wizard)
```
┌──────────────────────────────────────────────────┐
│ Header: Ofertas > Nueva Oferta                     │
│                                                    │
│  Paso 1 de 3: Datos Generales                      │
│  ●●●○○                                            │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Cliente:     [Seleccionar... ▾]                │ │
│  │ Comercial:   [Juan Pérez ▾]                    │ │
│  │ Operación:   [Importación ▾]                   │ │
│  │ Moneda:      [USD ▾]                           │ │
│  │ Incoterm:    [FOB ▾]                           │ │
│  │ Vigencia:    [📅 30/07/2026]                   │ │
│  │                                                │ │
│  │ [← Atrás]                    [Continuar →]     │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## ICONOGRAFÍA

- **Lucide Icons** — consistentes, línea delgada, reconocibles
- Tamaño estándar: 20px (interfaz), 24px (sidebar), 32px (estados vacíos)
- Texto siempre acompaña iconos críticos

---

## COPY (TONO DE VOZ)

| Situación | Frase |
|-----------|-------|
| Empty state productos | "Aún no tienes productos. Crea tu primer producto para comenzar." |
| Error de red | "Parece que hubo un problema de conexión. Reintentamos automáticamente." |
| Éxito | "Oferta creada correctamente." |
| Confirmación eliminar | "¿Eliminar esta oferta? Esta acción no se puede deshacer." |
| Carga | "Cargando..." + skeleton |

**Nunca usar**: "Error 500", "undefined", "null", "Internal Server Error"
**Siempre usar**: Lenguaje cálido, primera persona del plural ("nosotros", "tu")

---

## ACCESIBILIDAD

- Contraste mínimo 4.5:1 (WCAG AA)
- Focus visible en todos los elementos interactivos
- Labels en todos los inputs
- Roles ARIA en componentes dinámicos
- Navegación por teclado completa (Tab, Enter, Escape, flechas)
- Texto redimensionable hasta 200% sin pérdida de funcionalidad
- Modo oscuro respeta preferencia del sistema
