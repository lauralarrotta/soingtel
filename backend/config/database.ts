import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "soingtel_db",
  password: process.env.DB_PASSWORD || "12345",
  port: Number(process.env.DB_PORT) || 5432,
  ssl: false, // 🔥 evita cuelgues en local
  max: 10, // conexiones máximas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error conectando a PostgreSQL:", err.stack);
  } else {
    console.log("✅ Conectado a PostgreSQL");
    release();
  }
});
