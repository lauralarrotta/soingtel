// Routes index - re-exporta todos los módulos de rutas
const clientesRoutes = require("../modules/clientes/clientes.routes");
const facturasRoutes = require("../modules/facturas/facturas.routes");
const pagosRoutes = require("../modules/pagos/pagos.routes");
const alertasRoutes = require("../modules/alertas/alertas.routes");

module.exports = {
  clientesRoutes,
  facturasRoutes,
  pagosRoutes,
  alertasRoutes,
};
