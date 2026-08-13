-- ============================================
-- TAGA ERP — Migration 001: Core Schema
-- ============================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- 1. Enums
CREATE TYPE tipo_persona AS ENUM ('moral', 'fisica');
CREATE TYPE estado_oferta AS ENUM ('borrador', 'enviada', 'aceptada', 'rechazada', 'convertida');
CREATE TYPE tipo_operacion AS ENUM ('venta_nacional', 'importacion', 'exportacion');
CREATE TYPE tipo_precio AS ENUM ('lista', 'especial', 'mayorista', 'distribuidor');
CREATE TYPE estado_contenedor AS ENUM ('programado', 'en_transito', 'en_aduana', 'liberado', 'entregado');
CREATE TYPE estado_factura AS ENUM ('pendiente', 'pagada', 'parcial', 'cancelada', 'vencida');
CREATE TYPE tipo_documento AS ENUM ('contrato', 'certificado', 'proforma', 'factura', 'bl', 'booking', 'expediente', 'inspeccion', 'adjunto');
CREATE TYPE tipo_notificacion AS ENUM ('alerta', 'informacion', 'aprobacion', 'vencimiento');
CREATE TYPE estado_expediente AS ENUM ('abierto', 'en_proceso', 'cerrado', 'cancelado');
CREATE TYPE tipo_direccion AS ENUM ('fiscal', 'envio', 'cobranza');
CREATE TYPE categoria_gasto AS ENUM ('aduana', 'flete', 'almacenaje', 'inspeccion', 'otros');

-- ============================================
-- 2. SEGURIDAD Y ACCESO
-- ============================================

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    avatar_url TEXT,
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMPTZ,
    preferencias JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    jerarquia INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE roles_usuarios (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, rol_id)
);

CREATE TABLE permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles_permisos (
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id UUID NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    UNIQUE(rol_id, permiso_id)
);

-- ============================================
-- 3. CATÁLOGOS BASE
-- ============================================

CREATE TABLE categorias_productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    padre_id UUID REFERENCES categorias_productos(id),
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria_id UUID REFERENCES categorias_productos(id),
    unidad_medida VARCHAR(20) NOT NULL,
    precio_base DECIMAL(15,2) NOT NULL DEFAULT 0,
    moneda VARCHAR(3) DEFAULT 'USD',
    fraccion_arancelaria VARCHAR(20),
    pais_origen VARCHAR(100),
    peso_kg DECIMAL(10,3),
    volumen_m3 DECIMAL(10,3),
    activo BOOLEAN DEFAULT true,
    imagen_url TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE precios_producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    tipo_precio tipo_precio NOT NULL,
    precio DECIMAL(15,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    vigencia_desde DATE NOT NULL,
    vigencia_hasta DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE stock_producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    ubicacion VARCHAR(100),
    cantidad DECIMAL(15,3) NOT NULL DEFAULT 0,
    lote VARCHAR(50),
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- 4. CLIENTES Y PROVEEDORES
-- ============================================

CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) UNIQUE NOT NULL,
    tipo_persona tipo_persona NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rfc VARCHAR(20),
    email VARCHAR(255),
    telefono VARCHAR(50),
    pais VARCHAR(100) NOT NULL,
    moneda_default VARCHAR(3) DEFAULT 'USD',
    limite_credito DECIMAL(15,2) DEFAULT 0,
    condiciones_pago VARCHAR(50),
    vendedor_id UUID REFERENCES usuarios(id),
    industria VARCHAR(100),
    rating INTEGER DEFAULT 0,
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE direcciones_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo tipo_direccion NOT NULL,
    calle VARCHAR(255) NOT NULL,
    numero_exterior VARCHAR(20),
    numero_interior VARCHAR(20),
    colonia VARCHAR(150),
    ciudad VARCHAR(150) NOT NULL,
    estado VARCHAR(150) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20),
    es_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE contactos_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    cargo VARCHAR(100),
    email VARCHAR(255),
    telefono VARCHAR(50),
    es_principal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rfc VARCHAR(20),
    email VARCHAR(255),
    telefono VARCHAR(50),
    pais VARCHAR(100) NOT NULL,
    moneda_default VARCHAR(3) DEFAULT 'USD',
    condiciones_pago VARCHAR(50),
    tipo_proveedor VARCHAR(50),
    rating INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- 5. IMPORTADORAS Y COMERCIALES
-- ============================================

CREATE TABLE importadoras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rfc VARCHAR(20),
    direccion TEXT,
    aduana_asignada VARCHAR(150),
    agente_aduanal VARCHAR(255),
    email VARCHAR(255),
    telefono VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE comerciales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id),
    codigo VARCHAR(30) UNIQUE NOT NULL,
    zona VARCHAR(100),
    tipo_comision VARCHAR(20),
    comision_valor DECIMAL(10,2) DEFAULT 0,
    meta_mensual DECIMAL(15,2) DEFAULT 0,
    meta_anual DECIMAL(15,2) DEFAULT 0,
    supervisor_id UUID REFERENCES usuarios(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- 6. OFERTAS
-- ============================================

CREATE TABLE ofertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio VARCHAR(30) UNIQUE NOT NULL,
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    comercial_id UUID NOT NULL REFERENCES usuarios(id),
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vigencia DATE,
    estado estado_oferta NOT NULL DEFAULT 'borrador',
    tipo_operacion tipo_operacion,
    condiciones_pago VARCHAR(50),
    incoterm VARCHAR(10),
    moneda VARCHAR(3) DEFAULT 'USD',
    tipo_cambio DECIMAL(10,4),
    subtotal DECIMAL(15,2) DEFAULT 0,
    descuento_global DECIMAL(15,2) DEFAULT 0,
    iva DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) DEFAULT 0,
    notas TEXT,
    notas_internas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE fichas_oferta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oferta_id UUID NOT NULL REFERENCES ofertas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad DECIMAL(15,3) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    precio_unitario DECIMAL(15,2) NOT NULL,
    descuento DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(15,2) DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- 7. CONTENEDORES Y EMBARQUES
-- ============================================

CREATE TABLE contenedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_contenedor VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    tamano VARCHAR(10),
    booking VARCHAR(50),
    naviera VARCHAR(150),
    importadora_id UUID REFERENCES importadoras(id),
    eta DATE,
    etd DATE,
    puerto_origen VARCHAR(150),
    puerto_destino VARCHAR(150),
    sello VARCHAR(50),
    peso_kg DECIMAL(10,2),
    volumen_m3 DECIMAL(10,2),
    estado estado_contenedor NOT NULL DEFAULT 'programado',
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE embarques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contenedor_id UUID NOT NULL REFERENCES contenedores(id),
    estado VARCHAR(30) NOT NULL,
    ubicacion_actual VARCHAR(255),
    fecha_evento TIMESTAMPTZ NOT NULL DEFAULT now(),
    descripcion TEXT,
    usuario_registra UUID REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE oferta_embarque (
    oferta_id UUID NOT NULL REFERENCES ofertas(id) ON DELETE CASCADE,
    embarque_id UUID NOT NULL REFERENCES embarques(id) ON DELETE CASCADE,
    PRIMARY KEY (oferta_id, embarque_id)
);

-- ============================================
-- 8. FACTURACIÓN Y COBROS
-- ============================================

CREATE TABLE facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio VARCHAR(30) UNIQUE NOT NULL,
    oferta_id UUID REFERENCES ofertas(id),
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    tipo VARCHAR(20) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    iva DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    tipo_cambio DECIMAL(10,4),
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    estado estado_factura NOT NULL DEFAULT 'pendiente',
    uuid_cfdi VARCHAR(100),
    xml_path TEXT,
    pdf_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE cobros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id UUID NOT NULL REFERENCES facturas(id),
    monto DECIMAL(15,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    tipo_cambio DECIMAL(10,4),
    fecha_cobro DATE NOT NULL,
    metodo_pago VARCHAR(50),
    referencia VARCHAR(100),
    cobrador_id UUID REFERENCES usuarios(id),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- 9. PAGOS Y GASTOS
-- ============================================

CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor_id UUID NOT NULL REFERENCES proveedores(id),
    oferta_id UUID REFERENCES ofertas(id),
    monto DECIMAL(15,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    tipo_cambio DECIMAL(10,4),
    fecha_pago DATE NOT NULL,
    metodo_pago VARCHAR(50),
    referencia VARCHAR(100),
    pagador_id UUID REFERENCES usuarios(id),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria categoria_gasto NOT NULL,
    proveedor_id UUID REFERENCES proveedores(id),
    contenedor_id UUID REFERENCES contenedores(id),
    oferta_id UUID REFERENCES ofertas(id),
    descripcion TEXT NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    tipo_cambio DECIMAL(10,4),
    fecha_gasto DATE NOT NULL,
    comprobante_path TEXT,
    registrado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- 10. EXPEDIENTES
-- ============================================

CREATE TABLE expedientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio VARCHAR(30) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    oferta_id UUID REFERENCES ofertas(id),
    contenedor_id UUID REFERENCES contenedores(id),
    importadora_id UUID REFERENCES importadoras(id),
    estado estado_expediente NOT NULL DEFAULT 'abierto',
    fecha_apertura DATE NOT NULL,
    fecha_cierre DATE,
    responsable_id UUID REFERENCES usuarios(id),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- 11. DOCUMENTOS
-- ============================================

CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_documento tipo_documento NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    oferta_id UUID REFERENCES ofertas(id),
    cliente_id UUID REFERENCES clientes(id),
    proveedor_id UUID REFERENCES proveedores(id),
    contenedor_id UUID REFERENCES contenedores(id),
    expediente_id UUID REFERENCES expedientes(id),
    version_actual INTEGER DEFAULT 1,
    firmado BOOLEAN DEFAULT false,
    storage_path TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE versiones_documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    file_size BIGINT,
    subido_por UUID REFERENCES usuarios(id),
    notas_cambio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE historial_documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 12. AUDITORÍA Y ACTIVIDAD
-- ============================================

CREATE TABLE auditoria_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla VARCHAR(100) NOT NULL,
    operacion VARCHAR(10) NOT NULL,
    registro_id UUID,
    usuario_id UUID REFERENCES usuarios(id),
    datos_previos JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE actividad_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 13. NOTIFICACIONES
-- ============================================

CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo tipo_notificacion NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT,
    referencia_modulo VARCHAR(50),
    referencia_id UUID,
    leida BOOLEAN DEFAULT false,
    fecha_lectura TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
