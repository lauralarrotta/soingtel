const facturasService = require("./facturas.service");

class FacturasController {
  async listar(req, res, next) {
    try {
      const facturas = await facturasService.listar();
      res.json({ facturas });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const factura = await facturasService.crear(req.body);
      res.status(201).json(factura);
    } catch (error) {
      next(error);
    }
  }

  async crearPorKit(req, res, next) {
    try {
      const result = await facturasService.crearPorKit(req.params.kit, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const result = await facturasService.actualizar(
        req.params.kit,
        req.params.numeroFactura,
        {
          numero: req.body.numero,
          fecha: req.body.fecha,
          estadoPago: req.body.estadoPago || req.body.estado_pago,
          periodo: req.body.periodo,
        }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const result = await facturasService.eliminar(
        req.params.kit,
        req.params.numeroFactura
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async registrarPago(req, res, next) {
    try {
      const result = await facturasService.registrarPago(
        req.params.kit,
        req.params.numeroFactura,
        req.body
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FacturasController();
