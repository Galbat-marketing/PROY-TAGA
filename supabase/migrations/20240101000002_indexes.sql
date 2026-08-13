-- ============================================
-- TAGA ERP — Migration 002: Indexes
-- ============================================

-- Performance indexes
CREATE INDEX idx_productos_categoria ON productos(categoria_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_productos_codigo ON productos(codigo) WHERE deleted_at IS NULL;
CREATE INDEX idx_productos_fraccion ON productos(fraccion_arancelaria) WHERE deleted_at IS NULL;
CREATE INDEX idx_productos_activo ON productos(activo) WHERE deleted_at IS NULL;

CREATE INDEX idx_ofertas_cliente ON ofertas(cliente_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ofertas_comercial ON ofertas(comercial_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ofertas_estado ON ofertas(estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_ofertas_fecha ON ofertas(fecha_emision) WHERE deleted_at IS NULL;
CREATE INDEX idx_ofertas_folio ON ofertas(folio);

CREATE INDEX idx_fichas_oferta_oferta ON fichas_oferta(oferta_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_fichas_oferta_producto ON fichas_oferta(producto_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_facturas_cliente ON facturas(cliente_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_facturas_oferta ON facturas(oferta_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_facturas_estado ON facturas(estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_facturas_folio ON facturas(folio);
CREATE INDEX idx_facturas_vencimiento ON facturas(fecha_vencimiento) WHERE deleted_at IS NULL AND estado IN ('pendiente', 'parcial');

CREATE INDEX idx_cobros_factura ON cobros(factura_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cobros_fecha ON cobros(fecha_cobro) WHERE deleted_at IS NULL;

CREATE INDEX idx_pagos_proveedor ON pagos(proveedor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago) WHERE deleted_at IS NULL;

CREATE INDEX idx_gastos_categoria ON gastos(categoria) WHERE deleted_at IS NULL;
CREATE INDEX idx_gastos_contenedor ON gastos(contenedor_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_contenedores_estado ON contenedores(estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_contenedores_eta ON contenedores(eta) WHERE deleted_at IS NULL;
CREATE INDEX idx_contenedores_numero ON contenedores(numero_contenedor);

CREATE INDEX idx_embarques_contenedor ON embarques(contenedor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_embarques_fecha ON embarques(fecha_evento) WHERE deleted_at IS NULL;

CREATE INDEX idx_expedientes_estado ON expedientes(estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_expedientes_folio ON expedientes(folio);

CREATE INDEX idx_documentos_tipo ON documentos(tipo_documento) WHERE deleted_at IS NULL;
CREATE INDEX idx_documentos_oferta ON documentos(oferta_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_auditoria_tabla ON auditoria_log(tabla);
CREATE INDEX idx_auditoria_fecha ON auditoria_log(created_at);
CREATE INDEX idx_auditoria_usuario ON auditoria_log(usuario_id);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida) WHERE leida = false;

CREATE INDEX idx_actividad_usuario ON actividad_usuarios(usuario_id);
CREATE INDEX idx_actividad_modulo ON actividad_usuarios(modulo);

-- Full-text search indexes
CREATE INDEX idx_productos_busqueda ON productos USING GIN(
    to_tsvector('spanish', coalesce(nombre, '') || ' ' || coalesce(descripcion, '') || ' ' || coalesce(codigo, ''))
) WHERE deleted_at IS NULL;

CREATE INDEX idx_clientes_busqueda ON clientes USING GIN(
    to_tsvector('spanish', coalesce(nombre, '') || ' ' || coalesce(rfc, '') || ' ' || coalesce(codigo, ''))
) WHERE deleted_at IS NULL;

CREATE INDEX idx_proveedores_busqueda ON proveedores USING GIN(
    to_tsvector('spanish', coalesce(nombre, '') || ' ' || coalesce(rfc, '') || ' ' || coalesce(codigo, ''))
) WHERE deleted_at IS NULL;
