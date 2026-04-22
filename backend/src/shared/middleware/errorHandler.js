const AppError = require("../errors/AppError");
const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    logger.warn("Error operacional", { message: err.message, statusCode: err.statusCode, path: req.path });
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  if (err.code === "23505") {
    logger.warn("Violación de constraint único", { path: req.path });
    return res.status(400).json({ error: "Registro duplicado" });
  }

  logger.error("Error interno del servidor", { message: err.message, stack: err.stack, path: req.path });
  return res.status(500).json({ error: "Error interno del servidor" });
}

module.exports = errorHandler;
