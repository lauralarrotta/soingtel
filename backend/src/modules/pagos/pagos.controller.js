const pagosService = require("./pagos.service");

class PagosController {
  async listar(req, res, next) {
    try {
      const pagos = await pagosService.listar();
      res.json({ pagos });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const pagos = await pagosService.crear(req.body);
      res.json({ pagos });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PagosController();
