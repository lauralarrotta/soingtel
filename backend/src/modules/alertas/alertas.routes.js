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
router.get("/alertas_cliente_incompleto", controller.listarClienteIncompleto);
router.post("/alertas_cliente_incompleto", controller.actualizarClienteIncompleto);
router.post("/alertas_cliente_incompleto/crear", controller.crearClienteIncompleto);
router.get("/alertas_nuevo_cliente", controller.listarNuevoCliente);
router.post("/alertas_nuevo_cliente", controller.actualizarNuevoCliente);
router.post("/alertas_nuevo_cliente/crear", controller.crearNuevoCliente);
router.delete("/alertas_nuevo_cliente/:id", controller.eliminarNuevoCliente);

module.exports = router;
