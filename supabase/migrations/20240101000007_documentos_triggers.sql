-- ============================================
-- TAGA ERP — Migration 007: Documentos Triggers & RLS
-- ============================================

-- ============================================
-- 1. RLS Policies for versiones_documento
-- ============================================
CREATE POLICY "versiones_select" ON versiones_documento FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM documentos d
            WHERE d.id = versiones_documento.documento_id
            AND d.deleted_at IS NULL
        )
    );

CREATE POLICY "versiones_insert" ON versiones_documento FOR INSERT TO authenticated
    WITH CHECK (
        fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial')
    );

CREATE POLICY "versiones_delete" ON versiones_documento FOR DELETE TO authenticated
    USING (fn_usuario_tiene_rol('admin'));

-- ============================================
-- 2. RLS Policies for historial_documento
-- ============================================
CREATE POLICY "historial_select" ON historial_documento FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM documentos d
            WHERE d.id = historial_documento.documento_id
            AND d.deleted_at IS NULL
        )
    );

CREATE POLICY "historial_insert" ON historial_documento FOR INSERT TO authenticated
    WITH CHECK (
        fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial')
    );

-- ============================================
-- 3. Trigger: Auto-increment version
-- ============================================
CREATE OR REPLACE FUNCTION fn_incrementar_version_documento()
RETURNS TRIGGER AS $$
DECLARE
    v_siguiente INTEGER;
BEGIN
    SELECT COALESCE(MAX(version), 0) + 1
    INTO v_siguiente
    FROM versiones_documento
    WHERE documento_id = NEW.documento_id;

    NEW.version := v_siguiente;

    UPDATE documentos SET version_actual = v_siguiente
    WHERE id = NEW.documento_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_versiones_version
    BEFORE INSERT ON versiones_documento
    FOR EACH ROW
    EXECUTE FUNCTION fn_incrementar_version_documento();

-- ============================================
-- 4. Trigger: Auto-register historial
-- ============================================
CREATE OR REPLACE FUNCTION fn_registrar_historial_documento()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_accion VARCHAR(50);
    v_metadata JSONB;
BEGIN
    BEGIN
        v_usuario_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;

    IF TG_TABLE_NAME = 'documentos' THEN
        IF TG_OP = 'INSERT' THEN
            v_accion := 'creado';
            v_metadata := jsonb_build_object(
                'tipo_documento', NEW.tipo_documento,
                'nombre', NEW.nombre,
                'storage_path', NEW.storage_path
            );
            INSERT INTO historial_documento (documento_id, accion, usuario_id, metadata)
            VALUES (NEW.id, v_accion, v_usuario_id, v_metadata);
        ELSIF TG_OP = 'UPDATE' THEN
            IF NEW.firmado IS DISTINCT FROM OLD.firmado AND NEW.firmado = true THEN
                v_accion := 'firmado';
                v_metadata := '{}'::jsonb;
                INSERT INTO historial_documento (documento_id, accion, usuario_id, metadata)
                VALUES (NEW.id, v_accion, v_usuario_id, v_metadata);
            END IF;
        END IF;
    ELSIF TG_TABLE_NAME = 'versiones_documento' AND TG_OP = 'INSERT' THEN
        v_accion := 'subido_version';
        v_metadata := jsonb_build_object(
            'version', NEW.version,
            'file_size', NEW.file_size,
            'storage_path', NEW.storage_path
        );
        INSERT INTO historial_documento (documento_id, accion, usuario_id, metadata)
        VALUES (NEW.documento_id, v_accion, v_usuario_id, v_metadata);
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_documentos_historial_insert
    AFTER INSERT ON documentos
    FOR EACH ROW
    EXECUTE FUNCTION fn_registrar_historial_documento();

CREATE TRIGGER trg_documentos_historial_update
    AFTER UPDATE OF firmado ON documentos
    FOR EACH ROW
    EXECUTE FUNCTION fn_registrar_historial_documento();

CREATE TRIGGER trg_versiones_historial
    AFTER INSERT ON versiones_documento
    FOR EACH ROW
    EXECUTE FUNCTION fn_registrar_historial_documento();

-- ============================================
-- 5. Audit trigger for documentos
-- ============================================
CREATE TRIGGER trg_documentos_auditar AFTER INSERT OR UPDATE OR DELETE ON documentos
    FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio();

-- ============================================
-- 6. Activity trigger for documentos
-- ============================================
CREATE TRIGGER trg_documentos_actividad AFTER INSERT ON documentos
    FOR EACH ROW EXECUTE FUNCTION fn_registrar_actividad('subir_documento');
