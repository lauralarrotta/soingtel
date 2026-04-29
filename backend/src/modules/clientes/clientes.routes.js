const express = require("express");
const router = express.Router({ mergeParams: true });
const controller = require("./clientes.controller");

// Middleware para detectar sede desde el path
router.use((req, res, next) => {
  req.sede = req.path.startsWith("/clientes_fusagasuga") ? "fusagasuga" : "principal";
  next();
});

// Rutas principales (sede principal)
router.get("/clientes/estadisticas", controller.estadisticas);
router.get("/clientes/estadisticas-informes", controller.estadisticasInformes);
router.get("/clientes/detalle-informe", controller.detalleInforme);
router.post("/clientes/recalcular-estados", controller.recalcularEstados);
router.get("/clientes", controller.listar);
router.get("/clientes/:kit", controller.obtenerPorKit);
router.post("/clientes", controller.crear);
router.put("/clientes/:kit", controller.actualizar);
router.put("/clientes/:kit/estado", controller.actualizarEstado);
router.put("/clientes/:kit/facturacion", controller.actualizarFacturacion);
router.put("/clientes/:kit/observacion", controller.actualizarObservacion);
router.delete("/clientes/:kit", controller.eliminar);
router.post("/clientes/importar", controller.importar);

// Rutas Fusagasuga
router.get("/clientes_fusagasuga/estadisticas", controller.estadisticas);
router.get("/clientes_fusagasuga/estadisticas-informes", controller.estadisticasInformes);
router.get("/clientes_fusagasuga/detalle-informe", controller.detalleInforme);
router.post("/clientes_fusagasuga/recalcular-estados", controller.recalcularEstados);
router.get("/clientes_fusagasuga", controller.listar);
router.get("/clientes_fusagasuga/:kit", controller.obtenerPorKit);
router.post("/clientes_fusagasuga", controller.crear);
router.put("/clientes_fusagasuga/:kit", controller.actualizar);
router.put("/clientes_fusagasuga/:kit/estado", controller.actualizarEstado);
router.put("/clientes_fusagasuga/:kit/facturacion", controller.actualizarFacturacion);
router.put("/clientes_fusagasuga/:kit/observacion", controller.actualizarObservacion);
router.delete("/clientes_fusagasuga/:kit", controller.eliminar);
router.post("/clientes_fusagasuga/importar", controller.importar);

module.exports = router;
