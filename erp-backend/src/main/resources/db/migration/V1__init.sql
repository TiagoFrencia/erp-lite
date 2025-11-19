-- Índices útiles (ajusta nombres reales de columnas si difieren)
CREATE INDEX IF NOT EXISTS idx_product_name ON product (lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_sku ON product (sku);
CREATE INDEX IF NOT EXISTS idx_sale_created_at ON sale (created_at);
CREATE INDEX IF NOT EXISTS idx_customer_name ON customer (lower(name));
