const ESTADOS_PAGO = {
  PENDIENTE: "pendiente",
  CONFIRMADO: "confirmado",
  SUSPENDIDO: "suspendido",
  EN_DANO: "en_dano",
  GARANTIA: "garantia",
  PPC: "ppc",
  ROC: "roc",
  PAGADO: "pagado",
};

const TABLAS = {
  PRINCIPAL: {
    cliente: "clientes",
    factura: "facturas",
  },
  FUSAGASUGA: {
    cliente: "fusagasuga",
    factura: "facturas_fusagasuga",
  },
};

const SEDES = {
  PRINCIPAL: "principal",
  FUSAGASUGA: "fusagasuga",
};

module.exports = {
  ESTADOS_PAGO,
  TABLAS,
  SEDES,
};
