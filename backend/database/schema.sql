
CREATE DATABASE soingtel_db;
-- ========================================
-- SCHEMA COMPLETO PARA SISTEMA SOINGTEL
-- Base de Datos PostgreSQL Local
-- ========================================

-- Eliminar tablas si existen (para empezar limpio)
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS facturas CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS alertas_facturacion CASCADE;
DROP TABLE IF EXISTS alertas_suspension CASCADE;
DROP TABLE IF EXISTS alertas_reactivacion CASCADE;

-- ========================================
-- TABLA: clientes
-- ========================================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    kit VARCHAR(100) UNIQUE NOT NULL,
    nombre_cliente VARCHAR(255) NOT NULL,
    cuenta_starlink VARCHAR(150),
    coordenadas TEXT,
    corte INTEGER,
    email VARCHAR(255),
    contrasena TEXT,
    observacion VARCHAR(255),
    cuenta VARCHAR(100),
    costo_plan NUMERIC(12,2),
    valor_factura NUMERIC(12,2),
    valor_soporte NUMERIC(12,2),
    tipo_soporte VARCHAR(50),
    corte_facturacion VARCHAR(50),
    fecha_activacion DATE,
    estado_pago VARCHAR(50) DEFAULT 'pendiente',
    observaciones TEXT DEFAULT '',
    creado_por VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    estado_facturacion VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_nombre ON clientes(nombre_cliente);
CREATE INDEX idx_clientes_estado ON clientes(estado_pago);
CREATE INDEX idx_clientes_activo ON clientes(activo);

-- ========================================
-- TABLA: facturas
-- ========================================
CREATE TABLE facturas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  numero VARCHAR(50) NOT NULL,
  fecha DATE,
  estado_pago VARCHAR(50) DEFAULT 'pendiente',
  fecha_pago DATE,
  metodo_pago VARCHAR(100),
  periodo VARCHAR(50),
  anio INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (cliente_id, numero)
);
-- Índices
CREATE INDEX idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX idx_facturas_estado ON facturas(estado_pago);

-- ========================================
-- TABLA: pagos
-- ========================================
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    factura_id INTEGER NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago DATE NOT NULL,
    metodo_pago VARCHAR(100),
    referencia VARCHAR(255)
);

-- Índices
CREATE INDEX idx_pagos_factura ON pagos(factura_id);
CREATE INDEX idx_pagos_cliente ON pagos(cliente_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);

-- ========================================
-- TABLA: alertas_facturacion
-- ========================================
CREATE TABLE alertas_facturacion (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER, -- Puede ser NULL si viene de fusagasuga
    sede VARCHAR(50) DEFAULT 'principal', -- 'principal' o 'fusagasuga'
    cliente_kit VARCHAR(100),
    cliente_nombre VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    completada BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_completada TIMESTAMP
);

-- Índices
CREATE INDEX idx_alertas_fact_cliente ON alertas_facturacion(cliente_id);
CREATE INDEX idx_alertas_fact_completada ON alertas_facturacion(completada);
CREATE INDEX idx_alertas_fact_sede ON alertas_facturacion(sede);

-- ========================================
-- TABLA: alertas_suspension
-- ========================================
CREATE TABLE alertas_suspension (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER, -- Puede ser NULL si viene de fusagasuga
    sede VARCHAR(50) DEFAULT 'principal', -- 'principal' o 'fusagasuga'
    cliente_kit VARCHAR(100),
    cliente_nombre VARCHAR(255) NOT NULL,
    numero_factura VARCHAR(50),
    mensaje TEXT NOT NULL,
    vista BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vista TIMESTAMP
);

-- Índices
CREATE INDEX idx_alertas_susp_cliente ON alertas_suspension(cliente_id);
CREATE INDEX idx_alertas_susp_vista ON alertas_suspension(vista);
CREATE INDEX idx_alertas_susp_sede ON alertas_suspension(sede);

-- ========================================
-- TABLA: alertas_reactivacion
-- ========================================
CREATE TABLE alertas_reactivacion (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER, -- Puede ser NULL si viene de fusagasuga
    sede VARCHAR(50) DEFAULT 'principal', -- 'principal' o 'fusagasuga'
    cliente_kit VARCHAR(100),
    cliente_nombre VARCHAR(255) NOT NULL,
    numero_factura VARCHAR(50),
    mensaje TEXT NOT NULL,
    vista BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vista TIMESTAMP
);

-- Índices
CREATE INDEX idx_alertas_react_cliente ON alertas_reactivacion(cliente_id);
CREATE INDEX idx_alertas_react_vista ON alertas_reactivacion(vista);
CREATE INDEX idx_alertas_react_sede ON alertas_reactivacion(sede);

-- ========================================
-- FUNCIONES Y TRIGGERS
-- ========================================

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para clientes
CREATE TRIGGER trigger_actualizar_facturas_updated_at
    BEFORE UPDATE ON facturas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

    CREATE TRIGGER trigger_actualizar_clientes
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- ========================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ========================================

-- Insertar algunos clientes de ejemplo
INSERT INTO clientes (kit, nombre_cliente, estado_pago, observaciones, creado_por) VALUES
('KIT-001','Empresa Ejemplo 1', 'confirmado', '', 'admin'),
('KIT-002','Empresa Ejemplo 2', 'pendiente', 'Pendiente de instalación', 'soporte'),
('KIT-003','Empresa Ejemplo 3', 'suspendido', 'Suspendido por falta de pago', 'facturacion');

-- Insertar facturas de ejemplo
INSERT INTO facturas (cliente_id, numero, fecha,estado_pago) VALUES
(1, 'SOG-0001', '2024-01-01',  'confirmado'),
(2, 'SOG-0002', '2024-01-01', 'pendiente');

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Mostrar resumen de tablas creadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Contar registros
SELECT 
    'clientes' as tabla, COUNT(*) as registros FROM clientes
UNION ALL
SELECT 'facturas', COUNT(*) FROM facturas
UNION ALL
SELECT 'pagos', COUNT(*) FROM pagos
UNION ALL
SELECT 'alertas_facturacion', COUNT(*) FROM alertas_facturacion
UNION ALL
SELECT 'alertas_suspension', COUNT(*) FROM alertas_suspension
UNION ALL
SELECT 'alertas_reactivacion', COUNT(*) FROM alertas_reactivacion;


SELECT id, kit, activo 
FROM clientes 
WHERE kit = 'NTS26228772';
-- ========================================
-- INSTRUCCIONES DE USO
-- ========================================

/*
PASO 1: Conectarse a PostgreSQL
    psql -U postgres

PASO 2: Crear base de datos
    CREATE DATABASE soingtel_db;

PASO 3: Conectarse a la base de datos
    \c soingtel_db

PASO 4: Ejecutar este script
    \i /ruta/al/archivo/schema.sql

O desde línea de comandos:
    psql -U postgres -d soingtel_db -f database/schema.sql
*/
