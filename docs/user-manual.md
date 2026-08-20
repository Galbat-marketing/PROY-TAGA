# Manual de Usuario — LUMAVI ERP

> Versión: 1.0 | Última actualización: $(date)

---

## 1. Introducción

**LUMAVI ERP** es un sistema de gestión empresarial para importación y comercialización internacional. El sistema ayuda a gestionar ofertas, clientes, productos, embarques, finanzas y documentación comercial.

El sistema se accede mediante navegador web y está organizado en módulos accesibles desde la barra lateral. El acceso está controlado por roles de Supabase Auth.

---

## 2. Acceso al Sistema

### 2.1 Credenciales de Acceso

- **Tipo de autenticación**: Supabase Auth (email/password, OAuth Google/GitHub)
- **Pantalla de login**: `https://app.lumavi.app/login`
- **Primera acceso**: El administrador crea usuarios y asigna roles
- **Recuperación de contraseña**: Enlace en la pantalla de login

### 2.2 Roles de Acceso

Los permisos se gestionan a nivel de base de datos mediante políticas RLS por rol:

| Rol | Descripción |
|-----|-------------|
| **admin** | Acceso total a todos los módulos y configuración |
| **commercial** | Sus ofertas, productos, clientes (propios) |
| **supervisor** | Su equipo comercial, reportes, dashboard |
| **finance** | Módulos financieros: facturas, cobros, pagos |
| **viewer** | Solo lectura (módulos asignados) |

### 2.3 Flujo de Login

1. Accede a la URL del sistema
2. Si no está autenticado, se redirige automáticamente a la pantalla de login
3. Ingresa email y contraseña (o usa proveedor OAuth)
4. Al exitoso login, se redirige automáticamente al panel principal (`/dashboard`)
5. La sesión se mantiene mientras el navegador esté abierto

**Cerrar sesión**: En el menú de usuario (esquina superior derecha) → `Cerrar sesión`, o accede directamente a `/login`.

---

## 3. Interfaz y Navegación

### 3.1 Estructura de la Interfaz

La aplicación usa un diseño Layout fijo:

```
┌─────────────────────────────────────────────┐
│  SIDEBAR (izquierda)                        │
│  • Logo LUMAVI                              │
│  • Menú de navegación por categorías        │
│  • Favoritos (acceso rápido)                │
│  • Botón contraer/expandir menú             │
└──────────────┬────────────────────────────┘
               │
   ┌─────────────▼─────────────────────────────┐
   │  HEADER (superior, sticky)                │
   │  • Pan de migas (breadcrumbs)             │
   │  • Botón Buscar (⌘K) - Command Palette    │
   │  • Notificaciones                         │
   │  • Menú de usuario (nombre, email,       │
   │    configuración de apariencia, logout)   │
   └──────────────┬────────────────────────────┘
                │
    ┌─────────────▼─────────────────────────────┐
    │  ÁREA PRINCIPAL (contenido)               │
    │  • Indicadores/KPIs (dashboard)           │
    │  • Listados, formularios, vistas          │
    │  • Tablas con filtros y acciones          │
    └───────────────────────────────────────────┘
```

### 3.2 Barra Lateral (Menú de Navegación)

La sidebar tiene las siguientes categorías y elementos:

**Favoritos** (siempre visible al expandir):
- Dashboard
- Ofertas

**Principal**:
- Dashboard — Panel principal con indicadores
- Ofertas — Gestión de ofertas comerciales
- Productos — Catálogo y catálogo de productos
- Clientes — Gestión de clientes
- Proveedores — Gestión de proveedores

**Operaciones**:
- Contenedores — Gestión de contenedores y bookings
- Embarques — Seguimiento de embarques
- Importadoras — Gestión de importadoras

**Documentos**:
- Documentos — Subir, ver y gestionar documentos

**Finanzas**:
- Facturas — Crear y gestionar facturas
- Cobros — Registrar y seguir pagos recibidos
- Pagos — Programar pagos a proveedores

**Sistema** (solo admin/supervisor):
- Reportes — Reportes ejecutivos y exportación
- Comerciales — Gestión de comerciales y comisiones
- Roles — Asignar roles y permisos
- Permisos — Definir permisos granulares
- Auditoría — Ver historial de operaciones
- Configuración — Configuración del sistema

**Comportamiento**:
- Los ítems de menú visibles dependen del rol del usuario (configurado en base de datos)
- El menú se puede contraer/expandir con el botón en la sidebar
- El logo muestra "LUMAVI" (expandido) o "L" (contraer)

### 3.3 Header (Barra Superior)

La header es fija (sticky) en la parte superior:

**Izquierda**: Pan de migas (`breadcrumbs`) que muestra la ruta actual.

**Centro**: Espacio en blanco.

**Derecha**:
- **Botón Buscar (lupa ⌘K)**: Abre la Command Palette para búsqueda global
- **Campana de notificaciones**: Icono de bell con contador
- **Menú de usuario** (dropdown):
  - Foto/initials del usuario + nombre completo
  - Email de usuario
  - `Apariencia` — Configuración de tema (claro/oscuro)
  - Separador
  - `Cerrar sesión` — Cierra la sesión y redirige a `/login`

### 3.4 Command Palette (Búsqueda Global)

- Acceso: Presionar `⌘K` (Mac) o `Ctrl+K` (Windows/Linux)
- Funcionalidad: Búsqueda rápida de ofertas, clientes, productos
- Navegación: Permite saltar a cualquier módulo por nombre
- Resultados: Muestra coincidencias en módulos y entidades

---

## 4. Módulos Principales

### 4.1 Módulo ofertas

**Vista lista**:
- Tabla con ofertas creadas
- Filtros: estado (borrador, enviada, aceptada, rechazada, convertida), cliente, comercial, fecha
- Acciones por fila: Ver, Editar, Cambiar estado, Generar PDF

**Crear oferta nueva**:
1. Ir a `Ofertas` → `+` (botón nuevo)
2. Seleccionar cliente (buscador)
3. Seleccionar comercial (usuario vinculado a tu sesión)
4. Agregar fichas de producto (producto + cantidad + precio)
5. Revisar totales: subtotal, descuento, IVA, total
6. Guardar como `borrador` o `enviada`

**Estados de oferta**:
- `borrador` — Solo visible al creador, no enviado
- `enviada` — Enviada al cliente, pending
- `aceptada` — Aprobada por cliente
- `rechazada` — Rechazada por cliente
- `convertida` — Convertida a factura

**Generar PDF**:
- En el detalle de oferta, hacer clic en `Generar PDF`
- El sistema procesa el template y genera el documento
- Se descarga o se guarda en la nube

### 4.2 Módulo Clientes

**Lista de clientes**:
- Tabla con clientes registrados
- Filtros: nombre, RFC, condición de crédito, activo
- Ver historial de ofertas asociadas

**Nuevo cliente**:
1. `Clientes` → `Nuevo cliente`
2. Datos básicos: nombre, RFC, tipo persona (moral/física)
3. Datos de contacto: email, teléfono, dirección
3. Configuración: límite de crédito, condiciones de pago (30/60/90 días)
4. Asignar vendedor/comercial responsable
5. Guardar

**Detalle cliente**:
- Información completa del cliente
- Direcciones registradas
- Contactos principales
- Historial de ofertas y movimientos

### 4.3 Módulo Productos

**Catálogo de productos**:
- Búsqueda por SKU, nombre, categoría
- Ver precio base, moneda, peso, dimensiones
- Stock disponible (si está configurado)

**Nuevo producto**:
1. `Productos` → `Nuevo producto`
2. SKU único (obligatorio)
3. Nombre y descripción
4. Categoría (jerárquica: tipo → sub-tipo)
5. Unidad de medida (pza, kg, litro, m, etc.)
6. Precio base y moneda
7. Peso kg y volumen m³ (opcional)
8. Imagen URL (opcional)
9. Guardar

### 4.4 Módulo Finanzas

#### 4.4.1 Facturas

**Crear factura**:
1. Desde una oferta aprobada: `Convertir oferta a factura`
2. O bien, crear manualmente: `Facturas` → `Nueva factura`
3. Seleccionar cliente y oferta (si aplica)
4. Revisar y modificar conceptos si es necesario
5. Establecer fecha de emisión y vencimiento
6. Guardar con estado `pending`

**Estados de factura**:
- `pending` — Generada, por cobrar
- `pagada` — Pago completo recibido
- `parcial` — Pago parcial recibido
- `cancelada` — Cancelada (motivo requerido)
- `vencida` — PastDate de vencimiento

**Buscar/filter**:
- Por rango de fechas, estado, cliente, moneda
- Exportar a Excel/CSV

#### 4.4.2 Cobros

**Registrar pago recibido**:
1. `Cobros` → `Nuevo cobro`
2. Seleccionar una o varias facturas
3. Ingresar monto recibido (puede ser parcial)
4. Fecha de cobro y método de pago (transferencia, tarjeta, efectivo)
5. Referencia/ número de transacción
6. Guardar

**Efecto automático**:
- El sistema actualiza el estado de la(s) factura(s)
- Si el cobro cubre el total, el estado cambia a `pagada`
- Si es parcial, cambia a `parcial`

#### 4.4.3 Pagos

**Programar pago a proveedor**:
1. `Pagos` → `Nuevo pago`
2. Seleccionar proveedor y factura(s) a pagar
3. Ingresar monto y fecha de pago
4. Método de pago: transferencia, cheque, tarjeta
5. Referencia número
6. Guardar como `programado`

**Historial de pagos**:
- Filtros: proveedor, fecha, estado, periodo
- Ver comprobantes asociados
- Estado: programado, completado, fallido, cancelado

#### 4.4.4 Gastos

**Registrar gasto**:
1. `Gastos` → `Nuevo gasto`
2. Categoría: aduana, flete, almacenaje, inspección, otros
3. Monto y moneda
4. Fecha del gasto
5. Razón/referencia (concepto)
6. Marcar si es imputable a una oferta/cliente específico
7. Adjuntar comprobante (recibo, factura)
8. Guardar

**Reportes de gastos**:
- Por categoría y periodo
- Imputables vs. no imputables
- Exportable a CSV/Excel

### 4.5 Módulo Embarques

**Registrar embarque**:
1. `Embarques` → `Nuevo embarque`
2. Relacionar con contenedor/oferta
3. Datos: número de booking, naviera, ETA, ETD
4. Origen y destino (puerto/aeropuerto)
5. Tipo de contenedor (20', 40', HC, etc.)
6. Sello, peso, volumen
7. Guardar

**Seguimiento de estado**:
- `programado` — Reservado, esperando carga
- `en_tránsito` — En tránsito marítimo/ aéreo
- `en_aduana` — En proceso aduanero
- `liberado` — Liberado, disponible para entrega
- `entregado` — Entregado al cliente final
- `cancelado` — Cancelado

**Tracking / Mapa**:
- Vista con la ruta del embarque
- Actualizaciones de estado en tiempo real
- Documentos asociados (BL, packing list, invoice)

### 4.6 Módulo Documentos

**Subir documento**:
1. `Documentos` → `Subir`
2. Arrastar y soltar o seleccionar archivo
3. Tipo: contrato, factura, packing list, certificado, BL
4. Asociar a: oferta, cliente, embarque, proveedor, expediente
5. Agregar versión y metadata (tags)
6. Guardar

**Gestión de versiones**:
- Cada actualización crea nueva versión numerada
- Ver historial de cambios (quién, cuándo, qué cambió)
- Revertir a versión anterior si es necesario

**Firmas digitales**:
- Solicitar firma a clientes o proveedores
- Tracking: pending → signed → rejected
- Certificado digital guardado en historial

---

## 5. Búsqueda y Productividad

### 5.1 Command Palette (⌘K / Ctrl+K)

- Abrir: Presionar `⌘K` (Mac) o `Ctrl+K` (Windows/Linux)
- Buscar: Ofertas, clientes, productos por nombre o SKU
- Navegar: `Enter` para ir al resultado seleccionado
- Cerrar: `Escape` o hacer clic fuera

### 5.2 Atajos de Teclado (LUMAVI Web)

| Atajo | Acción |
|-------|--------|
| `⌘K` / `Ctrl+K` | Command Palette (búsqueda global) |
| `⌘N` / `Ctrl+N` | Nueva oferta (desde cualquier pantalla) |
| `⌘Shift+C` / `Ctrl+Shift+C` | Nuevo cliente |
| `⌘Shift+P` / `Ctrl+Shift+P` | Nuevo producto |
| `⌘Shift+F` / `Ctrl+Shift+F` | Buscar rápido |
| `⌘.` / `Ctrl+.` | Cerrar modal/ventana actual |
| `Esc` | Cerrar menús desplegables |

### 5.3 Favoritos

- En la sidebar, la sección "Favoritos" contiene accesos rápidos
- Por defecto: Dashboard y Ofertas
- Los usuarios pueden configurar cuáles módulos aparecen aquí (configuración de rol)

---

## 6. Perfil de Usuario

### 6.1 Información Personal

- Nombre completo y email (desde Supabase Auth)
- No se puede modificar el email desde la aplicación (usar Supabase Dashboard)
- Foto de perfil: se muestra initials en la header

### 6.2 Configuraciones Preferidas

- **Tema**: Claro / Oscuro / Del sistema (en menú de usuario → Apariencia)
- **Modo sidebar**: Contraer/expandir (remembered por sesión)
- **Modo pantalla**: No afecta la funcionalidad

### 6.3 Cerrar Sesión

- Menú de usuario → `Cerrar sesión`
- Acceso directo: `/login`
- Cierre en todos los dispositivos: Desde configuración de Supabase (no en la app)

---

## 7. Preguntas Frecuentes

### Q: ¿Cómo restablezco mi contraseña?
**A**: En la pantalla de login, hacer clic en "¿Olvidó su contraseña?" y seguir el enlace enviado a su correo electrónico. Si no recibe el email, contacte al administrador del sistema.

### Q: No veo ciertos módulos en el menú, ¿por qué?
**A**: La visibilidad de módulos en la sidebar depende de su rol de usuario. Si necesita acceso a un módulo adicional, solicite al administrador que le asigne el rol correspondiente (admin, commercial, supervisor, finance).

### Q: ¿Puedo cambiar de empresa o tenant dentro del sistema?
**A**: No. El sistema actual opera en una base de datos compartida donde todos los usuarios de un mismo rol comparten el mismo contexto. El aislamiento por empresa (empresa_id) está planeado para una futura fase (Fase 2). Actualmente, los filtros son a nivel de rol (quién puede crear/ver/editar).

### Q: ¿Cómo exporto datos?
**A**: En la mayoría de las listados de tablas, hay un botón `Exportar` en CSV o Excel. También hay reportes programables en `Reportes` → `Crear reporte`.

### Q: ¿Qué hago si veo datos incorrectos o inconsistentes?
**A**: Verifique primero haciendo refresh de la pantalla. Si el problema persiste, use el botón `?` en la esquina inferior derecha para reportar la incidencia al equipo de soporte, o contacte a `soporte@lumavi.app`.

### Q: ¿El sistema funciona sin conexión a internet?
**A**: La versión web requiere conexión activa. La aplicación móvil (Flutter) tiene modo offline-first con sincronización automática al reconectarse.

---

## 8. Glosario de Términos

| Termino | Definición |
|---------|------------|
| **Oferta** | Propuesta comercial preliminar para un cliente, con productos y precios |
| **Ficha de oferta** | Línea individual dentro de una oferta (producto + cantidad + precio) |
| **Factura** | Documento fiscal que registra una venta o cobro |
| **Booking** | Reserva de espacio en el contenedor con la naviera |
| **ETA / ETD** | Estimated Time of Arrival/Departure |
| **RLS** | Row Level Security (seguridad a nivel de fila en base de datos) |
| **Soft delete** | Eliminación lógica (marca registro como borrado sin borrar físicamente) |
| **JWT** | JSON Web Token (token de autorización en sesión) |
| **Command Palette** | Búsqueda global accesible con ⌘K / Ctrl+K |
| **Soft delete** | Eliminación lógica (registro marcado pero no físicamente borrado) |
| **Favoritos** | Módulos de acceso rápido en la sidebar |

---

## 9. Soporte y Ayuda

### 9.1 Recursos Disponibles

- **FAQ**: Acceder desde el menú de ayuda o el botón `?` en la esquina inferior derecha
- **Tutoriales**: Breve introducción al primer login y módulos clave
- **Ataluches de teclado**: `⌘K` → Ver atajos rápidos
- **Estado del sistema**: `?` → Estado del servidor

### 9.2 Contactar Soporte

- Email: `soporte@lumavi.app`
- Horario: Lunes a Viernes 08:00 - 18:00 (hora local)
- Tiempo de respuesta: Menos de 4 horas para casos críticos

### 9.3 Reportar Incidencia

En cualquier pantalla, hacer clic en `?` en la esquina inferior derecha para:
- Reportar error con captura de pantalla automática
- Enviar información del navegador y rol de usuario (anonimizado)
- Marcar como prioridad (baja, media, alta, crítica)

---

## 10. Cierre y Despedida

Gracias por usar LUMAVI ERP. Este sistema está diseñado para facilitar la gestión de su negocio de importación y comercialización internacional.

**Recuerda:**
- Siempre verificar el rol que tiene asignado (puede consultar al admin si duda de algunos módulos)
- Usar `⌘K` / `Ctrl+K` para búsqueda rápida de entidades
- Cerrar sesión al terminar, especialmente en computadoras compartidas
- Los reportes y exportaciones son herramientas clave para toma de decisiones

**¿Necesita ayuda adicional?**
Visite `https://help.lumavi.app` o contacte a `soporte@lumavi.app`

---