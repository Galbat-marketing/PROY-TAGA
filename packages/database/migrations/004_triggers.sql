-- ============================================
-- TAGA ERP — Migration 004: Triggers
-- ============================================

-- ============================================
-- Trigger 1: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION fn_actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar a todas las tablas con updated_at
DO $$
DECLARE
    tablas TEXT[] := ARRAY[
        'usuarios', 'roles', 'categorias_productos', 'productos',
        'precios_producto', 'stock_producto', 'clientes',
        'direcciones_cliente', 'contactos_cliente', 'proveedores',
        'importadoras', 'comerciales', 'ofertas', 'fichas_oferta',
        'contenedores', 'embarques', 'facturas', 'cobros',
        'pagos', 'gastos', 'expedientes', 'documentos', 'notificaciones'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tablas
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_timestamp BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp()',
            t, t
        );
    END LOOP;
END;
$$;

-- ============================================
-- Trigger 2: Generar folio automático para ofertas
-- ============================================
CREATE OR REPLACE FUNCTION fn_generar_folio_oferta()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    next_num INTEGER;
BEGIN
    IF NEW.folio IS NULL OR NEW.folio = '' THEN
        year_prefix := to_char(NEW.fecha_emision, 'YYYY');
        SELECT COALESCE(MAX(SUBSTRING(folio FROM 'OF-\d{4}-(\d{5})')::INTEGER), 0) + 1
        INTO next_num
        FROM ofertas
        WHERE folio LIKE 'OF-' || year_prefix || '-%';
        NEW.folio := 'OF-' || year_prefix || '-' || LPAD(COALESCE(next_num, 1)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_ofertas_folio
    BEFORE INSERT ON ofertas
    FOR EACH ROW
    EXECUTE FUNCTION fn_generar_folio_oferta();

-- ============================================
-- Trigger 3: Generar folio automático para expedientes
-- ============================================
CREATE OR REPLACE FUNCTION fn_generar_folio_expediente()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    next_num INTEGER;
BEGIN
    IF NEW.folio IS NULL OR NEW.folio = '' THEN
        year_prefix := to_char(NEW.fecha_apertura, 'YYYY');
        SELECT COALESCE(MAX(SUBSTRING(folio FROM 'EXP-\d{4}-(\d{5})')::INTEGER), 0) + 1
        INTO next_num
        FROM expedientes
        WHERE folio LIKE 'EXP-' || year_prefix || '-%';
        NEW.folio := 'EXP-' || year_prefix || '-' || LPAD(COALESCE(next_num, 1)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_expedientes_folio
    BEFORE INSERT ON expedientes
    FOR EACH ROW
    EXECUTE FUNCTION fn_generar_folio_expediente();

-- ============================================
-- Trigger 4: Calcular subtotal en fichas_oferta
-- ============================================
CREATE OR REPLACE FUNCTION fn_calcular_subtotal_ficha()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := NEW.cantidad * NEW.precio_unitario * (1 - COALESCE(NEW.descuento, 0) / 100);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_fichas_subtotal
    BEFORE INSERT OR UPDATE ON fichas_oferta
    FOR EACH ROW
    EXECUTE FUNCTION fn_calcular_subtotal_ficha();

-- ============================================
-- Trigger 5: Actualizar totales en oferta cuando cambian fichas
-- ============================================
CREATE OR REPLACE FUNCTION fn_actualizar_totales_oferta()
RETURNS TRIGGER AS $$
DECLARE
    v_subtotal DECIMAL(15,2);
    v_descuento DECIMAL(15,2);
    v_iva DECIMAL(15,2);
    v_total DECIMAL(15,2);
    v_oferta_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_oferta_id := OLD.oferta_id;
    ELSE
        v_oferta_id := NEW.oferta_id;
    END IF;

    SELECT
        COALESCE(SUM(fo.subtotal), 0),
        COALESCE(SUM(fo.subtotal * fo.descuento / 100), 0),
        0,
        COALESCE(SUM(fo.subtotal), 0)
    INTO v_subtotal, v_descuento, v_iva, v_total
    FROM fichas_oferta fo
    WHERE fo.oferta_id = v_oferta_id AND fo.deleted_at IS NULL;

    UPDATE ofertas SET
        subtotal = v_subtotal,
        descuento_global = v_descuento,
        iva = v_iva,
        total = v_total,
        updated_at = now()
    WHERE id = v_oferta_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_fichas_actualizar_oferta
    AFTER INSERT OR UPDATE OR DELETE ON fichas_oferta
    FOR EACH ROW
    EXECUTE FUNCTION fn_actualizar_totales_oferta();

-- ============================================
-- Trigger 6: Auditoría genérica para tablas críticas
-- ============================================
CREATE OR REPLACE FUNCTION fn_auditar_cambio()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_ip INET;
BEGIN
    BEGIN
        v_usuario_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;

    BEGIN
        v_ip := inet_client_addr();
    EXCEPTION WHEN OTHERS THEN
        v_ip := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria_log (tabla, operacion, registro_id, usuario_id, datos_nuevos, ip_address)
        VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, v_usuario_id, row_to_json(NEW)::jsonb, v_ip);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO auditoria_log (tabla, operacion, registro_id, usuario_id, datos_previos, datos_nuevos, ip_address)
        VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, v_usuario_id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, v_ip);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO auditoria_log (tabla, operacion, registro_id, usuario_id, datos_previos, ip_address)
        VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, v_usuario_id, row_to_json(OLD)::jsonb, v_ip);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger de auditoría a tablas críticas
CREATE TRIGGER trg_ofertas_auditar AFTER INSERT OR UPDATE OR DELETE ON ofertas
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio();

CREATE TRIGGER trg_fichas_auditar AFTER INSERT OR UPDATE OR DELETE ON fichas_oferta
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio();

CREATE TRIGGER trg_facturas_auditar AFTER INSERT OR UPDATE OR DELETE ON facturas
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio();

CREATE TRIGGER trg_cobros_auditar AFTER INSERT OR UPDATE OR DELETE ON cobros
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio();

CREATE TRIGGER trg_pagos_auditar AFTER INSERT OR UPDATE OR DELETE ON pagos
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio();

CREATE TRIGGER trg_clientes_auditar AFTER INSERT OR UPDATE OR DELETE ON clientes
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio();

CREATE TRIGGER trg_proveedores_auditar AFTER INSERT OR UPDATE OR DELETE ON proveedores
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio();

CREATE TRIGGER trg_contenedores_auditar AFTER INSERT OR UPDATE OR DELETE ON contenedores
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio();

-- ============================================
-- Trigger 7: Registrar actividad de usuario
-- ============================================
CREATE OR REPLACE FUNCTION fn_registrar_actividad()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_ip INET;
BEGIN
    BEGIN
        v_usuario_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;

    BEGIN
        v_ip := inet_client_addr();
    EXCEPTION WHEN OTHERS THEN
        v_ip := NULL;
    END;

    INSERT INTO actividad_usuarios (usuario_id, accion, modulo, metadata, ip_address)
    VALUES (
        v_usuario_id,
        TG_ARGV[0],
        TG_TABLE_NAME,
        jsonb_build_object('registro_id', NEW.id, 'tabla', TG_TABLE_NAME),
        v_ip
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de actividad en tabla críticas
CREATE TRIGGER trg_ofertas_actividad AFTER INSERT ON ofertas
    FOR EACH ROW EXECUTE FUNCTION fn_registrar_actividad('crear_oferta');

CREATE TRIGGER trg_facturas_actividad AFTER INSERT ON facturas
    FOR EACH ROW EXECUTE FUNCTION fn_registrar_actividad('crear_factura');

CREATE TRIGGER trg_cobros_actividad AFTER INSERT ON cobros
    FOR EACH ROW EXECUTE FUNCTION fn_registrar_actividad('registrar_cobro');

CREATE TRIGGER trg_pagos_actividad AFTER INSERT ON pagos
    FOR EACH ROW EXECUTE FUNCTION fn_registrar_actividad('registrar_pago');
