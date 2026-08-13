-- ============================================
-- TAGA ERP — Migration 010: Usuarios select policy
-- ============================================
-- Todos los usuarios autenticados pueden ver el listado de usuarios
-- (necesario para asignaciones, menciones, etc.)

CREATE POLICY "usuarios_select_all" ON usuarios FOR SELECT TO authenticated
    USING (deleted_at IS NULL);
