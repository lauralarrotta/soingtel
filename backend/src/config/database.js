const { Pool } = require("pg");
const config = require("./env");

const pool = new Pool({
  connectionString: config.database.connectionString,
  ssl: config.database.ssl,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("Error conectando a PostgreSQL:", err.stack);
  } else {
    console.log("Conectado a PostgreSQL");
    release();
  }
});

module.exports = pool;
