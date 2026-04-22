const crearFacturaSchema = {
  required: ["cliente_id", "numero"],
  optional: ["fecha", "estado_pago", "periodo"],
};

const registrarPagoSchema = {
  required: ["fechaPago"],
  optional: ["periodo"],
};

module.exports = { crearFacturaSchema, registrarPagoSchema };
