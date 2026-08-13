-- ============================================
-- TAGA ERP — Migration 019: Public Access for Landing Page
-- Permite que el landing page público (sin autenticación)
-- pueda leer productos, categorías, clientes y países.
--
-- EJECUTAR EN: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Productos: público puede leer solo activos y no eliminados
CREATE POLICY "productos_select_anon" ON productos FOR SELECT TO anon
    USING (deleted_at IS NULL AND activo = true);

-- 2. Categorías: público puede leer solo activas y no eliminadas
CREATE POLICY "categorias_select_anon" ON categorias_productos FOR SELECT TO anon
    USING (deleted_at IS NULL AND activo = true);

-- 3. Clientes: solo ID para contar (público)
CREATE POLICY "clientes_select_anon" ON clientes FOR SELECT TO anon
    USING (deleted_at IS NULL AND activo = true);

-- 4. Países: lectura pública
CREATE POLICY "paises_select_anon" ON paises FOR SELECT TO anon
    USING (deleted_at IS NULL);
