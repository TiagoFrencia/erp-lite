-- data-dev.sql generado para tus modelos JPA (products, customers, sales, sale_items)

-- =========================
-- Productos (ids fijos)
-- =========================
INSERT INTO products (id, name, sku, cost_price, sale_price, stock, stock_min)
VALUES
  (1, 'Yerba 1Kg', 'YER-1KG', 2200.00, 3500.00, 50, 5),
  (2, 'Café 500g', 'CAF-500', 1600.00, 2800.00, 30, 5),
  (3, 'Azúcar 1Kg', 'AZU-1KG', 800.00, 1200.00, 100, 10)
ON CONFLICT (id) DO NOTHING;

-- =========================
-- Clientes (ids fijos)
-- =========================
INSERT INTO customers (id, name)
VALUES
  (1, 'Juan Pérez'),
  (2, 'Ana Gómez')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- Ventas (cabeceras)
-- Ahora la entidad tiene:
--   id,
--   customer_id,
--   created_at,
--   invoice_type,
--   payment_method,
--   subtotal,
--   total
-- =========================

-- Venta 1 (2 Yerba + 1 Azúcar):
--   2 x 3500 = 7000
--   1 x 1200 = 1200
--   Total = 8200

-- Venta 2 (1 Café):
--   1 x 2800 = 2800

INSERT INTO sales (id, customer_id, created_at, invoice_type, payment_method, subtotal, total)
VALUES
  (1, 1, NOW() - INTERVAL '1 day', 'B', 'EFECTIVO', 8200.00, 8200.00),
  (2, 2, NOW(),                       'B', 'EFECTIVO', 2800.00, 2800.00)
ON CONFLICT (id) DO NOTHING;

-- =========================
-- Ítems de venta
-- La entidad sale_items ahora tiene:
--   id,
--   sale_id,
--   product_id,
--   quantity,
--   unit_price,
--   subtotal
-- =========================


-- Venta 1: 2x Yerba + 1x Azúcar
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price)
VALUES
  (1, 1, 1, 2, 3500.00),
  (2, 1, 3, 1, 1200.00)
ON CONFLICT (id) DO NOTHING;

-- Venta 2: 1x Café
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price)
VALUES
  (3, 2, 2, 1, 2800.00)
ON CONFLICT (id) DO NOTHING;