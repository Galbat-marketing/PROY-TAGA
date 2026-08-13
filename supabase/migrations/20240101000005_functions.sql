-- ============================================
-- TAGA ERP — Migration 005: Business Functions
-- ============================================

-- ============================================
-- FN 1: Calcular totales de una oferta
-- ============================================
CREATE OR REPLACE FUNCTION fn_calcular_total_oferta(p_oferta_id UUID)
RETURNS TABLE(
    subtotal DECIMAL(15,2),
    descuento DECIMAL(15,2),
    iva DECIMAL(15,2),
    total DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(fo.subtotal), 0)::DECIMAL(15,2) AS subtotal,
        COALESCE(SUM(fo.subtotal * fo.descuento / 100), 0)::DECIMAL(15,2) AS descuento,
        COALESCE(SUM(fo.subtotal * 0.16), 0)::DECIMAL(15,2) AS iva,
        COALESCE(SUM(fo.subtotal * 1.16), 0)::DECIMAL(15,2) AS total
    FROM fichas_oferta fo
    WHERE fo.oferta_id = p_oferta_id AND fo.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- FN 2: Obtener ofertas del equipo de un supervisor
-- ============================================
CREATE OR REPLACE FUNCTION fn_ofertas_equipo(p_supervisor_id UUID)
RETURNS SETOF ofertas AS $$
BEGIN
    RETURN QUERY
    SELECT o.*
    FROM ofertas o
    WHERE o.comercial_id IN (
        SELECT c.usuario_id
        FROM comerciales c
        WHERE c.supervisor_id = p_supervisor_id
           OR c.usuario_id = p_supervisor_id
    )
    AND o.deleted_at IS NULL
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- FN 3: Resumen financiero del mes
-- ============================================
CREATE OR REPLACE FUNCTION fn_resumen_financiero_mes(p_year INT, p_month INT)
RETURNS TABLE(
    total_ventas DECIMAL(15,2),
    total_cobrado DECIMAL(15,2),
    total_pagado DECIMAL(15,2),
    total_gastos DECIMAL(15,2),
    saldo_neto DECIMAL(15,2),
    ofertas_aceptadas INT,
    facturas_emitidas INT
) AS $$
DECLARE
    fecha_inicio DATE := make_date(p_year, p_month, 1);
    fecha_fin DATE := (fecha_inicio + INTERVAL '1 month')::DATE;
BEGIN
    RETURN QUERY
    SELECT
        COALESCE((SELECT SUM(o.total) FROM ofertas o WHERE o.estado IN ('aceptada', 'convertida') AND o.deleted_at IS NULL AND o.fecha_emision >= fecha_inicio AND o.fecha_emision < fecha_fin), 0) AS total_ventas,
        COALESCE((SELECT SUM(cb.monto) FROM cobros cb WHERE cb.deleted_at IS NULL AND cb.fecha_cobro >= fecha_inicio AND cb.fecha_cobro < fecha_fin), 0) AS total_cobrado,
        COALESCE((SELECT SUM(p.monto) FROM pagos p WHERE p.deleted_at IS NULL AND p.fecha_pago >= fecha_inicio AND p.fecha_pago < fecha_fin), 0) AS total_pagado,
        COALESCE((SELECT SUM(g.monto) FROM gastos g WHERE g.deleted_at IS NULL AND g.fecha_gasto >= fecha_inicio AND g.fecha_gasto < fecha_fin), 0) AS total_gastos,
        0::DECIMAL(15,2) AS saldo_neto,
        (SELECT COUNT(*)::INT FROM ofertas o WHERE o.estado IN ('aceptada', 'convertida') AND o.deleted_at IS NULL AND o.fecha_emision >= fecha_inicio AND o.fecha_emision < fecha_fin) AS ofertas_aceptadas,
        (SELECT COUNT(*)::INT FROM facturas f WHERE f.deleted_at IS NULL AND f.fecha_emision >= fecha_inicio AND f.fecha_emision < fecha_fin) AS facturas_emitidas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- FN 4: Saldo pendiente de cliente
-- ============================================
CREATE OR REPLACE FUNCTION fn_saldo_cliente(p_cliente_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    v_saldo DECIMAL(15,2);
BEGIN
    SELECT COALESCE(SUM(f.total - COALESCE(cb.total_cobrado, 0)), 0)
    INTO v_saldo
    FROM facturas f
    LEFT JOIN (
        SELECT factura_id, SUM(monto) AS total_cobrado
        FROM cobros
        WHERE deleted_at IS NULL
        GROUP BY factura_id
    ) cb ON cb.factura_id = f.id
    WHERE f.cliente_id = p_cliente_id
    AND f.deleted_at IS NULL
    AND f.estado IN ('pendiente', 'parcial');

    RETURN v_saldo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- FN 5: Tracking completo de contenedor
-- ============================================
CREATE OR REPLACE FUNCTION fn_tracking_contenedor(p_contenedor_id UUID)
RETURNS TABLE(
    numero_contenedor VARCHAR,
    naviera VARCHAR,
    estado VARCHAR,
    eta DATE,
    etd DATE,
    puerto_origen VARCHAR,
    puerto_destino VARCHAR,
    total_eventos INT,
    ultimo_evento TIMESTAMPTZ,
    ofertas_asociadas INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.numero_contenedor,
        c.naviera,
        c.estado::VARCHAR,
        c.eta,
        c.etd,
        c.puerto_origen,
        c.puerto_destino,
        COUNT(DISTINCT e.id)::INT AS total_eventos,
        MAX(e.fecha_evento) AS ultimo_evento,
        COUNT(DISTINCT oe.oferta_id)::INT AS ofertas_asociadas
    FROM contenedores c
    LEFT JOIN embarques e ON e.contenedor_id = c.id AND e.deleted_at IS NULL
    LEFT JOIN oferta_embarque oe ON oe.embarque_id IN (SELECT id FROM embarques WHERE contenedor_id = c.id)
    WHERE c.id = p_contenedor_id
    GROUP BY c.id, c.numero_contenedor, c.naviera, c.estado, c.eta, c.etd, c.puerto_origen, c.puerto_destino;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- FN 6: Búsqueda global (productos, clientes, proveedores, ofertas)
-- ============================================
CREATE OR REPLACE FUNCTION fn_busqueda_global(p_query TEXT)
RETURNS TABLE(
    tipo VARCHAR,
    id UUID,
    codigo VARCHAR,
    nombre TEXT,
    descripcion TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'producto' AS tipo, p.id, p.codigo, p.nombre::TEXT, p.descripcion::TEXT
    FROM productos p
    WHERE p.deleted_at IS NULL
    AND (
        p.nombre ILIKE '%' || p_query || '%'
        OR p.codigo ILIKE '%' || p_query || '%'
        OR p.descripcion ILIKE '%' || p_query || '%'
    )
    UNION ALL
    SELECT 'cliente' AS tipo, c.id, c.codigo, c.nombre::TEXT, c.rfc::TEXT
    FROM clientes c
    WHERE c.deleted_at IS NULL
    AND (
        c.nombre ILIKE '%' || p_query || '%'
        OR c.codigo ILIKE '%' || p_query || '%'
        OR c.rfc ILIKE '%' || p_query || '%'
    )
    UNION ALL
    SELECT 'proveedor' AS tipo, pr.id, pr.codigo, pr.nombre::TEXT, pr.rfc::TEXT
    FROM proveedores pr
    WHERE pr.deleted_at IS NULL
    AND (
        pr.nombre ILIKE '%' || p_query || '%'
        OR pr.codigo ILIKE '%' || p_query || '%'
    )
    UNION ALL
    SELECT 'oferta' AS tipo, o.id, o.folio,
           ('Oferta ' || o.folio || ' - ' || COALESCE(cl.nombre, ''))::TEXT,
           o.estado::TEXT
    FROM ofertas o
    LEFT JOIN clientes cl ON cl.id = o.cliente_id
    WHERE o.deleted_at IS NULL
    AND (
        o.folio ILIKE '%' || p_query || '%'
        OR cl.nombre ILIKE '%' || p_query || '%'
    )
    ORDER BY tipo
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- FN 7: Notificar vencimientos (para cron job)
-- ============================================
CREATE OR REPLACE FUNCTION fn_verificar_vencimientos()
RETURNS TABLE(usuario_id UUID, mensaje TEXT) AS $$
BEGIN
    -- Facturas por vencer en 7 días
    INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, referencia_modulo, referencia_id)
    SELECT
        u.id,
        'vencimiento',
        'Factura por vencer',
        'La factura ' || f.folio || ' por $' || (f.total - COALESCE(cb.total_cobrado, 0)) || ' vence el ' || f.fecha_vencimiento,
        'facturas',
        f.id
    FROM facturas f
    CROSS JOIN usuarios u
    LEFT JOIN (
        SELECT factura_id, SUM(monto) AS total_cobrado
        FROM cobros WHERE deleted_at IS NULL
        GROUP BY factura_id
    ) cb ON cb.factura_id = f.id
    WHERE f.estado IN ('pendiente', 'parcial')
    AND f.deleted_at IS NULL
    AND f.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
    AND NOT EXISTS (
        SELECT 1 FROM notificaciones n
        WHERE n.referencia_id = f.id AND n.tipo = 'vencimiento' AND n.leida = false
    );

    -- Contenedores con ETA próxima
    INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, referencia_modulo, referencia_id)
    SELECT
        u.id,
        'alerta',
        'Contenedor próximo a llegar',
        'El contenedor ' || c.numero_contenedor || ' tiene ETA el ' || c.eta || ' (' || c.puerto_destino || ')',
        'contenedores',
        c.id
    FROM contenedores c
    CROSS JOIN usuarios u
    WHERE c.estado IN ('programado', 'en_transito')
    AND c.deleted_at IS NULL
    AND c.eta BETWEEN CURRENT_DATE AND CURRENT_DATE + 3
    AND NOT EXISTS (
        SELECT 1 FROM notificaciones n
        WHERE n.referencia_id = c.id AND n.tipo = 'alerta' AND n.leida = false
    );

    RETURN QUERY
    SELECT n.usuario_id, (n.titulo || ': ' || n.mensaje)::TEXT
    FROM notificaciones n
    WHERE n.created_at >= now() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
