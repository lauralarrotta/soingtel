const express = require("express");
const router = express.Router();
const controller = require("./alertas.controller");

router.get("/alertas_facturacion", controller.listarFacturacion);
router.post("/alertas_facturacion", controller.actualizarFacturacion);
router.post("/alertas_facturacion/crear", controller.crearFacturacion);
router.get("/alertas_suspension", controller.listarSuspension);
router.post("/alertas_suspension", controller.actualizarSuspension);
router.post("/alertas_suspension/crear", controller.crearSuspension);
router.delete("/alertas_suspension/:id", controller.eliminarSuspension);
router.get("/alertas_reactivacion", controller.listarReactivacion);
router.post("/alertas_reactivacion", controller.actualizarReactivacion);
router.post("/alertas_reactivacion/crear", controller.crearReactivacion);
router.delete("/alertas_reactivacion/:id", controller.eliminarReactivacion);

module.exports = router;
