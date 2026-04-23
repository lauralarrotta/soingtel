const config = require("../../config/env");
const logger = require("../../shared/utils/logger");
const ApiResponse = require("../../shared/utils/ApiResponse");

function login(req, res) {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return ApiResponse.error(res, "Usuario y contraseña son requeridos", 400);
  }

  const usuarioValido = config.USUARIOS_VALIDOS.find(
    (u) => u.usuario === usuario && u.contrasena === contrasena
  );

  if (!usuarioValido) {
    logger.warn("Intento de login fallido", { usuario });
    return ApiResponse.unauthorized(res, "Usuario o contraseña incorrectos");
  }

  logger.info("Login exitoso", { usuario: usuarioValido.usuario });
  const credentials = Buffer.from(`${usuario}:${contrasena}`).toString("base64");

  ApiResponse.success(res, {
    usuario: usuarioValido.usuario,
    rol: usuarioValido.rol,
    token: credentials,
  }, "Login exitoso");
}

module.exports = { login };
