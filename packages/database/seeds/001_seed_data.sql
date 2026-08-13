-- ============================================
-- TAGA ERP — Seed Data
-- ============================================

-- ============================================
-- 1. ROLES
-- ============================================
INSERT INTO roles (nombre, descripcion, jerarquia) VALUES
    ('admin', 'Acceso total al sistema', 100),
    ('supervisor', 'Supervisa equipo comercial', 80),
    ('commercial', 'Comercial / vendedor', 60),
    ('finance', 'Acceso a módulos financieros', 60),
    ('viewer', 'Solo lectura', 40)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- 2. PERMISOS
-- ============================================
INSERT INTO permisos (codigo, nombre, modulo, accion) VALUES
    -- Dashboard
    ('dashboard:read', 'Ver dashboard ejecutivo', 'dashboard', 'read'),

    -- Productos
    ('productos:read', 'Ver productos', 'productos', 'read'),
    ('productos:write', 'Crear/editar productos', 'productos', 'write'),
    ('productos:delete', 'Eliminar productos', 'productos', 'delete'),

    -- Categorías
    ('categorias:read', 'Ver categorías', 'categorias', 'read'),
    ('categorias:write', 'Crear/editar categorías', 'categorias', 'write'),

    -- Clientes
    ('clientes:read', 'Ver clientes', 'clientes', 'read'),
    ('clientes:write', 'Crear/editar clientes', 'clientes', 'write'),
    ('clientes:delete', 'Eliminar clientes', 'clientes', 'delete'),

    -- Proveedores
    ('proveedores:read', 'Ver proveedores', 'proveedores', 'read'),
    ('proveedores:write', 'Crear/editar proveedores', 'proveedores', 'write'),

    -- Ofertas
    ('ofertas:read', 'Ver ofertas', 'ofertas', 'read'),
    ('ofertas:write', 'Crear/editar ofertas', 'ofertas', 'write'),
    ('ofertas:delete', 'Eliminar ofertas', 'ofertas', 'delete'),
    ('ofertas:approve', 'Aprobar ofertas', 'ofertas', 'approve'),

    -- Contenedores
    ('contenedores:read', 'Ver contenedores', 'contenedores', 'read'),
    ('contenedores:write', 'Crear/editar contenedores', 'contenedores', 'write'),

    -- Embarques
    ('embarques:read', 'Ver embarques', 'embarques', 'read'),
    ('embarques:write', 'Registrar eventos de embarque', 'embarques', 'write'),

    -- Importadoras
    ('importadoras:read', 'Ver importadoras', 'importadoras', 'read'),
    ('importadoras:write', 'Crear/editar importadoras', 'importadoras', 'write'),

    -- Facturas
    ('facturas:read', 'Ver facturas', 'facturas', 'read'),
    ('facturas:write', 'Crear/editar facturas', 'facturas', 'write'),
    ('facturas:cancel', 'Cancelar facturas', 'facturas', 'delete'),

    -- Cobros
    ('cobros:read', 'Ver cobros', 'cobros', 'read'),
    ('cobros:write', 'Registrar cobros', 'cobros', 'write'),

    -- Pagos
    ('pagos:read', 'Ver pagos', 'pagos', 'read'),
    ('pagos:write', 'Registrar pagos', 'pagos', 'write'),

    -- Gastos
    ('gastos:read', 'Ver gastos', 'gastos', 'read'),
    ('gastos:write', 'Registrar gastos', 'gastos', 'write'),

    -- Expedientes
    ('expedientes:read', 'Ver expedientes', 'expedientes', 'read'),
    ('expedientes:write', 'Crear/editar expedientes', 'expedientes', 'write'),

    -- Documentos
    ('documentos:read', 'Ver documentos', 'documentos', 'read'),
    ('documentos:write', 'Subir/editar documentos', 'documentos', 'write'),
    ('documentos:delete', 'Eliminar documentos', 'documentos', 'delete'),

    -- Reportes
    ('reportes:read', 'Ver reportes', 'reportes', 'read'),
    ('reportes:export', 'Exportar reportes', 'reportes', 'write'),

    -- Configuración
    ('config:read', 'Ver configuración', 'configuracion', 'read'),
    ('config:write', 'Editar configuración', 'configuracion', 'write'),

    -- Usuarios
    ('usuarios:read', 'Ver usuarios', 'usuarios', 'read'),
    ('usuarios:write', 'Crear/editar usuarios', 'usuarios', 'write'),
    ('usuarios:delete', 'Eliminar usuarios', 'usuarios', 'delete'),

    -- Roles
    ('roles:read', 'Ver roles', 'roles', 'read'),
    ('roles:write', 'Crear/editar roles', 'roles', 'write'),

    -- Auditoría
    ('auditoria:read', 'Ver logs de auditoría', 'auditoria', 'read')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- 3. ASIGNAR PERMISOS A ROLES
-- ============================================

-- Admin: todos los permisos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'admin'
ON CONFLICT DO NOTHING;

-- Commercial: permisos operativos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'commercial'
AND p.codigo IN (
    'dashboard:read',
    'productos:read', 'productos:write',
    'categorias:read', 'categorias:write',
    'clientes:read', 'clientes:write',
    'ofertas:read', 'ofertas:write',
    'contenedores:read', 'contenedores:write',
    'embarques:read', 'embarques:write',
    'importadoras:read',
    'expedientes:read', 'expedientes:write',
    'documentos:read', 'documentos:write',
    'facturas:read',
    'cobros:read',
    'reportes:read'
)
ON CONFLICT DO NOTHING;

-- Supervisor: commercial + aprobación + equipo
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'supervisor'
AND p.codigo IN (
    'dashboard:read',
    'productos:read', 'productos:write',
    'categorias:read',
    'clientes:read', 'clientes:write',
    'proveedores:read',
    'ofertas:read', 'ofertas:write', 'ofertas:approve',
    'contenedores:read', 'contenedores:write',
    'embarques:read', 'embarques:write',
    'importadoras:read',
    'facturas:read',
    'cobros:read',
    'expedientes:read', 'expedientes:write',
    'documentos:read', 'documentos:write',
    'reportes:read', 'reportes:export',
    'usuarios:read'
)
ON CONFLICT DO NOTHING;

-- Finance: permisos financieros
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'finance'
AND p.codigo IN (
    'dashboard:read',
    'productos:read',
    'clientes:read',
    'proveedores:read',
    'ofertas:read',
    'facturas:read', 'facturas:write', 'facturas:cancel',
    'cobros:read', 'cobros:write',
    'pagos:read', 'pagos:write',
    'gastos:read', 'gastos:write',
    'contenedores:read',
    'documentos:read',
    'reportes:read', 'reportes:export'
)
ON CONFLICT DO NOTHING;

-- Viewer: solo lectura
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'viewer'
AND p.accion = 'read'
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. USUARIO ADMIN POR DEFECTO
-- ============================================
-- Nota: El usuario debe crearse primero en Supabase Auth (auth.users)
-- Luego se inserta en usuarios locales y se asigna rol admin.
-- Este es un placeholder que se ejecuta tras crear el usuario en Auth.

-- Para entorno de desarrollo, insertar manualmente:
-- 1. Crear usuario en Supabase Auth dashboard
-- 2. INSERT INTO usuarios (id, email, nombre, apellido) VALUES ('auth_user_id', 'admin@taga.app', 'Admin', 'TAGA');
-- 3. INSERT INTO roles_usuarios (usuario_id, rol_id) VALUES ('auth_user_id', (SELECT id FROM roles WHERE nombre = 'admin'));
