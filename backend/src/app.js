const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const config = require("./config/env");
const logger = require("./shared/utils/logger");
const ApiResponse = require("./shared/utils/ApiResponse");
const errorHandler = require("./shared/middleware/errorHandler");
const authMiddleware = require("./shared/middleware/authMiddleware");

const clientesRoutes = require("./modules/clientes/clientes.routes");
const facturasRoutes = require("./modules/facturas/facturas.routes");
const pagosRoutes = require("./modules/pagos/pagos.routes");
const alertasRoutes = require("./modules/alertas/alertas.routes");
const authRoutes = require("./modules/auth/auth.routes");
const debugRoutes = require("./modules/debug/debug.routes");
const pool = require("./config/database");
const { exportarAGoogleSheets } = require("./integrations/googleSheets/googleSheets.service");

const app = express();

// ===========================================
// SEGURIDAD
// ===========================================
app.use(helmet());
app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: ApiResponse.error(null, "Demasiadas solicitudes, intenta en 15 minutos", 429),
}));

// Middleware
app.use(cors(config.cors));
app.options("*", cors(config.cors));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, res, next) => {
  logger.debug("Request recibido", { method: req.method, path: req.path });
  next();
});

// Health - sin auth, antes de las rutas protegidas
app.get("/api/health", async (req, res) => {
  const health = {
    status: "ok",
    database: "PostgreSQL",
    databaseStatus: "unknown",
    timestamp: new Date().toISOString(),
  };

  try {
    await pool.query("SELECT 1");
    health.databaseStatus = "connected";
  } catch (error) {
    health.status = "degraded";
    health.databaseStatus = "disconnected";
  }

  const statusCode = health.status === "ok" ? 200 : 503;
  return res.status(statusCode).json(health);
});

// Routes
app.use("/api", authRoutes);
app.use("/api", authMiddleware, clientesRoutes);
app.use("/api", authMiddleware, facturasRoutes);
app.use("/api", authMiddleware, pagosRoutes);
app.use("/api", authMiddleware, alertasRoutes);
app.use("/api", debugRoutes);

// Exportar a Google Sheets
app.post("/api/exportar-sheets", authMiddleware, async (req, res, next) => {
  try {
    const clientes = await require("./modules/clientes/clientes.repository").findAllForExport();
    await exportarAGoogleSheets(clientes);
    ApiResponse.success(res, null, "Exportado a Google Sheets");
  } catch (error) {
    next(error);
  }
});

// Error handler
app.use(errorHandler);

module.exports = app;
