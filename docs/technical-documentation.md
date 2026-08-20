# Documentación Técnica — LUMAVI ERP

> Versión: 1.0 | Generado: $(date)

---

## 1. Visión General del Sistema

**LUMAVI ERP** es un sistema deplanificación de recursos empresariales profesional diseñado para empresas de importación, exportación y comercialización internacional. El sistema está compuesto por tres aplicaciones independientes que comparten un backend unificado en Supabase:

- **ERP Web** (Next.js 15 App Router) — Panel de administración, reportes, gestión completa
- **App Móvil** (Flutter 3) — Uso comercial en campo, ofertas, clientes, seguimiento de embarques
- **Backend** (Supabase) — PostgreSQL con RLS, Edge Functions, Auth, Storage, Realtime

```
┌─────────────────────────────────────────────────────┐
│                    INTERNET                          │
└──────────┬──────────────────────────────┬───────────┘
           │                              │
┌──────────▼──────────┐    ┌─────────────▼───────────┐
│   ERP WEB (Next.js) │    │   APP MÓVIL (Flutter)   │
│   - Admin/Office    │    │   - Comerciales         │
│   - Gestión total   │    │   - Directivos          │
│   - Reportes        │    │   - Supervisores        │
└──────────┬──────────┘    └─────────────┬───────────┘
           │                              │
           └──────────┬───────────────────┘
                      │ HTTPS / JWT
                      ▼
┌─────────────────────────────────────────────────────┐
│                   SUPABASE                           │
│  ┌──────────┐  ┌────────┐  ┌───────────────────┐   │
│  │PostgreSQL│  │Storage │  │  Edge Functions   │   │
│  │   RLS    │  │  Docs  │  │  Business Logic   │   │
│  │  Auth    │  │ Images │  │  Integrations     │   │
│  └──────────┘  └────────┘  └───────────────────┘   │
│  ┌──────────┐  ┌────────┐                           │
│  │Realtime  │  │  Auth  │                           │
│  │ Channels │  │  JWT   │                           │
│  └──────────┘  └────────┘                           │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│        SERVICIOS ESPECIALIZADOS (opcional)          │
│  ┌──────────────────┐  ┌────────────────────────┐   │
│  │ Document Engine  │  │  Report Engine         │   │
│  │ (PDF/DOCX gen)   │  │  (Excel/PDF masivo)    │   │
│  └──────────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 2. Decisiones Arquitectónicas

### 2.1 Por qué Supabase como backend único

| Decisión | Alternativa | Razón |
|----------|-------------|-------|
| Supabase | Backend custom Node.js | RLS elimina capa de autorización; Realtime evita WebSockets custom; Storage elimina S3; Auth integrado; 80% menos código backend |
| PostgreSQL | MySQL / MongoDB | Relacional estricto para datos financieros; JSONB cuando se requiere flexibilidad; RLS nativo; mejor madurez transaccional |
| Edge Functions | Servidores dedicados | Escalado automático; sin servidores que gestionar; TypeScript nativo; latencia mínima |

### 2.2 Arquitectura Limpia (Clean Architecture)

Aplicamos estrictamente Clean Architecture en las tres aplicaciones:

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION                       │
│  ┌────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │   Pages    │  │   UI     │  │  State/Context  │  │
│  │ Components │  │  Atoms   │  │   Hooks/Store   │  │
│  └────────────┘  └──────────┘  └────────────────┘  │
├─────────────────────────────────────────────────────┤
│                   APPLICATION                        │
│  ┌────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │   UseCases │  │  Ports   │  │   DTOs/Mappers │  │
│  └────────────┘  └──────────┘  └────────────────┘  │
├─────────────────────────────────────────────────────┤
│                     DOMAIN                           │
│  ┌────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Entities  │  │  Value   │  │  Domain Events │  │
│  │            │  │  Objects │  │                │  │
│  └────────────┘  └──────────┘  └────────────────┘  │
│  ┌────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Services  │  │  Rules   │  │  Repositories  │  │
│  │  Domain    │  │  Business│  │  Interfaces    │  │
│  └────────────┘  └──────────┘  └────────────────┘  │
├─────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE                      │
│  ┌────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Supabase   │  │ Storage  │  │  External APIs │  │
│  │ Client     │  │  Client  │  │  Integrations  │  │
│  └────────────┘  └──────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────┘

**Regla fundamental**: Las capas internas (Domain) NO conocen las externas. La dependencia siempre apunta hacia adentro.
```

### 2.3 Stack Tecnológico Detallado

#### 2.3.1 ERP Web (Next.js 15)

**Frontend Core:**
- Next.js 15 (App Router, RSC, Server Actions)
- React 19 (Server Components, Server Actions, use() hook)
- TypeScript 5.x (strict mode, path aliases `@/*`)
- TailwindCSS v4 (utility-first, design system tokens)
- Shadcn/UI v2 (component library, Radix primitives)
- Framer Motion (page transitions, micro-interactions)
- Zustand (global state, persistencia selectiva)
- TanStack Query v5 (SWR, caching, mutations, optimistic updates)
- TanStack Table v8 (virtual scrolling, filters, export)
- React Hook Form + Zod (validación schema-first)
- Supabase Auth (autenticación)
- Recharts / D3 (gráficos dashboard)
- react-pdf / xlsx (reportes)
- cmdk (command palette)
- sonner (toast notifications)
- vaul (drawers)
- embla-carousel (carousels)

**Dev:**
- ESLint 9 (flat config)
- Prettier
- Husky + lint-staged
- Vitest + Testing Library
- Playwright (E2E)
- Storybook (UI component catalog)

#### 2.3.2 App Móvil (Flutter 3)

**Core:**
- Flutter 3.29+ (Dart 3.x)
- Clean Architecture (data/domain/presentation)
- Riverpod 2.x (state management + code generation)
- GoRouter (declarative routing, deep linking)
- Freezed (immutables, unions, JSON serialization)
- Dio (HTTP client, interceptors, retry)
- Supabase Flutter SDK (auth, realtime, storage)
- flutter_secure_storage (tokens)
- hive / drift (offline cache)
- mobile_scanner (scan documents)
- image_picker (photos)
- flutter_signature (signatures)
- firebase_messaging (push notifications)
- fl_chart (dashboard charts)
- Material 3 (Material You, responsive)

**Dev:**
- build_runner (code generation)
- mockito / mocktail (testing)
- Golden tests (UI regression)
- integration_test

#### 2.3.3 Backend (Supabase)

**Database:**
- PostgreSQL 15+
- pg_stat_statements (query optimization)
- pg_cron (scheduled tasks)
- PostGIS (si se requiere geo)

**Edge Functions:**
- Deno runtime
- TypeScript
- Stripe / PayPal integrations
- Email (Resend / SendGrid)
- S3-compatible storage adapters

**RLS Policies:**
- Row Level Security en TODAS las tablas
- Políticas por rol (admin, commercial, supervisor, viewer)
- Políticas por tenant (multi-empresa)

**Auth:**
- Supabase Auth (magic link, OAuth, email/password)
- JWT custom claims (rol, empresa_id, permisos)
- MFA (TOTP)
- Session management

---

## 3. Modelo de Datos

### 3.1 Esquema Multi-tenant (Diseñado - Fase 2)

> **Estado**: Diseñado en arquitectura, pendiente de implementación en Fase 2.
> 
> Actualmente el sistema usa **seguridad por roles** (RLS sobre `fn_usuario_tiene_rol()`),
> sin aislamiento por `empresa_id`. El modelo de datos no incluye `empresa_id` en las tablas
> y no hay políticas RLS que filtren por tenant.

> **Para Fase 2**: Agregar `empresa_id UUID REFERENCES empresas(id)` a todas las tablas,
> crear tabla `empresas`, y políticas RLS: `WHERE empresa_id = auth.jwt() ->> 'empresa_id'`.

```
-- Ejemplo de lo que se implementará:
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    rfc VARCHAR(13),
    direccion TEXT,
    logo TEXT,
    config JSONB DEFAULT '{}'::jsonb
);

-- RLS Policy ejemplo:
CREATE POLICY "empresa_isolation" OF ofertas FOR SELECT TO authenticated
    USING (empresa_id = auth.jwt() ->> 'empresa_id');
```

### 3.2 Módulos y Entidades Principales

**CATÁLOGOS BASE**
- productos (SKU, descripción, categoría, precio_base, peso, origen, fracción_arancelaria)
- clientes (nombre, rfc, dirección, contacto, crédito, condiciones_pago)
- proveedores (nombre, país, contacto, condiciones_pago, rating)
- importadoras (nombre, agentes, dirección, aduana_asignada)
- comerciales (usuario_id, comisión, zona, metas)
- categorías (jerárquicas, tipo)

**OPERACIONES**
- ofertas (número, cliente_id, comercial_id, estado, vigencia, total)
- fichas_oferta (producto_id, cantidad, precio_unitario, descuento, subtotal)
- contenedores (número, tipo, tamaño, booking, naviera, ETA, ETD)
- embarques (contenedor_id, oferta_id, estado, origen, destino, tracking)
- expedientes (número, tipo, estado, documentos_asociados)

**FINANZAS**
- facturas (número, tipo, cliente_id, oferta_id, total, IVA, estado)
- cobros (factura_id, monto, fecha, método_referencia, estado)
- pagos (proveedor_id, monto, fecha, método, estado)
- gastos (categoría, monto, referencia, imputable_a, comprobante)

**DOCUMENTOS**
- documentos (id, versión, tipo, storage_path, metadata, firmado)
- versiones_documento (número_version, archivo, usuario, fecha)
- historial_documento (acción, usuario, timestamp)

**AUDITORÍA**
- auditoria_log (tabla, operación, usuario_id, datos_previos, datos_nuevos, ip, timestamp)
- actividad_usuarios (usuario_id, acción, módulo, metadata, timestamp)

### 3.3 Convenciones de Base de Datos

```
Naming:
  - Tablas: plural_snake_case (ej: productos, ofertas, fichas_oferta)
  - Columnas: snake_case
  - PKs: id (UUID v7, sortable)
  - FKs: entidad_id (ej: cliente_id)
  - Índices: idx_tabla_columna
  - Triggers: trg_tabla_evento

Columnas obligatorias en TODAS las tablas:
  - id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - empresa_id UUID REFERENCES empresas(id) NOT NULL
  - created_at TIMESTAMPTZ DEFAULT now()
  - updated_at TIMESTAMPTZ DEFAULT now()
  - deleted_at TIMESTAMPTZ DEFAULT NULL (soft delete)

Soft Delete:
  - Nunca se eliminan registros financieros
  - deleted_at = NOW() para ocultar
  - RLS filtra WHERE deleted_at IS NULL
  - Vistas con WITH CHECK OPTION que excluyen deleted
```

---

## 4. Arquitectura de Seguridad

### 4.1 Esquema de Autorización

**JWT Token Content:**
```json
{
  "sub": "user_uuid",
  "email": "user@email.com",
  "role": "admin",
  "empresa_id": "empresa_uuid",
  "permisos": ["ofertas:read", "ofertas:write", "facturas:delete", ...],
  "iat": 1234567890,
  "exp": 1234567890
}
```

**RLS Policies (ejemplo para ofertas):**
```sql
CREATE POLICY "Comerciales ven sus ofertas"
  ON ofertas FOR SELECT
  USING (
    empresa_id = auth.jwt() ->> 'empresa_id'
    AND (
      auth.jwt() ->> 'role' = 'admin'
      OR comercial_id = auth.uid()
    )
  );
```

### 4.2 Niveles de Acceso

| Rol | Alcance |
|-----|---------|
| admin | Acceso total a su empresa |
| commercial | Sus ofertas, sus clientes, lectura productos |
| supervisor | Su equipo comercial, reportes, dashboard |
| viewer | Solo lectura en módulos asignados |
| finance | Módulos financieros, no operativos |

### 4.3 Protecciones

- Rate limiting por IP/usuario (Supabase + Edge Functions)
- CSRF tokens en todas las mutaciones
- Input sanitization en Zod schemas
- SQL injection prevenido por Supabase client parametrizado
- Audit logging obligatorio en CREATE/UPDATE/DELETE
- CORS restrictivo por tenant
- Encrypted secrets en Edge Functions

---

## 5. Diseño de la API

No creamos REST API tradicional. Supabase actúa como API directa.

### 5.1 Endpoints

**Lecturas: Supabase client directo (RLS protege)**
```sql
GET /rest/v1/ofertas?select=*,clientes(*),fichas_oferta(*)
```

**Mutaciones: Server Actions (Next.js) con validación Zod**
```typescript
export async function crearOferta(data: OfertaSchema) {
  'use server'
  const validated = ofertaSchema.parse(data)
  return await supabase.from('ofertas').insert(validated)
}
```

**Lógica compleja: Edge Functions**
```http
POST /functions/v1/generar-pdf-oferta
POST /functions/v1/calcular-comisiones
POST /functions/v1/enviar-notificacion
POST /functions/v1/sincronizar-movil
```

**Realtime: Supabase Channels (cuando aplica)**
```typescript
supabase.channel('ofertas')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ofertas' }, payload => {
    // notificar cambios en tiempo real
  })
```

### 5.2 CQRS Ligero

Para reportes pesados y dashboards, creamos vistas materializadas en PostgreSQL que se refrescan periódicamente. La app consulta estas vistas en lugar de hacer JOINs pesados sobre tablas transaccionales.

---

## 6. Flujo de Datos — Operación Principal

### 6.1 Creación de Oferta Comercial

```
CREACIÓN DE OFERTA COMERCIAL

1. Comercial crea oferta en App Móvil (offline-first)
   → Guarda en caché local (Hive)
   → Encola sincronización

2. App detecta conectividad
   → Riverpod provider dispara sync
   → Dio envía POST a Supabase (via Edge Function)
   → Edge Function valida, calcula totales, inserta

3. Supabase RLS verifica permisos
   → INSERT permitido si comercial_id = auth.uid()

4. Base de datos inserta oferta + fichas_oferta
   → Trigger dispara auditoría
   → Realtime notifica a ERP Web

5. ERP Web (admin) recibe notificación
   → Actualiza tabla en tiempo real
   → Admin puede modificar, aprobar, generar PDF

6. Admin genera PDF de oferta
   → Edge Function procesa template
   → Sube a Storage
   → Guarda referencia en documentos
   → Envía link al cliente (opcional)
```

---

## 7. Arquitectura de la App Móvil (Flutter)

### 7.1 Capas de Clean Architecture

```
lib/
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   ├── utils/
│   └── theme/
├── data/
│   ├── datasources/
│   │   ├── remote/ (Supabase API calls)
│   │   └── local/  (Hive/Drift cache)
│   ├── models/     (JSON serialization, freezed)
│   └── repositories/ (implementations)
├── domain/
│   ├── entities/   (business objects)
│   ├── repositories/ (abstract interfaces)
│   └── usecases/   (business rules)
└── presentation/
    ├── providers/   (Riverpod)
    ├── pages/
    ├── widgets/
    └── routes/     (GoRouter)
```

**Offline Strategy:**
- Primero intenta cache → si falla, va a red
- Mutaciones en cola offline
- Sincronización background al reconectar
- Conflictos resueltos con timestamp (last-write-wins con fusión)

### 7.2 Navegación

```
/ (login / splash)
/dashboard (indicadores para móvil)
/ofertas (lista + filtros)
/ofertas/:id (detalle)
/ofertas/:id/firmar
/clientes (lista + búsqueda rápida)
/clientes/:id
/productos (búsqueda + scanner)
/productos/:id
/embarques (tracking)
/embarques/:id (mapa + estados)
/cobros (pendientes)
/pagos (pendientes)
/perfil
/notificaciones
```

---

## 8. Diseño UX/UI — Design Tokens

El sistema usará un Design System propio con naming inspirado en la marca "LUMAVI".

```
Design Tokens:

Colors:
  primary:   #1A56DB (azul corporativo)
  secondary: #7C3AED (púrpura acento)
  success:   #059669
  warning:   #D97706
  danger:    #DC2626
  surface:   { light: #FFFFFF, dark: #0F172A }
  background:{ light: #F8FAFC, dark: #020617 }

Typography:
  font-family: 'Inter', sans-serif
  mono: 'JetBrains Mono', monospace
  scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48

Spacing (4px base):
  0 / 1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / 32

Radius:
  sm: 4px, md: 8px, lg: 12px, xl: 16px, full: 9999px

Shadows:
  sm / md / lg / xl / 2xl

Key UX Patterns:
  - Command Palette (⌘K): búsqueda global + acciones rápidas
  - Breadcrumbs: navegación contextual
  - Favoritos: módulos más usados al inicio
  - Empty states: mensajes contextuales
  - Loading skeletons: shimmer placeholders
  - Optimistic updates: cambios inmediatos con rollback
  - Undo: para acciones destructivas con timeout
  - Keyboard shortcuts: navegación avanzada
```

### 8.1 Módulos y sus Relaciones

```
┌──────────────────────────────────────────────────────────┐
│                    DASHBOARD EJECUTIVO                    │
│  KPIs │ Gráficos │ Alertas │ Actividad reciente          │
└────────────────┬─────────────────────────────────────────┘
               │
      ┌───────────┼───────────┬──────────────────┐
      ▼           ▼           ▼                  ▼
┌─────────┐ ┌─────────┐ ┌─────────┐    ┌───────────────┐
│OFERTAS  │ │CLIENTES │ │PRODS    │    │CONTENEDORES   │
│- Crear  │ │- CRM    │ │- Catálo │    │- Booking      │
│- Fichas │ │- Hist   │ │- Precios│    │- Embarques    │
│- PDF    │ │- Credit │ │- Stock  │    │- Tracking     │
└────┬────┘ └────┬────┘ └────┬────┘    └───────┬───────┘
      │           │           │                  │
      ▼           ▼           ▼                  ▼
┌──────────────────────────────────────────────────────────┐
│                    FINANZAS                              │
│  Facturación │ Cobros │ Pagos │ Gastos │ Comisiones     │
└────────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│                    DOCUMENTACIÓN                         │
│  Storage │ Versiones │ Firmas │ Historial               │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│                    REPORTES                              │
│  Excel │ PDF │ CSV │ Automáticos │ Dashboard             │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│                    CONFIGURACIÓN                         │
│  Empresa │ Usuarios │ Roles │ Permisos │ Auditoría      │
└──────────────────────────────────────────────────────────┘
```

---

## 9. Estrategia de Despliegue

### 9.1 Entornos

```
Development (dev.taga.app)
  - Rama: develop
  - Supabase project: taga-dev
  - Despliegue automático al hacer merge

Staging (staging.taga.app)
  - Rama: staging
  - Supabase project: taga-staging
  - QA antes de producción

Production (app.taga.app)
  - Rama: main
  - Supabase project: taga-prod
  - Branch protection + code review obligatorio
```

### 9.2 Infraestructura

**Frontend (Next.js):**
- Vercel (Pro)
- Automatic SSL
- Edge Functions (Vercel Edge)
- ISR para páginas estáticas
- CDN global

**Supabase:**
- Plan Pro (escalable a Team)
- Point-in-time recovery
- Daily backups
- Read replicas (cuando sea necesario)

**Flutter App:**
- Google Play Store
- Apple App Store
- Codemagic / GitHub Actions CI/CD
- Over-the-air updates (shorebird.dev)

---

## 10. Estrategia de Testing

```
Pirámide de Testing:

                   ╱  E2E  ╲              (Playwright, integration_test)
                  ╱─────────╲
                 ╱ Integration╲           (Vitest + Supabase local)
                ╱──────────────╲
               ╱   Unit Tests    ╲        (Vitest, mockito)
              ╱────────────────────╲
             ╱   Static Analysis    ╲     (TypeScript strict, ESLint)
            ╱──────────────────────────╲

Cobertura objetivo:
  - Domain layer: 100%
  - Use cases: 90%+
  - Components críticos: 80%+
  - E2E: Flujos principales completos
```

---

## 11. Estructura del Repositorio

```
taga-erp/
├── docs/                     # Documentación técnica
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   └── deployment.md
├── packages/
│   ├── shared/               # Tipos y schemas compartidos
│   │   ├── src/
│   │   │   ├── types/        # TypeScript interfaces
│   │   │   ├── schemas/      # Zod schemas (validación)
│   │   │   └── constants/    # Enums, constantes
│   │   └── package.json
│   └── database/             # Migraciones SQL
│       ├── migrations/
│       ├── seeds/
│       ├── policies/
│       ├── triggers/
│       ├── functions/
│       └── views/
├── apps/
│   ├── web/                  # Next.js 15 ERP
│   │   ├── src/
│   │   │   ├── app/          # App Router pages
│   │   │   ├── components/   # UI Components
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── lib/          # Utilities
│   │   │   ├── stores/       # Zustand stores
│   │   │   ├── services/     # Application services
│   │   │   └── types/        # Web-specific types
│   │   ├── public/
│   │   ├── tests/
│   │   └── package.json
│   ├── mobile/               # Flutter app
│   │   ├── lib/
│   │   │   ├── core/
│   │   │   │   ├── data/
│   │   │   │   ├── domain/
│   │   │   │   └── presentation/
│   │   │   ├── test/
│   │   │   └── pubspec.yaml
│   │   └── test/
│   └── edge-functions/       # Supabase Edge Functions
       ├── _shared/
       ├── generar-pdf/
       ├── enviar-email/
       ├── calcular-comisiones/
       ├── sincronizar-movil/
       └── webhooks/
├── scripts/                  # Scripts de automatización
│   ├── setup-dev.sh
│   ├── seed-data.ts
│   └── backup.sh
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd-web.yml
│       └── cd-mobile.yml
├── .gitignore
├── package.json              # Monorepo root
└── README.md
```

---

## 12. Plan de Implementación por Fases

| Fase | Descripción | Duración Est. |
|------|-------------|---------------|
| 1 | Arquitectura global | ✅ COMPLETADA |
| 2 | Modelo de base de datos (ERD, migraciones, RLS) | Siguiente |
| 3 | Diseño UX/UI (design system, componentes base) | |
| 4 | Backend compartido (Edge Functions, Seeds) | |
| 5 | ERP Web (módulos core + dashboard) | |
| 6 | App Flutter (Clean Architecture + módulos) | |
| 7 | Sistema documental (Storage, firmas, versiones) | |
| 8 | Reportes (Excel, PDF, CSV, programados) | |
| 9 | Seguridad (auditoría, rate limiting, MFA) | |
| 10 | Optimización (rendimiento, caché, queries) | |
| 11 | Testing (unitario, integración, E2E) | |
| 12 | Despliegue (CI/CD, entornos, monitoreo) | |
| 13 | Documentación técnica final | |

---

## 13. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Vendor lock-in con Supabase | Baja | Alto | Toda la lógica en dominio; abstracción de infraestructura |
| Sincronización offline compleja | Media | Alto | Estrategia clara de resolución de conflictos; testing exhaustivo |
| RLS mal diseñado filtra datos | Baja | Crítico | Test de RLS automatizados; revisión de seguridad |
| Rendimiento de consultas multi-tenant | Media | Medio | Vistas materializadas; índices compuestos; pg_stat_statements |
| Escalamiento de Storage | Baja | Medio | Políticas de retención; limpieza programada |

---

## 14. Aprobación

Esta arquitectura propone la base completa del sistema LUMAVI ERP.

**Para continuar a la Fase 2 (Modelo de Base de Datos):**
Confirmar aprobación o solicitar ajustes en cualquier aspecto de esta arquitectura.

---