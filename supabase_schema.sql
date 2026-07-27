-- HomeStock Schema
-- Ejecutar en Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  quantity NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'Units',
  location TEXT,
  purchase_date DATE,
  expiration_date DATE,
  min_stock NUMERIC DEFAULT 1,
  consumption_rate NUMERIC DEFAULT 0,
  estimated_price NUMERIC DEFAULT 0,
  barcode TEXT,
  image_url TEXT,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  brand TEXT,
  store TEXT NOT NULL,
  purchase_date DATE,
  unit_size TEXT,
  quantity NUMERIC,
  price_paid NUMERIC NOT NULL,
  unit_price NUMERIC,
  promotion TEXT,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  location TEXT,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  budget NUMERIC,
  purchase_date DATE,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for pre-existing databases (safe to re-run)
ALTER TABLE shopping_lists ADD COLUMN IF NOT EXISTS purchase_date DATE;

CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit TEXT,
  estimated_price NUMERIC,
  actual_price NUMERIC,
  store TEXT,
  purchased BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  category TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  product_id UUID,
  product_name TEXT,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  severity TEXT DEFAULT 'medium',
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas de acceso (sin autenticación por ahora)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON price_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON shopping_lists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON shopping_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON budget FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON alerts FOR ALL USING (true) WITH CHECK (true);
