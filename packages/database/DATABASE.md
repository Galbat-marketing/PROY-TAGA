# MODELO DE BASE DE DATOS — TAGA ERP

> Fase 2 — Diseño del esquema relacional
> Versión 1.0

---

## 1. CONVENCIONES GENERALES

```sql
-- Naming
-- Tablas: plural_snake_case
-- Columnas: snake_case
-- PKs: id (UUID v7)
-- FKs: {entidad}_id
-- Índices: idx_{tabla}_{columna}
-- Triggers: trg_{tabla}_{evento}
-- Funciones: fn_{nombre}
-- Vistas: v_{nombre}

-- Columnas obligatorias en TODAS las tablas:
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
deleted_at  TIMESTAMPTZ DEFAULT NULL  -- soft delete

-- Soft delete: nunca se eliminan registros financieros
-- Las queries base filtran: WHERE deleted_at IS NULL
-- Las vistas con WITH CHECK OPTION excluyen borrados
```

---

## 2. DIAGRAMA ENTIDAD-RELACIÓN (TEXTO)

```
USUARIOS ────< ROLES_USUARIOS >──── ROLES ────< ROLES_PERMISOS >──── PERMISOS
    │
    ├──< OFERTAS (comercial_id)
    ├──< CLIENTES (vendedor_id)
    ├──< COBROS (cobrador_id)
    ├──< PAGOS (pagador_id)
    └──< AUDITORIA_LOG (usuario_id)

CATEGORIAS_PRODUCTOS ────< PRODUCTOS
    │
    ├──< FICHAS_OFERTA
    ├──< PRECIOS_PRODUCTO
    └──< STOCK_PRODUCTO

CLIENTES ────< OFERTAS
    │       └──< FICHAS_OFERTA >──── PRODUCTOS
    │
    ├──< FACTURAS
    ├──< COBROS
    └──< DIRECCIONES_CLIENTE

PROVEEDORES ────< PAGOS
    │
    └──< GASTOS

IMPORTADORAS ────< EXPEDIENTES
    │
    └──< CONTENEDORES ────< EMBARQUES
                              │
                              └──< OFERTA_EMBARQUE >──── OFERTAS

OFERTAS ────< FACTURAS
    │
    ├──< FICHAS_OFERTA
    └──< OFERTA_EMBARQUE

FACTURAS ────< COBROS

DOCUMENTOS ────< VERSIONES_DOCUMENTO
    │
    └──< HISTORIAL_DOCUMENTO

AUDITORIA_LOG
ACTIVIDAD_USUARIOS
NOTIFICACIONES
```

---

## 3. TABLAS — DEFINICIÓN DETALLADA

### 3.1 SEGURIDAD Y ACCESO

#### usuarios

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, default gen_random_uuid() | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| nombre | VARCHAR(150) | NOT NULL | |
| apellido | VARCHAR(150) | NOT NULL | |
| telefono | VARCHAR(20) | | |
| avatar_url | TEXT | | Supabase Storage path |
| activo | BOOLEAN | DEFAULT true | |
| ultimo_acceso | TIMESTAMPTZ | | |
| preferencias | JSONB | DEFAULT '{}' | Tema, notificaciones, favoritos |

#### roles

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| nombre | VARCHAR(50) | UNIQUE, NOT NULL | admin, commercial, supervisor, finance, viewer |
| descripcion | TEXT | | |
| jerarquia | INTEGER | NOT NULL, DEFAULT 0 | Para herencia de permisos |

#### roles_usuarios

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| usuario_id | UUID | FK → usuarios(id) ON DELETE CASCADE |
| rol_id | UUID | FK → roles(id) ON DELETE CASCADE |
| UNIQUE(usuario_id, rol_id) | | |

#### permisos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| codigo | VARCHAR(100) | UNIQUE, NOT NULL | ej: ofertas:read, ofertas:write |
| nombre | VARCHAR(150) | NOT NULL | |
| modulo | VARCHAR(50) | NOT NULL | Agrupación: ofertas, clientes, facturas... |
| accion | VARCHAR(50) | NOT NULL | read, write, delete, approve |

#### roles_permisos

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| rol_id | UUID | FK → roles(id) ON DELETE CASCADE |
| permiso_id | UUID | FK → permisos(id) ON DELETE CASCADE |
| UNIQUE(rol_id, permiso_id) | | |

---

### 3.2 CATÁLOGOS BASE

#### categorias_productos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| nombre | VARCHAR(150) | NOT NULL | |
| descripcion | TEXT | | |
| padre_id | UUID | FK → categorias_productos(id), NULL | Jerarquía de categorías |
| activo | BOOLEAN | DEFAULT true | |
| orden | INTEGER | DEFAULT 0 | Para ordenamiento |

#### productos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| codigo | VARCHAR(50) | UNIQUE, NOT NULL | SKU interno |
| nombre | VARCHAR(255) | NOT NULL | |
| descripcion | TEXT | | |
| categoria_id | UUID | FK → categorias_productos(id) | |
| unidad_medida | VARCHAR(20) | NOT NULL | kg, lb, caja, pieza, m3 |
| precio_base | DECIMAL(15,2) | NOT NULL, DEFAULT 0 | |
| moneda | VARCHAR(3) | DEFAULT 'USD' | USD, MXN, EUR |
| fraccion_arancelaria | VARCHAR(20) | | Para importaciones |
| pais_origen | VARCHAR(100) | | |
| peso_kg | DECIMAL(10,3) | | |
| volumen_m3 | DECIMAL(10,3) | | |
| activo | BOOLEAN | DEFAULT true | |
| imagen_url | TEXT | | |
| notas | TEXT | | |

#### precios_producto

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| producto_id | UUID | FK → productos(id) ON DELETE CASCADE | |
| tipo_precio | VARCHAR(30) | NOT NULL | lista, especial, mayorista, distribuidor |
| precio | DECIMAL(15,2) | NOT NULL | |
| moneda | VARCHAR(3) | DEFAULT 'USD' | |
| vigencia_desde | DATE | NOT NULL | |
| vigencia_hasta | DATE | | NULL = vigente indefinido |

#### stock_producto

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| producto_id | UUID | FK → productos(id) ON DELETE CASCADE | |
| ubicacion | VARCHAR(100) | | Almacén / bodega |
| cantidad | DECIMAL(15,3) | NOT NULL, DEFAULT 0 | |
| lote | VARCHAR(50) | | |
| fecha_ingreso | DATE | DEFAULT CURRENT_DATE | |
| fecha_vencimiento | DATE | | |

---

### 3.3 CLIENTES Y PROVEEDORES

#### clientes

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| codigo | VARCHAR(30) | UNIQUE, NOT NULL | |
| tipo_persona | VARCHAR(10) | NOT NULL | moral / fisica |
| nombre | VARCHAR(255) | NOT NULL | Razón social |
| rfc | VARCHAR(20) | | |
| email | VARCHAR(255) | | |
| telefono | VARCHAR(50) | | |
| pais | VARCHAR(100) | NOT NULL | |
| moneda_default | VARCHAR(3) | DEFAULT 'USD' | |
| limite_credito | DECIMAL(15,2) | DEFAULT 0 | |
| condiciones_pago | VARCHAR(50) | | 30, 60, 90 días, contado |
| vendedor_id | UUID | FK → usuarios(id) | Comercial asignado |
| industria | VARCHAR(100) | | |
| rating | INTEGER | DEFAULT 0 | 1-5 |
| notas | TEXT | | |
| activo | BOOLEAN | DEFAULT true | |

#### direcciones_cliente

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| cliente_id | UUID | FK → clientes(id) ON DELETE CASCADE |
| tipo | VARCHAR(20) | fiscal, envio, cobranza |
| calle | VARCHAR(255) | NOT NULL |
| numero_exterior | VARCHAR(20) | |
| numero_interior | VARCHAR(20) | |
| colonia | VARCHAR(150) | |
| ciudad | VARCHAR(150) | NOT NULL |
| estado | VARCHAR(150) | NOT NULL |
| pais | VARCHAR(100) | NOT NULL |
| codigo_postal | VARCHAR(20) | |
| es_default | BOOLEAN | DEFAULT false |

#### contactos_cliente

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| cliente_id | UUID | FK → clientes(id) ON DELETE CASCADE |
| nombre | VARCHAR(150) | NOT NULL |
| cargo | VARCHAR(100) | |
| email | VARCHAR(255) | |
| telefono | VARCHAR(50) | |
| es_principal | BOOLEAN | DEFAULT false |

#### proveedores

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| codigo | VARCHAR(30) | UNIQUE, NOT NULL | |
| nombre | VARCHAR(255) | NOT NULL | Razón social |
| rfc | VARCHAR(20) | | |
| email | VARCHAR(255) | | |
| telefono | VARCHAR(50) | | |
| pais | VARCHAR(100) | NOT NULL | |
| moneda_default | VARCHAR(3) | DEFAULT 'USD' | |
| condiciones_pago | VARCHAR(50) | | |
| tipo_proveedor | VARCHAR(50) | | fabricante, distribuidor, agente |
| rating | INTEGER | DEFAULT 0 | |
| activo | BOOLEAN | DEFAULT true | |

---

### 3.4 IMPORTADORAS Y OPERACIONES

#### importadoras

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| codigo | VARCHAR(30) | UNIQUE, NOT NULL | |
| nombre | VARCHAR(255) | NOT NULL | |
| rfc | VARCHAR(20) | | |
| direccion | TEXT | | |
| aduana_asignada | VARCHAR(150) | | |
| agente_aduanal | VARCHAR(255) | | |
| email | VARCHAR(255) | | |
| telefono | VARCHAR(50) | | |
| activo | BOOLEAN | DEFAULT true | |

#### comerciales

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| usuario_id | UUID | FK → usuarios(id), UNIQUE | |
| codigo | VARCHAR(30) | UNIQUE, NOT NULL | |
| zona | VARCHAR(100) | | |
| tipo_comision | VARCHAR(20) | porcentaje, fija |
| comision_valor | DECIMAL(10,2) | DEFAULT 0 | |
| meta_mensual | DECIMAL(15,2) | DEFAULT 0 | |
| meta_anual | DECIMAL(15,2) | DEFAULT 0 | |
| supervisor_id | UUID | FK → usuarios(id), NULL | |
| activo | BOOLEAN | DEFAULT true | |

---

### 3.5 OFERTAS

#### ofertas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| folio | VARCHAR(30) | UNIQUE, NOT NULL | Formato: OF-{YYYY}-{NNNNN} |
| cliente_id | UUID | FK → clientes(id) | |
| comercial_id | UUID | FK → usuarios(id) | |
| fecha_emision | DATE | NOT NULL, DEFAULT CURRENT_DATE | |
| fecha_vigencia | DATE | | |
| estado | VARCHAR(30) | NOT NULL, DEFAULT 'borrador' | borrador, enviada, aceptada, rechazada, convertida |
| tipo_operacion | VARCHAR(30) | | venta_nacional, importacion, exportacion |
| condiciones_pago | VARCHAR(50) | | |
| incoterm | VARCHAR(10) | | FOB, CIF, EXW, DDP... |
| moneda | VARCHAR(3) | DEFAULT 'USD' | |
| tipo_cambio | DECIMAL(10,4) | | |
| subtotal | DECIMAL(15,2) | DEFAULT 0 | |
| descuento_global | DECIMAL(15,2) | DEFAULT 0 | |
| iva | DECIMAL(15,2) | DEFAULT 0 | |
| total | DECIMAL(15,2) | DEFAULT 0 | |
| notas | TEXT | | |
| notas_internas | TEXT | | |

#### fichas_oferta

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| oferta_id | UUID | FK → ofertas(id) ON DELETE CASCADE | |
| producto_id | UUID | FK → productos(id) | |
| cantidad | DECIMAL(15,3) | NOT NULL | |
| unidad_medida | VARCHAR(20) | NOT NULL | |
| precio_unitario | DECIMAL(15,2) | NOT NULL | |
| descuento | DECIMAL(5,2) | DEFAULT 0 | Porcentaje |
| subtotal | DECIMAL(15,2) | DEFAULT 0 | |
| notas | TEXT | | |

---

### 3.6 CONTENEDORES Y EMBARQUES

#### contenedores

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| numero_contenedor | VARCHAR(50) | UNIQUE, NOT NULL | |
| tipo | VARCHAR(30) | NOT NULL | 20', 40', 40'HC, 45' |
| tamano | VARCHAR(10) | | |
| booking | VARCHAR(50) | | Número de booking |
| naviera | VARCHAR(150) | | |
| importadora_id | UUID | FK → importadoras(id) | |
| eta | DATE | | Estimated Time Arrival |
| etd | DATE | | Estimated Time Departure |
| puerto_origen | VARCHAR(150) | | |
| puerto_destino | VARCHAR(150) | | |
| sello | VARCHAR(50) | | Número de sello |
| peso_kg | DECIMAL(10,2) | | |
| volumen_m3 | DECIMAL(10,2) | | |
| estado | VARCHAR(30) | DEFAULT 'programado' | programado, en_transito, en_aduana, liberado, entregado |
| notas | TEXT | | |

#### embarques

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| contenedor_id | UUID | FK → contenedores(id) | |
| estado | VARCHAR(30) | NOT NULL | |
| ubicacion_actual | VARCHAR(255) | | |
| fecha_evento | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| descripcion | TEXT | | |
| usuario_registra | UUID | FK → usuarios(id) | |

#### oferta_embarque

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| oferta_id | UUID | FK → ofertas(id) ON DELETE CASCADE |
| embarque_id | UUID | FK → embarques(id) ON DELETE CASCADE |
| PRIMARY KEY (oferta_id, embarque_id) | | |

---

### 3.7 FACTURACIÓN Y COBROS

#### facturas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| folio | VARCHAR(30) | UNIQUE, NOT NULL | CFDI / factura |
| oferta_id | UUID | FK → ofertas(id) | |
| cliente_id | UUID | FK → clientes(id) | |
| tipo | VARCHAR(20) | NOT NULL | ingreso, egreso, traslado |
| subtotal | DECIMAL(15,2) | NOT NULL | |
| iva | DECIMAL(15,2) | DEFAULT 0 | |
| total | DECIMAL(15,2) | NOT NULL | |
| moneda | VARCHAR(3) | DEFAULT 'USD' | |
| tipo_cambio | DECIMAL(10,4) | | |
| fecha_emision | DATE | NOT NULL | |
| fecha_vencimiento | DATE | | |
| estado | VARCHAR(30) | DEFAULT 'pendiente' | pendiente, pagada, parcial, cancelada, vencida |
| uuid_cfdi | VARCHAR(100) | | Timbre fiscal |
| xml_path | TEXT | | Supabase Storage |
| pdf_path | TEXT | | |

#### cobros

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| factura_id | UUID | FK → facturas(id) | |
| monto | DECIMAL(15,2) | NOT NULL | |
| moneda | VARCHAR(3) | DEFAULT 'USD' | |
| tipo_cambio | DECIMAL(10,4) | | |
| fecha_cobro | DATE | NOT NULL | |
| metodo_pago | VARCHAR(50) | | transferencia, efectivo, cheque, tarjeta |
| referencia | VARCHAR(100) | | Número de referencia / cheque |
| cobrador_id | UUID | FK → usuarios(id) | |
| notas | TEXT | | |

---

### 3.8 PAGOS Y GASTOS

#### pagos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| proveedor_id | UUID | FK → proveedores(id) | |
| oferta_id | UUID | FK → ofertas(id), NULL | Opcional |
| monto | DECIMAL(15,2) | NOT NULL | |
| moneda | VARCHAR(3) | DEFAULT 'USD' | |
| tipo_cambio | DECIMAL(10,4) | | |
| fecha_pago | DATE | NOT NULL | |
| metodo_pago | VARCHAR(50) | | |
| referencia | VARCHAR(100) | | |
| pagador_id | UUID | FK → usuarios(id) | |
| notas | TEXT | | |

#### gastos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| categoria | VARCHAR(50) | NOT NULL | aduana, flete, almacenaje, inspeccion, otros |
| proveedor_id | UUID | FK → proveedores(id), NULL | |
| contenedor_id | UUID | FK → contenedores(id), NULL | |
| oferta_id | UUID | FK → ofertas(id), NULL | |
| descripcion | TEXT | NOT NULL | |
| monto | DECIMAL(15,2) | NOT NULL | |
| moneda | VARCHAR(3) | DEFAULT 'USD' | |
| tipo_cambio | DECIMAL(10,4) | | |
| fecha_gasto | DATE | NOT NULL | |
| comprobante_path | TEXT | | Supabase Storage |
| registrado_por | UUID | FK → usuarios(id) | |

---

### 3.9 EXPEDIENTES

#### expedientes

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| folio | VARCHAR(30) | UNIQUE, NOT NULL | EXP-{YYYY}-{NNNNN} |
| tipo | VARCHAR(50) | NOT NULL | importacion, exportacion, nacional |
| oferta_id | UUID | FK → ofertas(id) | |
| contenedor_id | UUID | FK → contenedores(id) | |
| importadora_id | UUID | FK → importadoras(id) | |
| estado | VARCHAR(30) | DEFAULT 'abierto' | abierto, en_proceso, cerrado, cancelado |
| fecha_apertura | DATE | NOT NULL | |
| fecha_cierre | DATE | | |
| responsable_id | UUID | FK → usuarios(id) | |
| notas | TEXT | | |

---

### 3.10 DOCUMENTOS

#### documentos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| tipo_documento | VARCHAR(50) | NOT NULL | contrato, certificado, proforma, factura, bl, booking, expediente, inspeccion, adjunto |
| nombre | VARCHAR(255) | NOT NULL | |
| descripcion | TEXT | | |
| oferta_id | UUID | FK → ofertas(id), NULL | |
| cliente_id | UUID | FK → clientes(id), NULL | |
| proveedor_id | UUID | FK → proveedores(id), NULL | |
| contenedor_id | UUID | FK → contenedores(id), NULL | |
| expediente_id | UUID | FK → expedientes(id), NULL | |
| version_actual | INTEGER | DEFAULT 1 | |
| firmado | BOOLEAN | DEFAULT false | |
| storage_path | TEXT | NOT NULL | Supabase Storage |
| file_size | BIGINT | | Bytes |
| file_type | VARCHAR(100) | | MIME type |
| tags | TEXT[] | | |

#### versiones_documento

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| documento_id | UUID | FK → documentos(id) ON DELETE CASCADE |
| version | INTEGER | NOT NULL |
| storage_path | TEXT | NOT NULL |
| file_size | BIGINT | |
| subido_por | UUID | FK → usuarios(id) |
| notas_cambio | TEXT | |

#### historial_documento

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| documento_id | UUID | FK → documentos(id) ON DELETE CASCADE |
| accion | VARCHAR(50) | NOT NULL | creado, subido_version, firmado, descargado, eliminado |
| usuario_id | UUID | FK → usuarios(id) |
| metadata | JSONB | |
| timestamp | TIMESTAMPTZ | DEFAULT now() |

---

### 3.11 AUDITORÍA Y ACTIVIDAD

#### auditoria_log

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| tabla | VARCHAR(100) | NOT NULL | |
| operacion | VARCHAR(10) | NOT NULL | INSERT, UPDATE, DELETE |
| registro_id | UUID | | ID del registro afectado |
| usuario_id | UUID | FK → usuarios(id) | |
| datos_previos | JSONB | | |
| datos_nuevos | JSONB | | |
| ip_address | INET | | |
| user_agent | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

#### actividad_usuarios

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| usuario_id | UUID | FK → usuarios(id) |
| accion | VARCHAR(100) | NOT NULL |
| modulo | VARCHAR(50) | NOT NULL |
| metadata | JSONB | |
| ip_address | INET | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

---

### 3.12 NOTIFICACIONES

#### notificaciones

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | |
| usuario_id | UUID | FK → usuarios(id) | Destinatario |
| tipo | VARCHAR(50) | NOT NULL | alerta, informacion, aprobacion, vencimiento |
| titulo | VARCHAR(255) | NOT NULL | |
| mensaje | TEXT | | |
| referencia_modulo | VARCHAR(50) | | |
| referencia_id | UUID | | |
| leida | BOOLEAN | DEFAULT false | |
| fecha_lectura | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

---

## 4. ÍNDICES RECOMENDADOS

```sql
-- Performance indexes
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_fraccion ON productos(fraccion_arancelaria);
CREATE INDEX idx_ofertas_cliente ON ofertas(cliente_id);
CREATE INDEX idx_ofertas_comercial ON ofertas(comercial_id);
CREATE INDEX idx_ofertas_estado ON ofertas(estado);
CREATE INDEX idx_ofertas_fecha ON ofertas(fecha_emision);
CREATE INDEX idx_fichas_oferta_oferta ON fichas_oferta(oferta_id);
CREATE INDEX idx_fichas_oferta_producto ON fichas_oferta(producto_id);
CREATE INDEX idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX idx_facturas_oferta ON facturas(oferta_id);
CREATE INDEX idx_facturas_estado ON facturas(estado);
CREATE INDEX idx_cobros_factura ON cobros(factura_id);
CREATE INDEX idx_cobros_fecha ON cobros(fecha_cobro);
CREATE INDEX idx_pagos_proveedor ON pagos(proveedor_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);
CREATE INDEX idx_gastos_contenedor ON gastos(contenedor_id);
CREATE INDEX idx_contenedores_estado ON contenedores(estado);
CREATE INDEX idx_contenedores_eta ON contenedores(eta);
CREATE INDEX idx_embarques_contenedor ON embarques(contenedor_id);
CREATE INDEX idx_expedientes_estado ON expedientes(estado);
CREATE INDEX idx_documentos_tipo ON documentos(tipo_documento);
CREATE INDEX idx_documentos_oferta ON documentos(oferta_id);
CREATE INDEX idx_auditoria_tabla ON auditoria_log(tabla);
CREATE INDEX idx_auditoria_fecha ON auditoria_log(created_at);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);

-- Full-text search
CREATE INDEX idx_productos_busqueda ON productos USING GIN(to_tsvector('spanish', nombre || ' ' || COALESCE(descripcion, '')));
CREATE INDEX idx_clientes_busqueda ON clientes USING GIN(to_tsvector('spanish', nombre));
```

---

## 5. POLÍTICAS RLS

### 5.1 Esquema de Roles

| Rol | Acceso |
|-----|--------|
| admin | Acceso total a todas las tablas |
| commercial | CRUD en ofertas, fichas_oferta, clientes (propios); lectura en productos, catálogos |
| supervisor | Mismo que commercial + acceso a ofertas de su equipo |
| finance | CRUD en facturas, cobros, pagos, gastos; lectura en ofertas, clientes |
| viewer | Solo lectura en todos los módulos |

### 5.2 Políticas Clave (ejemplos)

```sql
-- ofertas: SELECT
CREATE POLICY "admin_full_access" ON ofertas FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "commercial_own_ofertas" ON ofertas FOR SELECT TO authenticated
  USING (comercial_id = auth.uid());

CREATE POLICY "commercial_insert_ofertas" ON ofertas FOR INSERT TO authenticated
  WITH CHECK (comercial_id = auth.uid());

CREATE POLICY "finance_read_ofertas" ON ofertas FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' IN ('finance', 'supervisor', 'viewer'));

-- clientes: SELECT (acceso amplio, insert/update restringido)
CREATE POLICY "everyone_read_clientes" ON clientes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "only_admin_commercial_write_clientes" ON clientes FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'commercial'));

-- facturas: solo admin y finance
CREATE POLICY "finance_full_facturas" ON facturas FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'finance'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'finance'));

CREATE POLICY "others_read_facturas" ON facturas FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' IN ('supervisor', 'commercial', 'viewer'));
```

---

## 6. TRIGGERS DE AUDITORÍA

### 6.1 Trigger genérico de auditoría

```sql
CREATE OR REPLACE FUNCTION fn_auditar_cambio()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO auditoria_log (tabla, operacion, registro_id, usuario_id, datos_nuevos, ip_address)
    VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, auth.uid(), row_to_json(NEW)::jsonb, inet_client_addr());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO auditoria_log (tabla, operacion, registro_id, usuario_id, datos_previos, datos_nuevos, ip_address)
    VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, auth.uid(), row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, inet_client_addr());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO auditoria_log (tabla, operacion, registro_id, usuario_id, datos_previos, ip_address)
    VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, auth.uid(), row_to_json(OLD)::jsonb, inet_client_addr());
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a tablas críticas:
-- ofertas, fichas_oferta, facturas, cobros, pagos, gastos, clientes, proveedores, contenedores
CREATE TRIGGER trg_ofertas_auditar AFTER INSERT OR UPDATE OR DELETE ON ofertas
  FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio();
```

### 6.2 Trigger de updated_at

```sql
CREATE OR REPLACE FUNCTION fn_actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a TODAS las tablas
```

### 6.3 Trigger de folio automático (ofertas)

```sql
CREATE OR REPLACE FUNCTION fn_generar_folio_oferta()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  next_num INTEGER;
BEGIN
  year_prefix := to_char(NEW.fecha_emision, 'YYYY');
  SELECT COALESCE(MAX(SUBSTRING(folio FROM 'OF-\d{4}-(\d{5})')::INTEGER), 0) + 1
    INTO next_num
    FROM ofertas
    WHERE folio LIKE 'OF-' || year_prefix || '-%';
  NEW.folio := 'OF-' || year_prefix || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ofertas_folio BEFORE INSERT ON ofertas
  FOR EACH ROW EXECUTE FUNCTION fn_generar_folio_oferta();
```

---

## 7. VISTAS PARA DASHBOARD

```sql
-- Vista: dashboard_ventas (últimos 12 meses)
CREATE VIEW v_dashboard_ventas AS
SELECT
  date_trunc('month', o.fecha_emision) AS mes,
  COUNT(*) AS total_ofertas,
  SUM(o.total) AS ingreso_total,
  AVG(o.total) AS ticket_promedio,
  COUNT(DISTINCT o.cliente_id) AS clientes_activos
FROM ofertas o
WHERE o.estado IN ('aceptada', 'convertida')
  AND o.deleted_at IS NULL
  AND o.fecha_emision >= date_trunc('month', now()) - INTERVAL '12 months'
GROUP BY date_trunc('month', o.fecha_emision)
ORDER BY mes DESC;

-- Vista: dashboard_cobros_pendientes
CREATE VIEW v_cobros_pendientes AS
SELECT
  f.id AS factura_id,
  f.folio,
  c.nombre AS cliente,
  f.total,
  f.total - COALESCE(SUM(cb.monto), 0) AS saldo_pendiente,
  f.fecha_vencimiento,
  CASE
    WHEN f.fecha_vencimiento < CURRENT_DATE THEN 'vencida'
    WHEN f.fecha_vencimiento <= CURRENT_DATE + 7 THEN 'por_vencer'
    ELSE 'al_corriente'
  END AS estado_cobro
FROM facturas f
JOIN clientes c ON c.id = f.cliente_id
LEFT JOIN cobros cb ON cb.factura_id = f.id
WHERE f.estado IN ('pendiente', 'parcial')
  AND f.deleted_at IS NULL
GROUP BY f.id, f.folio, c.nombre, f.total, f.fecha_vencimiento;

-- Vista: dashboard_operaciones_activas
CREATE VIEW v_operaciones_activas AS
SELECT
  c.id AS contenedor_id,
  c.numero_contenedor,
  c.naviera,
  c.estado,
  c.eta,
  c.etd,
  c.puerto_origen,
  c.puerto_destino,
  COUNT(DISTINCT e.id) AS total_eventos,
  MAX(e.fecha_evento) AS ultimo_evento
FROM contenedores c
LEFT JOIN embarques e ON e.contenedor_id = c.id
WHERE c.estado NOT IN ('entregado', 'cancelado')
  AND c.deleted_at IS NULL
GROUP BY c.id, c.numero_contenedor, c.naviera, c.estado, c.eta, c.etd, c.puerto_origen, c.puerto_destino;
```

---

## 8. FUNCIONES DE NEGOCIO

```sql
-- Calcular total de oferta
CREATE OR REPLACE FUNCTION fn_calcular_total_oferta(p_oferta_id UUID)
RETURNS TABLE(subtotal DECIMAL, descuento DECIMAL, iva DECIMAL, total DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(fo.subtotal), 0) AS subtotal,
    COALESCE(SUM(fo.subtotal * fo.descuento / 100), 0) AS descuento,
    COALESCE(SUM((fo.subtotal - (fo.subtotal * fo.descuento / 100)) * 0.16), 0) AS iva,
    COALESCE(SUM((fo.subtotal - (fo.subtotal * fo.descuento / 100)) * 1.16), 0) AS total
  FROM fichas_oferta fo
  WHERE fo.oferta_id = p_oferta_id AND fo.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obtener ofertas del comercial con su equipo (supervisor)
CREATE OR REPLACE FUNCTION fn_ofertas_equipo(p_supervisor_id UUID)
RETURNS SETOF ofertas AS $$
BEGIN
  RETURN QUERY
  SELECT o.* FROM ofertas o
  WHERE o.comercial_id IN (
    SELECT u.id FROM usuarios u
    JOIN comerciales c ON c.usuario_id = u.id
    WHERE c.supervisor_id = p_supervisor_id
       OR u.id = p_supervisor_id
  )
  AND o.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 9. RESUMEN DE TABLAS

| Módulo | Tablas | Total |
|--------|--------|-------|
| Seguridad | usuarios, roles, roles_usuarios, permisos, roles_permisos | 5 |
| Productos | categorias_productos, productos, precios_producto, stock_producto | 4 |
| Clientes | clientes, direcciones_cliente, contactos_cliente | 3 |
| Proveedores | proveedores | 1 |
| Importadoras | importadoras | 1 |
| Comerciales | comerciales | 1 |
| Ofertas | ofertas, fichas_oferta | 2 |
| Contenedores | contenedores, embarques, oferta_embarque | 3 |
| Facturación | facturas, cobros | 2 |
| Pagos | pagos | 1 |
| Gastos | gastos | 1 |
| Expedientes | expedientes | 1 |
| Documentos | documentos, versiones_documento, historial_documento | 3 |
| Auditoría | auditoria_log, actividad_usuarios | 2 |
| Notificaciones | notificaciones | 1 |
| **TOTAL** | | **31 tablas** |

---

## ¿APROBACIÓN?

Este diseño cubre el modelo completo de datos del ERP TAGA.

**Próximo paso tras aprobación:** Generar todas las migraciones SQL, policies, triggers, funciones, vistas y seeds listos para ejecutar en Supabase.

**¿Apruebas el modelo o requieres cambios?**
