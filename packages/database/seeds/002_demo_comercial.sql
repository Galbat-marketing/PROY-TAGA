-- ============================================
-- TAGA ERP — Seed 002: Datos Comerciales Demo
-- Categorías, productos, proveedores y clientes
-- para entorno de demostración / desarrollo.
--
-- EJECUTAR EN: Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- 0. PAÍS: Cuba (si no existe)
-- ============================================
INSERT INTO paises (codigo, codigo_alpha3, nombre, nacionalidad) VALUES
    ('CU', 'CUB', 'Cuba', 'cubana')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- 1. CATEGORÍAS DE PRODUCTOS
-- ============================================
INSERT INTO categorias_productos (nombre, descripcion, activo, orden) VALUES
    ('Alimentos y Bebidas',     'Productos alimenticios, conservas, granos, bebidas y licores para importación', true, 1),
    ('Materias Primas',         'Insumos industriales, productos químicos, metales y minerales', true, 2),
    ('Maquinaria Industrial',   'Equipos, maquinaria pesada, herramientas y refacciones industriales', true, 3),
    ('Materiales Construcción', 'Cemento, acero, perfiles, tuberías y acabados para la construcción', true, 4),
    ('Productos Médicos',       'Equipos médicos, fármacos, insumos hospitalarios y material quirúrgico', true, 5),
    ('Tecnología',              'Equipos de cómputo, telecomunicaciones y electrónica de consumo', true, 6),
    ('Textiles y Calzado',      'Telas, uniformes, calzado industrial y accesorios textiles', true, 7),
    ('Vehículos y Partes',      'Vehículos comerciales, autopartes, lubricantes y accesorios automotrices', true, 8)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. PRODUCTOS
-- ============================================
-- Nota: categoria_id se resuelve por nombre.
-- pais_origen usa el código de 2 letras (CN, MX, ES, etc.)

DO $$
DECLARE
    cat_alimentos    UUID; cat_materias   UUID; cat_maquinaria UUID;
    cat_construccion UUID; cat_medicos    UUID; cat_tecno      UUID;
    cat_textiles     UUID; cat_vehiculos  UUID;
BEGIN
    SELECT id INTO cat_alimentos    FROM categorias_productos WHERE nombre = 'Alimentos y Bebidas';
    SELECT id INTO cat_materias     FROM categorias_productos WHERE nombre = 'Materias Primas';
    SELECT id INTO cat_maquinaria   FROM categorias_productos WHERE nombre = 'Maquinaria Industrial';
    SELECT id INTO cat_construccion FROM categorias_productos WHERE nombre = 'Materiales Construcción';
    SELECT id INTO cat_medicos      FROM categorias_productos WHERE nombre = 'Productos Médicos';
    SELECT id INTO cat_tecno        FROM categorias_productos WHERE nombre = 'Tecnología';
    SELECT id INTO cat_textiles     FROM categorias_productos WHERE nombre = 'Textiles y Calzado';
    SELECT id INTO cat_vehiculos    FROM categorias_productos WHERE nombre = 'Vehículos y Partes';

    -- ============================================
    -- ALIMENTOS Y BEBIDAS
    -- ============================================
    INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, precio_base, moneda, pais_origen, peso_kg, volumen_m3, activo) VALUES
        ('ALI-001', 'Arroz blanco extra largo', 'Arroz blanco de grano largo, bolsa 50 kg, origen Vietnam', cat_alimentos, 'kg', 38.50, 'USD', 'VN', 50.000, 0.120, true),
        ('ALI-002', 'Frijol negro selecto', 'Frijol negro nicaragüense, saco 45 kg, clasificado', cat_alimentos, 'kg', 42.00, 'USD', 'NI', 45.000, 0.100, true),
        ('ALI-003', 'Aceite de soya refinado', 'Aceite vegetal de soya, bidón 20 L, marca Fortune', cat_alimentos, 'l', 24.80, 'USD', 'AR', 18.400, 0.040, true),
        ('ALI-004', 'Leche en polvo entera', 'Leche en polvo entera instantánea, saco 25 kg, Nueva Zelanda', cat_alimentos, 'kg', 85.00, 'USD', 'NL', 25.000, 0.080, true),
        ('ALI-005', 'Harina de trigo panadera', 'Harina de trigo fortificada, saco 50 kg, grado A', cat_alimentos, 'kg', 32.00, 'USD', 'CA', 50.000, 0.110, true),
        ('ALI-006', 'Pollo congelado entero', 'Pollo entero congelado IQF, caja 20 kg', cat_alimentos, 'kg', 3.20, 'USD', 'BR', 20.000, 0.070, true),
        ('ALI-007', 'Maíz amarillo duro', 'Maíz amarillo duro para consumo animal, tonelada', cat_alimentos, 'ton', 245.00, 'USD', 'AR', 1000.000, 1.500, true),
        ('ALI-008', 'Salsa de tomate industrial', 'Salsa de tomate concentrado, lata 3 kg, Pack 6 unid', cat_alimentos, 'kg', 4.50, 'USD', 'IT', 18.000, 0.030, true);

    -- ============================================
    -- MATERIAS PRIMAS
    -- ============================================
    INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, precio_base, moneda, pais_origen, peso_kg, volumen_m3, activo) VALUES
        ('MAT-001', 'Cloruro de polivinilo (PVC)', 'Resina de PVC grado industrial, saco 25 kg', cat_materias, 'kg', 1.85, 'USD', 'CN', 25.000, 0.060, true),
        ('MAT-002', 'Sulfato de cobre pentahidratado', 'Sulfato de cobre 99% pureza, saco 25 kg, uso agrícola', cat_materias, 'kg', 3.20, 'USD', 'CL', 25.000, 0.050, true),
        ('MAT-003', 'Bobina de acero laminado', 'Bobina de acero laminado en caliente, 2 mm espesor, tonelada', cat_materias, 'ton', 680.00, 'USD', 'CN', 1000.000, 0.250, true),
        ('MAT-004', 'Ácido sulfúrico 98%', 'Ácido sulfúrico grado industrial, tambor 200 L', cat_materias, 'l', 0.95, 'USD', 'MX', 360.000, 0.220, true),
        ('MAT-005', 'Aluminio primario en lingotes', 'Lingotes de aluminio 99.7% pureza, 25 kg c/u, lote 1000 kg', cat_materias, 'ton', 2450.00, 'USD', 'CA', 1000.000, 0.450, true);

    -- ============================================
    -- MAQUINARIA INDUSTRIAL
    -- ============================================
    INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, precio_base, moneda, pais_origen, peso_kg, volumen_m3, activo) VALUES
        ('MAQ-001', 'Generador eléctrico diésel 150 kVA', 'Generador diésel trifásico 150 kVA, arranque eléctrico, panel de control', cat_maquinaria, 'pza', 18500.00, 'USD', 'CN', 1850.000, 8.500, true),
        ('MAQ-002', 'Bomba centrífuga 5 HP', 'Bomba centrífuga horizontal 5 HP, 220V, hierro fundido', cat_maquinaria, 'pza', 1280.00, 'USD', 'MX', 85.000, 0.350, true),
        ('MAQ-003', 'Compresor de aire 200 L', 'Compresor de aire de pistón 200 L, 7.5 HP, 220V trifásico', cat_maquinaria, 'pza', 2450.00, 'USD', 'IT', 210.000, 0.800, true),
        ('MAQ-004', 'Motor eléctrico 20 HP', 'Motor eléctrico trifásico 20 HP, 1800 RPM, carcasa de hierro', cat_maquinaria, 'pza', 3200.00, 'USD', 'CN', 175.000, 0.550, true),
        ('MAQ-005', 'Válvula de compuerta 6"', 'Válvula de compuerta bridada 6 pulgadas, acero al carbón, clase 150', cat_maquinaria, 'pza', 420.00, 'USD', 'DE', 35.000, 0.080, true);

    -- ============================================
    -- MATERIALES CONSTRUCCIÓN
    -- ============================================
    INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, precio_base, moneda, pais_origen, peso_kg, volumen_m3, activo) VALUES
        ('CON-001', 'Cemento Portland P-350', 'Cemento gris Portland P-350, saco 42.5 kg', cat_construccion, 'kg', 0.18, 'USD', 'MX', 42.500, 0.035, true),
        ('CON-002', 'Varilla corrugada 3/8"', 'Varilla de acero corrugada diámetro 3/8", grado 40, quintal', cat_construccion, 'kg', 1.35, 'USD', 'CN', 45.360, 0.008, true),
        ('CON-003', 'Perfil estructural H 100x100', 'Viga de acero estructural H 100x100 mm, 6 metros, acero A36', cat_construccion, 'ton', 1250.00, 'USD', 'CN', 1000.000, 0.500, true),
        ('CON-004', 'Tubería PVC 4" presión', 'Tubo PVC pared gruesa 4 pulgadas, clase 7, 6 metros', cat_construccion, 'pza', 28.00, 'USD', 'MX', 8.500, 0.050, true),
        ('CON-005', 'Pintura vinílica blanca', 'Pintura vinílica interior/exterior, cubeta 4 galones (18 L)', cat_construccion, 'l', 3.80, 'USD', 'ES', 18.000, 0.020, true);

    -- ============================================
    -- PRODUCTOS MÉDICOS
    -- ============================================
    INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, precio_base, moneda, pais_origen, peso_kg, volumen_m3, activo) VALUES
        ('MED-001', 'Jeringa estéril 5 mL', 'Jeringa hipodérmica estéril 5 mL, con aguja, caja 100 unid', cat_medicos, 'pza', 0.25, 'USD', 'CN', 0.150, 0.001, true),
        ('MED-002', 'Guantes quirúrgicos talla M', 'Guantes de látex quirúrgicos estériles, talla M, par, caja 50 pares', cat_medicos, 'par', 1.20, 'USD', 'MY', 0.080, 0.001, true),
        ('MED-003', 'Paracetamol 500 mg', 'Paracetamol tabletas 500 mg, frasco 100 tabletas', cat_medicos, 'pza', 0.08, 'USD', 'IN', 0.100, 0.001, true),
        ('MED-004', 'Vendas elásticas 4"', 'Venda elástica 4 pulgadas x 5 yardas, algodón, caja 12 unid', cat_medicos, 'pza', 2.50, 'USD', 'CN', 0.500, 0.003, true),
        ('MED-005', 'Mascarilla quirúrgica N95', 'Mascarilla desechable N95, caja 20 unidades, certificada FDA', cat_medicos, 'pza', 1.80, 'USD', 'CN', 0.200, 0.001, true);

    -- ============================================
    -- TECNOLOGÍA
    -- ============================================
    INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, precio_base, moneda, pais_origen, peso_kg, volumen_m3, activo) VALUES
        ('TEC-001', 'Laptop empresarial 14"', 'Laptop i5 16GB RAM 512GB SSD, pantalla 14" FHD, Windows 11 Pro', cat_tecno, 'pza', 895.00, 'USD', 'CN', 1.800, 0.008, true),
        ('TEC-002', 'Monitor LED 24"', 'Monitor LED 24 pulgadas Full HD, HDMI/VGA, 75 Hz', cat_tecno, 'pza', 185.00, 'USD', 'CN', 3.500, 0.032, true),
        ('TEC-003', 'Switch de red 24 puertos', 'Switch Gigabit 24 puertos, gestionable, rackeable 1U', cat_tecno, 'pza', 420.00, 'USD', 'TW', 2.800, 0.015, true),
        ('TEC-004', 'UPS 1500 VA', 'UPS 1500 VA 900W, torre, 8 tomas, respaldo 15 min', cat_tecno, 'pza', 280.00, 'USD', 'CN', 12.500, 0.030, true),
        ('TEC-005', 'Impresora multifuncional', 'Impresora láser multifuncional, impresión/escaneo/copia, red WiFi', cat_tecno, 'pza', 350.00, 'USD', 'JP', 10.200, 0.045, true);

    -- ============================================
    -- TEXTILES Y CALZADO
    -- ============================================
    INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, precio_base, moneda, pais_origen, peso_kg, volumen_m3, activo) VALUES
        ('TEX-001', 'Tela poliéster lisa', 'Tela 100% poliéster, ancho 1.50 m, color blanco, metro lineal', cat_textiles, 'm', 2.80, 'USD', 'CN', 0.250, 0.001, true),
        ('TEX-002', 'Uniforme industrial completo', 'Uniforme completo chaqueta + pantalón, mezclilla, c/cierre', cat_textiles, 'pza', 18.50, 'USD', 'VN', 1.200, 0.008, true),
        ('TEX-003', 'Botas de seguridad punta acero', 'Botas de cuero con punta de acero, suela antideslizante, tallas 38-44', cat_textiles, 'par', 35.00, 'USD', 'BR', 1.800, 0.007, true),
        ('TEX-004', 'Sábana hospitalaria 1.90 m', 'Sábana plana 100% algodón, 1.90 x 2.70 m, blanca, empaque 10 unid', cat_textiles, 'pza', 8.50, 'USD', 'PK', 0.500, 0.004, true),
        ('TEX-005', 'Toalla de baño 70x140', 'Toalla de algodón 500 g/m², 70x140 cm, juego 6 colores', cat_textiles, 'pza', 6.20, 'USD', 'TR', 0.400, 0.003, true);

    -- ============================================
    -- VEHÍCULOS Y PARTES
    -- ============================================
    INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_medida, precio_base, moneda, pais_origen, peso_kg, volumen_m3, activo) VALUES
        ('VEH-001', 'Camión de carga 5 ton', 'Camión de carga mediana 5 toneladas, diésel, cabina simple, fleje', cat_vehiculos, 'pza', 48500.00, 'USD', 'CN', 4500.000, 18.000, true),
        ('VEH-002', 'Batería automotriz 12V', 'Batería de plomo-ácido 12V 70Ah, libre de mantenimiento', cat_vehiculos, 'pza', 95.00, 'USD', 'MX', 18.500, 0.030, true),
        ('VEH-003', 'Neumático 7.50R16', 'Neumático radial 7.50R16 para camión ligero, 8 capas, carga E', cat_vehiculos, 'pza', 145.00, 'USD', 'KR', 28.000, 0.080, true),
        ('VEH-004', 'Aceite motor 15W40', 'Aceite lubricante multigrado 15W40, API CI-4, tambor 55 galones', cat_vehiculos, 'l', 3.20, 'USD', 'US', 190.000, 0.220, true),
        ('VEH-005', 'Filtro de aire caja', 'Filtro de aire para camión Hino/Isuzu, elemento primario + secundario', cat_vehiculos, 'pza', 22.00, 'USD', 'JP', 1.500, 0.010, true);
END $$;

-- ============================================
-- 3. PROVEEDORES
-- ============================================
INSERT INTO proveedores (codigo, nombre, rfc, email, telefono, pais, moneda_default, condiciones_pago, tipo_proveedor, rating, activo) VALUES
    ('PROV-001', 'China National Machinery Corp', NULL, 'export@cnmc.cn', '+86 10 8888 7777', 'CN', 'USD', '30 días', 'Fabricante', 5, true),
    ('PROV-002', 'Grupo Bimbo SAB de CV', 'BIM-850101-ABC', 'exportaciones@grupobimbo.com', '+52 55 5279 6000', 'MX', 'MXN', '60 días', 'Fabricante', 5, true),
    ('PROV-003', 'Arcor SAIC', NULL, 'intl@arcor.com', '+54 351 577 7777', 'AR', 'USD', '60 días', 'Fabricante', 4, true),
    ('PROV-004', 'Tecnología Avanzada HK Ltd', NULL, 'sales@techhk.com.hk', '+852 2888 1234', 'HK', 'USD', '30 días', 'Distribuidor', 4, true),
    ('PROV-005', 'EuroParts GmbH', NULL, 'info@europarts.de', '+49 30 6123 4567', 'DE', 'EUR', '45 días', 'Fabricante', 5, true),
    ('PROV-006', 'BRF Foods SA', 'BRF-123456-789', 'export@brf-br.com', '+55 11 3984 8000', 'BR', 'USD', '30 días', 'Fabricante', 4, true),
    ('PROV-007', 'Tubacero Internacional', 'TUB-890101-ABC', 'ventas@tubacero.com', '+52 81 8329 1000', 'MX', 'USD', '60 días', 'Fabricante', 4, true),
    ('PROV-008', 'Industrias Textiles Valencia SL', NULL, 'export@itexvalencia.es', '+34 96 345 6789', 'ES', 'EUR', '45 días', 'Fabricante', 3, true);

-- ============================================
-- 4. CLIENTES (opcional — empresas cubanas)
-- ============================================
INSERT INTO clientes (codigo, tipo_persona, nombre, rfc, email, telefono, pais, moneda_default, limite_credito, condiciones_pago, industria, rating, activo) VALUES
    ('CAR-001', 'moral', 'Empresa Comercializadora Caribe SA', 'CAR-123456-789', 'compras@caribe.cu', '+53 7 868 1234', 'CU', 'USD', 500000.00, '60 días', 'Alimentos', 5, true),
    ('IMP-002', 'moral', 'Importadora Taino SRL', 'IMP-234567-890', 'info@tainoimp.cu', '+53 7 204 5678', 'CU', 'USD', 350000.00, '45 días', 'Industrial', 4, true),
    ('CUB-003', 'moral', 'Cubana de Construcciones SA', 'CUB-345678-901', 'adquisiciones@cubcons.cu', '+53 7 870 9012', 'CU', 'USD', 750000.00, '60 días', 'Construcción', 5, true),
    ('HAB-004', 'moral', 'Habana Medical Supply SRL', 'HAB-456789-012', 'ops@habmed.cu', '+53 7 206 3456', 'CU', 'EUR', 200000.00, '30 días', 'Salud', 4, true),
    ('TEC-005', 'moral', 'Tecnoimportadora del Caribe SA', 'TEC-567890-123', 'compras@tecnoimport.cu', '+53 7 864 7890', 'CU', 'USD', 450000.00, '45 días', 'Tecnología', 4, true);
