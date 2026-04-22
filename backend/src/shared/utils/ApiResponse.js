/**
 * Respuestas estandarizadas para la API
 */
class ApiResponse {
  static success(res, data, message = "OK", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static created(res, data, message = "Creado exitosamente") {
    return this.success(res, data, message, 201);
  }

  static paginated(res, data, pagination, message = "OK") {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    });
  }

  static error(res, message = "Error", statusCode = 400, errors = null) {
    if (!res) return { success: false, error: message, statusCode };
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
    });
  }

  static notFound(res, message = "Recurso no encontrado") {
    return this.error(res, message, 404);
  }

  static unauthorized(res, message = "No autorizado") {
    return this.error(res, message, 401);
  }

  static serverError(res, message = "Error interno del servidor") {
    return this.error(res, message, 500);
  }
}

module.exports = ApiResponse;
