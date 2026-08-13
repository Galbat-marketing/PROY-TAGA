-- ============================================
-- TAGA ERP — Migration 009: Codificadores
-- ============================================

CREATE TABLE monedas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(3) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    simbolo VARCHAR(10),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE unidades_medida (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(30) NOT NULL DEFAULT 'unidad',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE paises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(3) UNIQUE NOT NULL,
    codigo_alpha3 VARCHAR(3),
    nombre VARCHAR(150) NOT NULL,
    nacionalidad VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_monedas_activo ON monedas(activo);
CREATE INDEX idx_unidades_medida_activo ON unidades_medida(activo);
CREATE INDEX idx_unidades_medida_categoria ON unidades_medida(categoria);
CREATE INDEX idx_paises_activo ON paises(activo);

ALTER TABLE monedas ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_medida ENABLE ROW LEVEL SECURITY;
ALTER TABLE paises ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer
CREATE POLICY "monedas_select" ON monedas FOR SELECT TO authenticated
    USING (deleted_at IS NULL);
CREATE POLICY "unidades_medida_select" ON unidades_medida FOR SELECT TO authenticated
    USING (deleted_at IS NULL);
CREATE POLICY "paises_select" ON paises FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

-- Solo admin puede escribir
CREATE POLICY "monedas_insert" ON monedas FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin'));
CREATE POLICY "monedas_update" ON monedas FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));
CREATE POLICY "monedas_delete" ON monedas FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

CREATE POLICY "unidades_medida_insert" ON unidades_medida FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin'));
CREATE POLICY "unidades_medida_update" ON unidades_medida FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));
CREATE POLICY "unidades_medida_delete" ON unidades_medida FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

CREATE POLICY "paises_insert" ON paises FOR INSERT TO authenticated
    WITH CHECK (fn_usuario_tiene_rol('admin'));
CREATE POLICY "paises_update" ON paises FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));
CREATE POLICY "paises_delete" ON paises FOR UPDATE TO authenticated
    USING (fn_usuario_tiene_rol('admin'))
    WITH CHECK (fn_usuario_tiene_rol('admin'));

-- Seed data
INSERT INTO monedas (codigo, nombre, simbolo) VALUES
    ('USD', 'Dólar estadounidense', '$'),
    ('MXN', 'Peso mexicano', '$'),
    ('EUR', 'Euro', '€'),
    ('CNY', 'Yuan chino', '¥'),
    ('JPY', 'Yen japonés', '¥'),
    ('CAD', 'Dólar canadiense', 'C$');

INSERT INTO unidades_medida (codigo, nombre, categoria) VALUES
    ('kg', 'Kilogramo', 'peso'),
    ('lb', 'Libra', 'peso'),
    ('ton', 'Tonelada', 'peso'),
    ('g', 'Gramo', 'peso'),
    ('m3', 'Metro cúbico', 'volumen'),
    ('l', 'Litro', 'volumen'),
    ('pza', 'Pieza', 'unidad'),
    ('caja', 'Caja', 'unidad'),
    ('par', 'Par', 'unidad'),
    ('m', 'Metro', 'longitud');

INSERT INTO paises (codigo, codigo_alpha3, nombre, nacionalidad) VALUES
    ('MX', 'MEX', 'México', 'mexicana'),
    ('US', 'USA', 'Estados Unidos', 'estadounidense'),
    ('CN', 'CHN', 'China', 'china'),
    ('JP', 'JPN', 'Japón', 'japonesa'),
    ('DE', 'DEU', 'Alemania', 'alemana'),
    ('CA', 'CAN', 'Canadá', 'canadiense'),
    ('BR', 'BRA', 'Brasil', 'brasileña'),
    ('IN', 'IND', 'India', 'india'),
    ('KR', 'KOR', 'Corea del Sur', 'surcoreana'),
    ('GB', 'GBR', 'Reino Unido', 'británica'),
    ('FR', 'FRA', 'Francia', 'francesa'),
    ('IT', 'ITA', 'Italia', 'italiana'),
    ('ES', 'ESP', 'España', 'española'),
    ('AR', 'ARG', 'Argentina', 'argentina'),
    ('CO', 'COL', 'Colombia', 'colombiana'),
    ('CL', 'CHL', 'Chile', 'chilena'),
    ('PE', 'PER', 'Perú', 'peruana'),
    ('NL', 'NLD', 'Países Bajos', 'neerlandesa'),
    ('NL', 'NLD', 'Países Bajos', 'neerlandesa');
