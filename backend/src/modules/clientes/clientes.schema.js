// Schemas de validación para clientes
// Por ahora es un placeholder - se puede usar Joi/Zod para validar en el futuro
const crearClienteSchema = {
  required: ["nombrecliente"],
  optional: [
    "kit", "cuentastarlink", "coordenadas", "corte", "email", "contrasena",
    "observacion", "cuenta", "costoplan", "valorFactura", "valorSoporte",
    "tipoSoporte", "corteFacturacion", "fechaActivacion", "estadoPago",
    "observaciones", "creadoPor", "activo",
  ],
};

module.exports = { crearClienteSchema };
