const alertasSchema = {
  facturacion: { optional: ["completada"] },
  suspension: { optional: ["vista"] },
  reactivacion: { optional: ["vista"] },
};

module.exports = { alertasSchema };
