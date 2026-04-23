-- ========================================
-- SCHEMA - Sistema Soingtel
-- ========================================

-- Tabla: clientes (sede principal)
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  kit VARCHAR(50) UNIQUE NOT NULL,
  nombre_cliente VARCHAR(255) NOT NULL,
  cuenta_starlink VARCHAR(100),
  coordenadas VARCHAR(100),
  corte INTEGER,
  email VARCHAR(255),
  contrasena VARCHAR(255),
  observacion TEXT,
  cuenta VARCHAR(100),
  costo_plan DECIMAL(10,2),
  valor_factura DECIMAL(10,2),
  valor_soporte DECIMAL(10,2),
  tipo_soporte VARCHAR(50),
  corte_facturacion INTEGER,
  fecha_activacion DATE,
  estado_pago VARCHAR(50) DEFAULT 'pendiente',
  estado_facturacion VARCHAR(50),
  observaciones TEXT,
  creado_por VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  sede VARCHAR(50) DEFAULT 'principal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: fusagasuga (sede Fusagasuga)
CREATE TABLE IF NOT EXISTS fusagasuga (
  id SERIAL PRIMARY KEY,
  kit VARCHAR(50) UNIQUE NOT NULL,
  nombre_cliente VARCHAR(255) NOT NULL,
  cuenta_starlink VARCHAR(100),
  coordenadas VARCHAR(100),
  corte INTEGER,
  email VARCHAR(255),
  contrasena VARCHAR(255),
  observacion TEXT,
  cuenta VARCHAR(100),
  costo_plan DECIMAL(10,2),
  valor_factura DECIMAL(10,2),
  valor_soporte DECIMAL(10,2),
  tipo_soporte VARCHAR(50),
  corte_facturacion INTEGER,
  fecha_activacion DATE,
  estado_pago VARCHAR(50) DEFAULT 'pendiente',
  estado_facturacion VARCHAR(50),
  observaciones TEXT,
  creado_por VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  sede VARCHAR(50) DEFAULT 'fusagasuga',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: facturas (sede principal)
CREATE TABLE IF NOT EXISTS facturas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
  numero VARCHAR(50),
  periodo VARCHAR(50),
  anio INTEGER,
  fecha DATE,
  estado_pago VARCHAR(50) DEFAULT 'pendiente',
  fecha_pago DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: facturas_fusagasuga (sede Fusagasuga)
CREATE TABLE IF NOT EXISTS facturas_fusagasuga (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES fusagasuga(id) ON DELETE CASCADE,
  numero VARCHAR(50),
  periodo VARCHAR(50),
  anio INTEGER,
  fecha DATE,
  estado_pago VARCHAR(50) DEFAULT 'pendiente',
  fecha_pago DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: pagos
CREATE TABLE IF NOT EXISTS pagos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
  factura_id INTEGER REFERENCES facturas(id) ON DELETE SET NULL,
  fecha_pago DATE,
  registrado_por VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: alertas_facturacion
CREATE TABLE IF NOT EXISTS alertas_facturacion (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER,
  sede VARCHAR(50) DEFAULT 'principal',
  cliente_kit VARCHAR(100),
  cliente_nombre VARCHAR(255),
  mensaje TEXT,
  completada BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: alertas_suspension
CREATE TABLE IF NOT EXISTS alertas_suspension (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER,
  sede VARCHAR(50) DEFAULT 'principal',
  cliente_kit VARCHAR(100),
  cliente_nombre VARCHAR(255),
  numero_factura VARCHAR(50),
  mensaje TEXT,
  vista BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: alertas_reactivacion
CREATE TABLE IF NOT EXISTS alertas_reactivacion (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER,
  sede VARCHAR(50) DEFAULT 'principal',
  cliente_kit VARCHAR(100),
  cliente_nombre VARCHAR(255),
  numero_factura VARCHAR(50),
  mensaje TEXT,
  vista BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_kit ON clientes(kit);
CREATE INDEX IF NOT EXISTS idx_clientes_estado_pago ON clientes(estado_pago);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fusagasuga_kit ON fusagasuga(kit);
CREATE INDEX IF NOT EXISTS idx_facturas_fusagasuga_cliente_id ON facturas_fusagasuga(cliente_id);
