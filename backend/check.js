require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'facturas'::regclass;
    `);
    console.log("CONSTRAINTS:");
    console.table(res.rows);

    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'facturas';
    `);
    console.log("COLUMNS:");
    console.table(cols.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();
