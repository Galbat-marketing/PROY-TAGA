-- ============================================
-- TAGA ERP — Migration 013: Codificador Comerciales
-- ============================================

CREATE TABLE codificador_comerciales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_codificador_comerciales_activo ON codificador_comerciales(activo);

ALTER TABLE codificador_comerciales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "codificador_comerciales_select" ON codificador_comerciales FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "codificador_comerciales_insert" ON codificador_comerciales FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin'));
CREATE POLICY "codificador_comerciales_update" ON codificador_comerciales FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));
CREATE POLICY "codificador_comerciales_delete" ON codificador_comerciales FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- Change FK on ofertas from usuarios to codificador_comerciales
ALTER TABLE ofertas DROP CONSTRAINT ofertas_comercial_id_fkey;
ALTER TABLE ofertas ADD CONSTRAINT ofertas_comercial_id_fkey
    FOREIGN KEY (comercial_id) REFERENCES codificador_comerciales(id);

-- Seed data
INSERT INTO codificador_comerciales (codigo, nombre) VALUES
    ('COM-001', 'Carlos López'),
    ('COM-002', 'María García'),
    ('COM-003', 'Juan Martínez');
