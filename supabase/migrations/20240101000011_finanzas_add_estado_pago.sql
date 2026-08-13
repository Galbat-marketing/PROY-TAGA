-- ============================================
-- TAGA ERP — Migration 011: Finanzas estados
-- Hace proveedor_id nullable en pagos
-- Agrega columna estado a pagos
-- ============================================

ALTER TABLE pagos ALTER COLUMN proveedor_id DROP NOT NULL;

ALTER TABLE pagos ADD COLUMN estado VARCHAR(30) NOT NULL DEFAULT 'pendiente_aprobacion';
