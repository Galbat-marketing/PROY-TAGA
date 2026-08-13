-- Add proveedor_id to fichas_oferta (which supplier provides this product)
ALTER TABLE fichas_oferta ADD COLUMN proveedor_id UUID REFERENCES proveedores(id);

-- Add porcentaje_ganancia to ofertas (profit margin % set at approval)
ALTER TABLE ofertas ADD COLUMN porcentaje_ganancia DECIMAL(5,2);
