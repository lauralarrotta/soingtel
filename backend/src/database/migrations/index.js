const fs = require("fs");
const path = require("path");

const migrations = fs.readdirSync(__dirname)
  .filter((f) => f.endsWith(".js") && f !== "index.js")
  .sort();

async function runMigrations() {
  console.log("Ejecutando migraciones...");
  for (const file of migrations) {
    const migration = require(path.join(__dirname, file));
    await migration.up();
  }
}

async function rollbackMigrations() {
  console.log("Revirtiendo migraciones...");
  for (const file of migrations.reverse()) {
    const migration = require(path.join(__dirname, file));
    await migration.down();
  }
}

module.exports = { runMigrations, rollbackMigrations, migrations };
