const { Pool } = require("pg");
const config = require("./env");
const { runMigrations } = require("../database/migrations");

const pool = new Pool({
  connectionString: config.database.connectionString,
  ssl: config.database.ssl,
});

pool.connect(async (err, client, release) => {
  if (err) {
    console.error("Error conectando a PostgreSQL:", err.stack);
  } else {
    console.log("Conectado a PostgreSQL");
    release();
  }
});

// Ejecutar migraciones al iniciar (solo en desarrollo)
if (config.nodeEnv === "development") {
  runMigrations().catch((err) => {
    console.error("Error ejecutando migraciones:", err.message);
  });
}

module.exports = pool;
