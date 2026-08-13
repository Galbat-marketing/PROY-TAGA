-- ============================================
-- TAGA ERP — Migration 008: Additional Security Measures
-- ============================================

-- ============================================
-- 1. Audit Triggers for Document Operations
-- ============================================
CREATE OR REPLACE FUNCTION fn_auditar_cambio_documento()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_ip INET;
BEGIN
    -- Get user ID from JWT token
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

    IF NEW.id IS NULL THEN
        RETURN NULL;
    END IF;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria_log (tabla, operacion, registro_id, usuario_id, datos_nuevos, ip_address)
        VALUES ('documentos', 'insert', NEW.id, v_usuario_id, row_to_json(NEW)::jsonb, v_ip);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO auditoria_log (tabla, operacion, registro_id, usuario_id, datos_previos, datos_nuevos, ip_address)
        VALUES ('documentos', 'update', NEW.id, v_usuario_id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, v_ip);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO auditoria_log (tabla, operacion, registro_id, usuario_id, datos_previos, ip_address)
        VALUES ('documentos', 'delete', OLD.id, v_usuario_id, row_to_json(OLD)::jsonb, v_ip);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_documentos_auditar AFTER INSERT OR UPDATE OR DELETE ON documentos
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio_documento();

-- ============================================
-- 2. Rate Limiting Configuration (handled in Edge Middleware)
-- ============================================
-- No DB changes needed; middleware handles it at runtime.