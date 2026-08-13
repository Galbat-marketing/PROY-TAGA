-- ============================================
-- TAGA ERP — Migration 017: Storage RLS for productos bucket
-- ============================================
-- Execute via Supabase Studio SQL Editor (http://localhost:54323/project/default/sql/new)
-- or via: psql "postgresql://postgres:postgres@localhost:54322/postgres" -f <file>

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "productos_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "productos_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "productos_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "productos_storage_delete" ON storage.objects;

-- SELECT: any authenticated user can read (public bucket)
CREATE POLICY "productos_storage_select" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'productos');

-- INSERT: only admin or supervisor can upload
CREATE POLICY "productos_storage_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'productos'
        AND (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'))
    );

-- UPDATE: only admin or supervisor can overwrite
CREATE POLICY "productos_storage_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'productos'
        AND (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'))
    )
    WITH CHECK (
        bucket_id = 'productos'
        AND (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'))
    );

-- DELETE: only admin can delete images
CREATE POLICY "productos_storage_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'productos'
        AND fn_usuario_tiene_rol('admin')
    );
