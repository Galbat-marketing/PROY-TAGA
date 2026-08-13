-- ============================================
-- TAGA ERP — Migration 006: Views
-- ============================================

-- ============================================
-- VIEW 1: Dashboard Ventas (últimos 12 meses)
-- ============================================
CREATE OR REPLACE VIEW v_dashboard_ventas AS
SELECT
    date_trunc('month', o.fecha_emision) AS mes,
    COUNT(*)::INT AS total_ofertas,
    SUM(o.total)::DECIMAL(15,2) AS ingreso_total,
    COALESCE(AVG(o.total), 0)::DECIMAL(15,2) AS ticket_promedio,
    COUNT(DISTINCT o.cliente_id)::INT AS clientes_activos,
    COUNT(*) FILTER (WHERE o.estado = 'aceptada')::INT AS ofertas_aceptadas,
    COUNT(*) FILTER (WHERE o.estado = 'rechazada')::INT AS ofertas_rechazadas,
    CASE
        WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE o.estado = 'aceptada')::DECIMAL / COUNT(*) * 100, 1)
        ELSE 0
    END AS tasa_conversion
FROM ofertas o
WHERE o.estado IN ('aceptada', 'convertida')
  AND o.deleted_at IS NULL
  AND o.fecha_emision >= date_trunc('month', CURRENT_DATE) - INTERVAL '12 months'
GROUP BY date_trunc('month', o.fecha_emision)
ORDER BY mes DESC;

-- ============================================
-- VIEW 2: Dashboard Cobros Pendientes
-- ============================================
CREATE OR REPLACE VIEW v_cobros_pendientes AS
SELECT
    f.id AS factura_id,
    f.folio AS factura_folio,
    c.nombre AS cliente_nombre,
    c.id AS cliente_id,
    f.total AS total_factura,
    COALESCE(cb.total_cobrado, 0)::DECIMAL(15,2) AS total_cobrado,
    (f.total - COALESCE(cb.total_cobrado, 0))::DECIMAL(15,2) AS saldo_pendiente,
    f.fecha_emision,
    f.fecha_vencimiento,
    CASE
        WHEN f.fecha_vencimiento < CURRENT_DATE THEN 'vencida'
        WHEN f.fecha_vencimiento <= CURRENT_DATE + 7 THEN 'por_vencer'
        ELSE 'al_corriente'
    END AS estado_cobro,
    f.estado AS estado_factura,
    (CURRENT_DATE - f.fecha_vencimiento)::INT AS dias_vencida
FROM facturas f
JOIN clientes c ON c.id = f.cliente_id
LEFT JOIN (
    SELECT factura_id, SUM(monto) AS total_cobrado
    FROM cobros
    WHERE deleted_at IS NULL
    GROUP BY factura_id
) cb ON cb.factura_id = f.id
WHERE f.estado IN ('pendiente', 'parcial')
  AND f.deleted_at IS NULL
ORDER BY
    CASE WHEN f.fecha_vencimiento < CURRENT_DATE THEN 0 ELSE 1 END,
    f.fecha_vencimiento ASC;

-- ============================================
-- VIEW 3: Dashboard Operaciones Activas
-- ============================================
CREATE OR REPLACE VIEW v_operaciones_activas AS
SELECT
    c.id AS contenedor_id,
    c.numero_contenedor,
    c.naviera,
    c.estado AS estado_contenedor,
    c.eta,
    c.etd,
    c.puerto_origen,
    c.puerto_destino,
    c.importadora_id,
    i.nombre AS importadora_nombre,
    COUNT(DISTINCT e.id)::INT AS total_eventos,
    MAX(e.fecha_evento) AS ultimo_evento,
    CASE
        WHEN c.eta IS NOT NULL AND c.eta < CURRENT_DATE AND c.estado NOT IN ('entregado', 'liberado') THEN 'atrasado'
        WHEN c.eta IS NOT NULL AND c.eta <= CURRENT_DATE + 3 AND c.estado NOT IN ('entregado', 'liberado') THEN 'proximo'
        ELSE 'normal'
    END AS alerta
FROM contenedores c
LEFT JOIN importadoras i ON i.id = c.importadora_id
LEFT JOIN embarques e ON e.contenedor_id = c.id AND e.deleted_at IS NULL
WHERE c.estado NOT IN ('entregado', 'cancelado')
  AND c.deleted_at IS NULL
GROUP BY c.id, c.numero_contenedor, c.naviera, c.estado, c.eta, c.etd,
         c.puerto_origen, c.puerto_destino, c.importadora_id, i.nombre
ORDER BY
    CASE WHEN c.eta IS NULL THEN 1 ELSE 0 END,
    c.eta ASC NULLS LAST;

-- ============================================
-- VIEW 4: KPIs Ejecutivos
-- ============================================
CREATE OR REPLACE VIEW v_kpis_ejecutivos AS
SELECT
    -- Ventas
    COALESCE(SUM(o.total), 0)::DECIMAL(15,2) AS ventas_mes_actual,
    COUNT(DISTINCT o.id)::INT AS ofertas_mes_actual,
    COALESCE(SUM(o.total) FILTER (WHERE o.estado IN ('aceptada', 'convertida')), 0)::DECIMAL(15,2) AS ventas_aceptadas_mes,
    -- Cobranza
    COALESCE(SUM(cb.monto), 0)::DECIMAL(15,2) AS cobrado_mes,
    COALESCE((
        SELECT SUM(f.total - COALESCE(cb2.total_cobrado, 0))
        FROM facturas f
        LEFT JOIN (SELECT factura_id, SUM(monto) AS total_cobrado FROM cobros WHERE deleted_at IS NULL GROUP BY factura_id) cb2 ON cb2.factura_id = f.id
        WHERE f.estado IN ('pendiente', 'parcial') AND f.deleted_at IS NULL
    ), 0)::DECIMAL(15,2) AS saldo_pendiente_total,
    -- Operaciones
    (SELECT COUNT(*)::INT FROM contenedores WHERE estado NOT IN ('entregado', 'cancelado') AND deleted_at IS NULL) AS contenedores_activos,
    (SELECT COUNT(*)::INT FROM contenedores WHERE eta < CURRENT_DATE AND estado NOT IN ('entregado', 'cancelado', 'liberado') AND deleted_at IS NULL) AS contenedores_atrasados,
    -- Clientes
    (SELECT COUNT(*)::INT FROM clientes WHERE activo = true AND deleted_at IS NULL) AS clientes_activos
FROM ofertas o
LEFT JOIN cobros cb ON cb.deleted_at IS NULL AND DATE_TRUNC('month', cb.fecha_cobro) = DATE_TRUNC('month', CURRENT_DATE)
WHERE DATE_TRUNC('month', o.fecha_emision) = DATE_TRUNC('month', CURRENT_DATE)
  AND o.deleted_at IS NULL;

-- ============================================
-- VIEW 5: Top Productos Vendidos
-- ============================================
CREATE OR REPLACE VIEW v_top_productos AS
SELECT
    p.id AS producto_id,
    p.codigo AS productoCodigo,
    p.nombre AS producto_nombre,
    cat.nombre AS categoria_nombre,
    COUNT(DISTINCT fo.id)::INT AS veces_vendido,
    SUM(fo.cantidad)::DECIMAL(15,3) AS total_cantidad,
    SUM(fo.subtotal)::DECIMAL(15,2) AS total_ingresos
FROM fichas_oferta fo
JOIN productos p ON p.id = fo.producto_id
LEFT JOIN categorias_productos cat ON cat.id = p.categoria_id
JOIN ofertas o ON o.id = fo.oferta_id
WHERE o.estado IN ('aceptada', 'convertida')
  AND fo.deleted_at IS NULL
  AND o.deleted_at IS NULL
GROUP BY p.id, p.codigo, p.nombre, cat.nombre
ORDER BY total_ingresos DESC
LIMIT 20;

-- ============================================
-- VIEW 6: Comisiones por Comercial
-- ============================================
DROP VIEW IF EXISTS v_comisiones_comerciales CASCADE;
CREATE VIEW v_comisiones_comerciales AS
SELECT
    cc.id AS comercial_id,
    cc.codigo AS codigo_comercial,
    cc.nombre AS nombre_comercial,
    c.zona,
    c.tipo_comision,
    c.comision_valor,
    COUNT(DISTINCT o.id)::INT AS ofertas_cerradas,
    COALESCE(SUM(o.total), 0)::DECIMAL(15,2) AS ventas_totales,
    CASE
        WHEN c.tipo_comision = 'porcentaje'
        THEN COALESCE(SUM(o.total) * c.comision_valor / 100, 0)
        WHEN c.tipo_comision = 'fija'
        THEN COUNT(DISTINCT o.id) * c.comision_valor
        ELSE 0
    END::DECIMAL(15,2) AS comision_total
FROM codificador_comerciales cc
LEFT JOIN comerciales c ON c.codigo = cc.codigo AND c.deleted_at IS NULL
LEFT JOIN ofertas o ON o.comercial_id = cc.id
    AND o.estado IN ('aceptada', 'convertida')
    AND o.deleted_at IS NULL
WHERE cc.deleted_at IS NULL
GROUP BY cc.id, cc.codigo, cc.nombre, c.zona, c.tipo_comision, c.comision_valor;

-- ============================================
-- VIEW 7: Gastos por Contenedor
-- ============================================
CREATE OR REPLACE VIEW v_gastos_contenedor AS
SELECT
    c.id AS contenedor_id,
    c.numero_contenedor,
    g.categoria,
    COUNT(g.id)::INT AS total_gastos,
    SUM(g.monto)::DECIMAL(15,2) AS monto_total,
    STRING_AGG(g.descripcion, '; ') AS descripciones
FROM contenedores c
LEFT JOIN gastos g ON g.contenedor_id = c.id AND g.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.numero_contenedor, g.categoria;

-- ============================================
-- VIEW 8: Auditoría Reciente
-- ============================================
CREATE OR REPLACE VIEW v_auditoria_reciente AS
SELECT
    al.id,
    al.tabla,
    al.operacion,
    al.registro_id,
    u.nombre || ' ' || u.apellido AS usuario_nombre,
    u.email AS usuario_email,
    al.ip_address,
    al.created_at,
    al.datos_previos,
    al.datos_nuevos
FROM auditoria_log al
LEFT JOIN usuarios u ON u.id = al.usuario_id
ORDER BY al.created_at DESC
LIMIT 100;
