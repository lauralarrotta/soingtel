const express = require("express");
const router = express.Router();
const controller = require("./pagos.controller");

router.get("/pagos", controller.listar);
router.post("/pagos", controller.crear);

module.exports = router;
