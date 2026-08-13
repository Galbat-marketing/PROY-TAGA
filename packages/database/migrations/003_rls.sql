-- ============================================
-- TAGA ERP — Migration 003: Row Level Security
-- ============================================

-- Enable RLS on all tables
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE precios_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE direcciones_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE importadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE comerciales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ofertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_oferta ENABLE ROW LEVEL SECURITY;
ALTER TABLE contenedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE embarques ENABLE ROW LEVEL SECURITY;
ALTER TABLE oferta_embarque ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobros ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE versiones_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper function to check user role
-- ============================================
CREATE OR REPLACE FUNCTION fn_usuario_tiene_rol(rol_nombre VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM roles_usuarios ru
        JOIN roles r ON r.id = ru.rol_id
        WHERE ru.usuario_id = auth.uid()
        AND r.nombre = rol_nombre
        AND r.deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Admin: acceso total a todas las tablas
-- ============================================
CREATE POLICY "admin_all_usuarios" ON usuarios FOR ALL TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

CREATE POLICY "admin_all_roles" ON roles FOR ALL TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

CREATE POLICY "admin_all_roles_usuarios" ON roles_usuarios FOR ALL TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

CREATE POLICY "admin_all_permisos" ON permisos FOR ALL TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

CREATE POLICY "admin_all_roles_permisos" ON roles_permisos FOR ALL TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- PRODUCTOS: lectura todos, escritura admin/commercial
-- ============================================
CREATE POLICY "productos_select" ON productos FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "productos_insert" ON productos FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "productos_update" ON productos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "productos_delete" ON productos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- Mismas policies para categorias_productos
CREATE POLICY "categorias_select" ON categorias_productos FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "categorias_insert" ON categorias_productos FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "categorias_update" ON categorias_productos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "categorias_delete" ON categorias_productos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- CLIENTES: todos leen, admin/commercial escriben
-- ============================================
CREATE POLICY "clientes_select" ON clientes FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "clientes_insert" ON clientes FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial') OR fn_usuario_tiene_rol('supervisor'));

CREATE POLICY "clientes_update" ON clientes FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial') or fn_usuario_tiene_rol('supervisor'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial') OR fn_usuario_tiene_rol('supervisor'));

CREATE POLICY "clientes_delete" ON clientes FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- Direcciones y contactos heredan de clientes
CREATE POLICY "direcciones_select" ON direcciones_cliente FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "direcciones_insert" ON direcciones_cliente FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "direcciones_update" ON direcciones_cliente FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "direcciones_delete" ON direcciones_cliente FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- PROVEEDORES: todos leen, admin/finance escriben
-- ============================================
CREATE POLICY "proveedores_select" ON proveedores FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "proveedores_insert" ON proveedores FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'));

CREATE POLICY "proveedores_update" ON proveedores FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'));

CREATE POLICY "proveedores_delete" ON proveedores FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- OFERTAS: comerciales ven las suyas, admin todas, supervisors ven su equipo
-- ============================================
CREATE POLICY "ofertas_select_admin" ON ofertas FOR SELECT TO authenticated
    USING (
        (fn_usuario_tiene_rol('admin'))
        OR (fn_usuario_tiene_rol('commercial') AND comercial_id = auth.uid())
        OR (fn_usuario_tiene_rol('supervisor') AND EXISTS (
            SELECT 1 FROM comerciales c
            WHERE c.usuario_id = auth.uid()
            AND (c.supervisor_id = auth.uid() OR c.usuario_id = auth.uid())
        ))
        OR (fn_usuario_tiene_rol('finance') OR fn_usuario_tiene_rol('viewer'))
        AND deleted_at IS NULL
    );

CREATE POLICY "ofertas_insert" ON ofertas FOR INSERT TO authenticated
    WITH CHECK (
        fn_usuario_tiene_rol('admin')
        OR (fn_usuario_tiene_rol('commercial') AND comercial_id = auth.uid())
    );

CREATE POLICY "ofertas_update" ON ofertas FOR UPDATE TO authenticated
    USING (
        fn_usuario_tiene_rol('admin')
        OR (fn_usuario_tiene_rol('commercial') AND comercial_id = auth.uid())
    )
    WITH CHECK (
        fn_usuario_tiene_rol('admin')
        OR (fn_usuario_tiene_rol('commercial') AND comercial_id = auth.uid())
    );

CREATE POLICY "ofertas_delete" ON ofertas FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- Fichas de oferta heredan permisos via oferta
CREATE POLICY "fichas_select" ON fichas_oferta FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM ofertas o
            WHERE o.id = fichas_oferta.oferta_id
            AND (
                fn_usuario_tiene_rol('admin')
                OR (fn_usuario_tiene_rol('commercial') AND o.comercial_id = auth.uid())
                OR fn_usuario_tiene_rol('finance')
                OR fn_usuario_tiene_rol('viewer')
            )
        )
    );

CREATE POLICY "fichas_insert" ON fichas_oferta FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ofertas o
            WHERE o.id = fichas_oferta.oferta_id
            AND (
                fn_usuario_tiene_rol('admin')
                OR (fn_usuario_tiene_rol('commercial') AND o.comercial_id = auth.uid())
            )
        )
    );

CREATE POLICY "fichas_update" ON fichas_oferta FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ofertas o
            WHERE o.id = fichas_oferta.oferta_id
            AND (
                fn_usuario_tiene_rol('admin')
                OR (fn_usuario_tiene_rol('commercial') AND o.comercial_id = auth.uid())
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
            )
        )
    );

CREATE POLICY "fichas_delete" ON fichas_oferta FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ofertas o
            WHERE o.id = fichas_oferta.oferta_id
            AND fn_usuario_tiene_rol('admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ofertas o
            WHERE o.id = fichas_oferta.oferta_id
            AND fn_usuario_tiene_rol('admin')
        )
    );

-- ============================================
-- FACTURAS: admin/finance control total, otros solo lectura
-- ============================================
CREATE POLICY "facturas_select" ON facturas FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "facturas_insert" ON facturas FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'));

CREATE POLICY "facturas_update" ON facturas FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'));

CREATE POLICY "facturas_delete" ON facturas FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- COBROS: admin/finance control total
-- ============================================
CREATE POLICY "cobros_select" ON cobros FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "cobros_insert" ON cobros FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'));

CREATE POLICY "cobros_update" ON cobros FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'));

CREATE POLICY "cobros_delete" ON cobros FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- PAGOS: admin/finance control total
-- ============================================
CREATE POLICY "pagos_select" ON pagos FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "pagos_insert" ON pagos FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'));

CREATE POLICY "pagos_update" ON pagos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'));

CREATE POLICY "pagos_delete" ON pagos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- GASTOS: admin/finance control total
-- ============================================
CREATE POLICY "gastos_select" ON gastos FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "gastos_insert" ON gastos FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'));

CREATE POLICY "gastos_update" ON gastos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('finance'));

CREATE POLICY "gastos_delete" ON gastos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- CONTENEDORES Y EMBARQUES: todos leen, admin/comerciales escriben
-- ============================================
CREATE POLICY "contenedores_select" ON contenedores FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "contenedores_insert" ON contenedores FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "contenedores_update" ON contenedores FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "contenedores_delete" ON contenedores FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- Embarques
CREATE POLICY "embarques_select" ON embarques FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "embarques_insert" ON embarques FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "embarques_update" ON embarques FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "embarques_delete" ON embarques FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- IMPORTADORAS: todos leen, admin escribe
-- ============================================
CREATE POLICY "importadoras_select" ON importadoras FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "importadoras_insert" ON importadoras FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin'));

CREATE POLICY "importadoras_update" ON importadoras FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

CREATE POLICY "importadoras_delete" ON importadoras FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- EXPEDIENTES: todos leen, admin escribe
-- ============================================
CREATE POLICY "expedientes_select" ON expedientes FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "expedientes_insert" ON expedientes FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "expedientes_update" ON expedientes FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "expedientes_delete" ON expedientes FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- DOCUMENTOS: todos leen, admin/commercial escriben
-- ============================================
CREATE POLICY "documentos_select" ON documentos FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "documentos_insert" ON documentos FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "documentos_update" ON documentos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'))
    WITH CHECK (fn_usuario_tiene_rol('admin') OR fn_usuario_tiene_rol('commercial'));

CREATE POLICY "documentos_delete" ON documentos FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- ============================================
-- NOTIFICACIONES: solo el usuario dueño
-- ============================================
CREATE POLICY "notificaciones_select" ON notificaciones FOR SELECT TO authenticated
    USING (usuario_id = auth.uid());

CREATE POLICY "notificaciones_update" ON notificaciones FOR UPDATE TO authenticated
    USING (usuario_id = auth.uid())
    WITH CHECK (usuario_id = auth.uid());

-- ============================================
-- AUDITORÍA: solo admin
-- ============================================
CREATE POLICY "auditoria_select" ON auditoria_log FOR SELECT TO authenticated
    USING (fn_usuario_tiene_rol('admin'));

CREATE POLICY "actividad_select" ON actividad_usuarios FOR SELECT TO authenticated
    USING (fn_usuario_tiene_rol('admin') OR usuario_id = auth.uid());

CREATE POLICY "actividad_insert" ON actividad_usuarios FOR INSERT TO authenticated
    WITH CHECK (usuario_id = auth.uid());
