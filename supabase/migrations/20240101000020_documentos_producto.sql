-- ============================================
-- TAGA ERP — Migration 020: Documentos ↔ Productos
-- Vincula documentos a productos (FK + índice)
-- ============================================

ALTER TABLE documentos
    ADD COLUMN producto_id UUID REFERENCES productos(id);

CREATE INDEX idx_documentos_producto ON documentos(producto_id) WHERE deleted_at IS NULL;
