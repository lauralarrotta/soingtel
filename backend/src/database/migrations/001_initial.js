const pool = require("../../config/database");

async function up() {
  const client = await pool.connect();
  try {
    // Agregar columna sede a clientes si no existe
    await client.query(`
      ALTER TABLE clientes ADD COLUMN IF NOT EXISTS sede VARCHAR(50) DEFAULT 'principal'
    `);
    console.log("✓ Migración: columna 'sede' agregada a clientes");

    // Agregar columna anio a facturas si no existe
    await client.query(`
      ALTER TABLE facturas ADD COLUMN IF NOT EXISTS anio INTEGER
    `);
    console.log("✓ Migración: columna 'anio' agregada a facturas");

    // Agregar columna fecha_pago a facturas si no existe
    await client.query(`
      ALTER TABLE facturas ADD COLUMN IF NOT EXISTS fecha_pago DATE
    `);
    console.log("✓ Migración: columna 'fecha_pago' agregada a facturas");

    console.log("✓ Migraciones completadas");
  } catch (error) {
    console.error("Error en migración:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();
  try {
    await client.query(`ALTER TABLE facturas DROP COLUMN IF EXISTS fecha_pago`);
    await client.query(`ALTER TABLE facturas DROP COLUMN IF EXISTS anio`);
    await client.query(`ALTER TABLE clientes DROP COLUMN IF EXISTS sede`);
    console.log("✓ Migración revertida");
  } catch (error) {
    console.error("Error revertiendo migración:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
