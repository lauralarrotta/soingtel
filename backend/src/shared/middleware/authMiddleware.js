const config = require("../../config/env");
const logger = require("../utils/logger");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    logger.warn("Intento de acceso sin autenticación", { path: req.path, ip: req.ip });
    return res.status(401).json({ error: "Se requiere autenticación básica" });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [usuario, contrasena] = credentials.split(":");

  const usuarioValido = config.USUARIOS_VALIDOS.find(
    (u) => u.usuario === usuario && u.contrasena === contrasena
  );

  if (!usuarioValido) {
    logger.warn("Credenciales inválidas", { usuario, path: req.path, ip: req.ip });
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  logger.debug("Usuario autenticado", { usuario: usuarioValido.usuario, rol: usuarioValido.rol });
  req.usuario = { usuario: usuarioValido.usuario, rol: usuarioValido.rol };
  next();
}

module.exports = authMiddleware;
