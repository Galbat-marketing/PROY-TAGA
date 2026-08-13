-- ============================================
-- TAGA ERP — Migration 018: Role permissions update
-- ============================================
-- Apply via Supabase Studio SQL Editor
--
-- Cambios:
--   supervisor: aprobar/rechazar ofertas (no crear),
--               agregar/editar proveedores,
--               acceso total a operaciones y finanzas
--   commercial: SOLO ofertas (crear/enviar) y clientes,
--               productos solo lectura,
--               sin acceso a operaciones ni finanzas

-- ─── PRODUCTOS: solo admin puede escribir ───────────────
DROP POLICY IF EXISTS "productos_insert" ON productos;
CREATE POLICY "productos_insert" ON productos FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin'));

DROP POLICY IF EXISTS "productos_update" ON productos;
CREATE POLICY "productos_update" ON productos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ─── PROVEEDORES: supervisor puede insertar/editar ──────
DROP POLICY IF EXISTS "proveedores_insert" ON proveedores;
CREATE POLICY "proveedores_insert" ON proveedores FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'));

DROP POLICY IF EXISTS "proveedores_update" ON proveedores;
CREATE POLICY "proveedores_update" ON proveedores FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'));

-- ─── OFERTAS: commercial crea/envía, supervisor aprueba/rechaza ──
DROP POLICY IF EXISTS "ofertas_insert" ON ofertas;
CREATE POLICY "ofertas_insert" ON ofertas FOR INSERT TO authenticated
    WITH CHECK (
        fn_usuario_tiene_rol('admin')
        OR (fn_usuario_tiene_rol('commercial') AND comercial_id = auth.uid())
    );

DROP POLICY IF EXISTS "ofertas_update" ON ofertas;
CREATE POLICY "ofertas_update" ON ofertas FOR UPDATE TO authenticated
    USING (
        fn_usuario_tiene_rol('admin')
        OR (fn_usuario_tiene_rol('commercial') AND comercial_id = auth.uid())
        OR fn_usuario_tiene_rol('supervisor')
    )
    WITH CHECK (
        fn_usuario_tiene_rol('admin')
        OR (fn_usuario_tiene_rol('commercial') AND comercial_id = auth.uid())
        OR fn_usuario_tiene_rol('supervisor')
    );

-- Fichas de oferta
DROP POLICY IF EXISTS "fichas_insert" ON fichas_oferta;
CREATE POLICY "fichas_insert" ON fichas_oferta FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ofertas o
            WHERE o.id = fichas_oferta.oferta_id
            AND (
                fn_usuario_tiene_rol('admin')
                OR (fn_usuario_tiene_rol('commercial') AND o.comercial_id = auth.uid())
                OR fn_usuario_tiene_rol('supervisor')
            )
        )
    );

DROP POLICY IF EXISTS "fichas_update" ON fichas_oferta;
CREATE POLICY "fichas_update" ON fichas_oferta FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ofertas o
            WHERE o.id = fichas_oferta.oferta_id
            AND (
                fn_usuario_tiene_rol('admin')
                OR (fn_usuario_tiene_rol('commercial') AND o.comercial_id = auth.uid())
                OR fn_usuario_tiene_rol('supervisor')
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ofertas o
            WHERE o.id = fichas_oferta.oferta_id
            AND (
                fn_usuario_tiene_rol('admin')
                OR (fn_usuario_tiene_rol('commercial') AND o.comercial_id = auth.uid())
                OR fn_usuario_tiene_rol('supervisor')
            )
        )
    );

-- ─── CONTENEDORES: solo admin y supervisor ──────────────
DROP POLICY IF EXISTS "contenedores_insert" ON contenedores;
CREATE POLICY "contenedores_insert" ON contenedores FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'));

DROP POLICY IF EXISTS "contenedores_update" ON contenedores;
CREATE POLICY "contenedores_update" ON contenedores FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'));

-- ─── EMBARQUES: solo admin y supervisor ─────────────────
DROP POLICY IF EXISTS "embarques_insert" ON embarques;
CREATE POLICY "embarques_insert" ON embarques FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'));

DROP POLICY IF EXISTS "embarques_update" ON embarques;
CREATE POLICY "embarques_update" ON embarques FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'));

-- ─── IMPORTADORAS: solo admin y supervisor ──────────────
DROP POLICY IF EXISTS "importadoras_insert" ON importadoras;
CREATE POLICY "importadoras_insert" ON importadoras FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'));

DROP POLICY IF EXISTS "importadoras_update" ON importadoras;
CREATE POLICY "importadoras_update" ON importadoras FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'));

-- ─── FACTURAS: admin/finance/supervisor ─────────────────
DROP POLICY IF EXISTS "facturas_insert" ON facturas;
CREATE POLICY "facturas_insert" ON facturas FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'));

DROP POLICY IF EXISTS "facturas_update" ON facturas;
CREATE POLICY "facturas_update" ON facturas FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'));

-- ─── COBROS: admin/finance/supervisor ───────────────────
DROP POLICY IF EXISTS "cobros_insert" ON cobros;
CREATE POLICY "cobros_insert" ON cobros FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'));

DROP POLICY IF EXISTS "cobros_update" ON cobros;
CREATE POLICY "cobros_update" ON cobros FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'));

-- ─── PAGOS: admin/finance/supervisor ────────────────────
DROP POLICY IF EXISTS "pagos_insert" ON pagos;
CREATE POLICY "pagos_insert" ON pagos FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'));

DROP POLICY IF EXISTS "pagos_update" ON pagos;
CREATE POLICY "pagos_update" ON pagos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'));

-- ─── GASTOS: admin/finance/supervisor ───────────────────
DROP POLICY IF EXISTS "gastos_insert" ON gastos;
CREATE POLICY "gastos_insert" ON gastos FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'));

DROP POLICY IF EXISTS "gastos_update" ON gastos;
CREATE POLICY "gastos_update" ON gastos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('supervisor'));

-- ─── DOCUMENTOS: admin/commercial/supervisor ────────────
DROP POLICY IF EXISTS "documentos_insert" ON documentos;
CREATE POLICY "documentos_insert" ON documentos FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial') OR fn_usuario_tiene_rol('supervisor'));

DROP POLICY IF EXISTS "documentos_update" ON documentos;
CREATE POLICY "documentos_update" ON documentos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial') OR fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial') OR fn_usuario_tiene_rol('supervisor'));

-- ─── DIRECCIONES: solo admin y supervisor ───────────────
DROP POLICY IF EXISTS "direcciones_insert" ON direcciones_cliente;
CREATE POLICY "direcciones_insert" ON direcciones_cliente FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'));

DROP POLICY IF EXISTS "direcciones_update" ON direcciones_cliente;
CREATE POLICY "direcciones_update" ON direcciones_cliente FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'));

-- ─── EXPEDIENTES: solo admin y supervisor ───────────────
DROP POLICY IF EXISTS "expedientes_insert" ON expedientes;
CREATE POLICY "expedientes_insert" ON expedientes FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'));

DROP POLICY IF EXISTS "expedientes_update" ON expedientes;
CREATE POLICY "expedientes_update" ON expedientes FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('supervisor'));
