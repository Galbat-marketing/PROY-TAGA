-- ============================================
-- TAGA ERP — Migration 009: Auth sync trigger
-- ============================================
-- Sincroniza auth.users -> public.usuarios automáticamente

CREATE OR REPLACE FUNCTION fn_sync_auth_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, nombre, apellido, activo)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data ->> 'apellido', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'activo', 'true')::boolean
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nombre = EXCLUDED.nombre,
        apellido = EXCLUDED.apellido,
        activo = EXCLUDED.activo,
        updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_auth_user ON auth.users;
CREATE TRIGGER trg_sync_auth_user
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION fn_sync_auth_user();
