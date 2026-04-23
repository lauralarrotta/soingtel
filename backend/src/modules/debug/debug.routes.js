const express = require("express");
const router = express.Router();
const controller = require("./debug.controller");

router.get("/debug/schema", controller.getSchema);
router.get("/debug/tablas", controller.getTables);

module.exports = router;
