-- ============================================
-- TAGA ERP — Migration 021: Storage bucket "documentos"
-- ============================================

-- Create private bucket (20MB limit, document MIME types)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  false,
  20971520,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for the documentos bucket
DROP POLICY IF EXISTS "documentos_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "documentos_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "documentos_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "documentos_storage_delete" ON storage.objects;

-- SELECT: any authenticated user can read (downloads use signed URLs)
CREATE POLICY "documentos_storage_select" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'documentos');

-- INSERT: any authenticated user can upload
CREATE POLICY "documentos_storage_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documentos');

-- UPDATE: any authenticated user can overwrite
CREATE POLICY "documentos_storage_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'documentos')
    WITH CHECK (bucket_id = 'documentos');

-- DELETE: only admin can delete files
CREATE POLICY "documentos_storage_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'documentos'
        AND fn_usuario_tiene_rol('admin')
    );
