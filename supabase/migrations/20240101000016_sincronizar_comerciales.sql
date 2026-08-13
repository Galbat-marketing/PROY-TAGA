-- ============================================
-- TAGA ERP — Migration 016: Sincronizar comerciales
-- Pobla usuarios y comerciales desde codificador_comerciales
-- ============================================

DO $$
DECLARE
    rec RECORD;
    v_user_id UUID;
    v_nombre VARCHAR(150);
    v_apellido VARCHAR(150);
    v_email VARCHAR(255);
    v_space_pos INT;
BEGIN
    FOR rec IN SELECT * FROM codificador_comerciales WHERE deleted_at IS NULL LOOP
        -- Saltar si ya existe un comercial con este codigo
        IF EXISTS (SELECT 1 FROM comerciales WHERE codigo = rec.codigo AND deleted_at IS NULL) THEN
            CONTINUE;
        END IF;

        -- Separar nombre completo en nombre y apellido
        v_space_pos := POSITION(' ' IN rec.nombre);
        IF v_space_pos > 0 THEN
            v_nombre := SUBSTRING(rec.nombre FROM 1 FOR v_space_pos - 1);
            v_apellido := SUBSTRING(rec.nombre FROM v_space_pos + 1);
        ELSE
            v_nombre := rec.nombre;
            v_apellido := '';
        END IF;

        v_email := LOWER(REGEXP_REPLACE(rec.nombre, '\s+', '.', 'g')) || '@taga.com';

        -- Insertar usuario si no existe por email
        INSERT INTO usuarios (email, nombre, apellido)
        VALUES (v_email, v_nombre, v_apellido)
        ON CONFLICT (email) DO NOTHING;

        -- Obtener el id del usuario (recien creado o existente)
        SELECT id INTO v_user_id FROM usuarios WHERE email = v_email;

        -- Insertar comercial con configuracion predeterminada
        INSERT INTO comerciales (usuario_id, codigo, zona, tipo_comision, comision_valor, meta_mensual, meta_anual)
        VALUES (v_user_id, rec.codigo, 'Nacional', 'porcentaje', 1.00, 0, 0)
        ON CONFLICT (codigo) DO NOTHING;

        RAISE NOTICE 'Creado comercial: % (%)', rec.codigo, rec.nombre;
    END LOOP;
END $$;
