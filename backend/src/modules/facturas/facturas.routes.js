const express = require("express");
const router = express.Router();
const controller = require("./facturas.controller");

router.get("/facturas", controller.listar);
router.post("/facturas", controller.crear);
router.post("/clientes/:kit/facturas", controller.crearPorKit);
router.put("/clientes/:kit/facturas/:numeroFactura", controller.actualizar);
router.delete("/clientes/:kit/facturas/:numeroFactura", controller.eliminar);
router.put("/clientes/:kit/facturas/:numeroFactura/pago", controller.registrarPago);

module.exports = router;
