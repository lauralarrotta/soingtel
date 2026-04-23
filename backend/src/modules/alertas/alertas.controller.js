const alertasService = require("./alertas.service");

class AlertasController {
  async listarFacturacion(req, res, next) {
    try {
      const result = await alertasService.listarFacturacion();
      res.json({ alertas_facturacion: result });
    } catch (error) {
      next(error);
    }
  }

  async actualizarFacturacion(req, res, next) {
    try {
      const result = await alertasService.actualizarFacturacion(req.body);
      res.json({ alertas_facturacion: result });
    } catch (error) {
      next(error);
    }
  }

  async listarSuspension(req, res, next) {
    try {
      const result = await alertasService.listarSuspension();
      res.json({ alertas_suspension: result });
    } catch (error) {
      next(error);
    }
  }

  async actualizarSuspension(req, res, next) {
    try {
      const result = await alertasService.actualizarSuspension(req.body);
      res.json({ alertas_suspension: result });
    } catch (error) {
      next(error);
    }
  }

  async listarReactivacion(req, res, next) {
    try {
      const result = await alertasService.listarReactivacion();
      res.json({ alertas_reactivacion: result });
    } catch (error) {
      next(error);
    }
  }

  async actualizarReactivacion(req, res, next) {
    try {
      const result = await alertasService.actualizarReactivacion(req.body);
      res.json({ alertas_reactivacion: result });
    } catch (error) {
      next(error);
    }
  }

  async crearFacturacion(req, res, next) {
    try {
      const result = await alertasService.crearFacturacion(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async crearSuspension(req, res, next) {
    try {
      const result = await alertasService.crearSuspension(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async crearReactivacion(req, res, next) {
    try {
      const result = await alertasService.crearReactivacion(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async eliminarSuspension(req, res, next) {
    try {
      const result = await alertasService.eliminarSuspension(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async eliminarReactivacion(req, res, next) {
    try {
      const result = await alertasService.eliminarReactivacion(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlertasController();
