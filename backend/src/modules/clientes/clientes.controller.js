const clientesService = require("./clientes.service");

class ClientesController {
  async listar(req, res, next) {
    try {
      const result = await clientesService.listar(req.query, req.sede);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorKit(req, res, next) {
    try {
      const cliente = await clientesService.obtenerPorKit(req.params.kit, req.sede);
      res.json(cliente);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const cliente = await clientesService.crear(req.body, req.sede);
      res.status(201).json(cliente);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const cliente = await clientesService.actualizar(req.params.kit, req.body, req.sede);
      res.json(cliente);
    } catch (error) {
      next(error);
    }
  }

  async actualizarEstado(req, res, next) {
    try {
      const estado_pago = req.body.estado_pago || req.body.estadoPago;
      const result = await clientesService.actualizarEstado(req.params.kit, estado_pago, req.sede);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async actualizarFacturacion(req, res, next) {
    try {
      const result = await clientesService.actualizarFacturacion(req.params.kit, req.body.estado_facturacion, req.sede);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async actualizarObservacion(req, res, next) {
    try {
      const result = await clientesService.actualizarObservacion(req.params.kit, req.body.observacion, req.sede);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const result = await clientesService.eliminar(req.params.kit, req.sede);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async importar(req, res, next) {
    try {
      const result = await clientesService.importar(req.body, req.sede);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async estadisticas(req, res, next) {
    try {
      const stats = await clientesService.obtenerEstadisticas(req.sede);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async recalcularEstados(req, res, next) {
    try {
      const result = await clientesService.recalcularEstados(req.sede);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientesController();
