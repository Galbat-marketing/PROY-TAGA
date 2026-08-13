-- Table to track weekly commission payments to comerciales
CREATE TABLE IF NOT EXISTS pago_comisiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comercial_id UUID NOT NULL REFERENCES codificador_comerciales(id),
    semana_inicio DATE NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha_pago TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(comercial_id, semana_inicio)
);

ALTER TABLE pago_comisiones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios autenticados pueden leer pago_comisiones" ON pago_comisiones;
CREATE POLICY "Usuarios autenticados pueden leer pago_comisiones"
    ON pago_comisiones FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar pago_comisiones" ON pago_comisiones;
CREATE POLICY "Usuarios autenticados pueden insertar pago_comisiones"
    ON pago_comisiones FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar pago_comisiones" ON pago_comisiones;
CREATE POLICY "Usuarios autenticados pueden actualizar pago_comisiones"
    ON pago_comisiones FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
