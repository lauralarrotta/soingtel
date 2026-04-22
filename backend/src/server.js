const app = require("./app");
const config = require("./config/env");
const pool = require("./config/database");
const logger = require("./shared/utils/logger");

const PORT = config.port;
let isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Senal ${signal} recibida, cerrando servidor...`);

  server.close(() => {
    logger.info("HTTP server cerrado");
  });

  pool.end(() => {
    logger.info("Pool de PostgreSQL cerrado");

    logger.close(() => {
      console.log("Logger de winston cerrado");
      process.exit(0);
    });
  });

  setTimeout(() => {
    logger.error("Shutdown forzado por timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception:", err);
  gracefulShutdown("uncaughtException");
});

const server = app.listen(PORT, () => {
  logger.info(`
============================================
   SERVIDOR API SOINGTEL
   Puerto: ${PORT}
   Database: PostgreSQL
   Environment: ${config.nodeEnv}
   Status: ONLINE
============================================
  `);
});
