const facturasRepository = require("./facturas.repository");
const clientesRepository = require("../clientes/clientes.repository");
const { limpiarFecha } = require("../../shared/utils/fecha.utils");
const AppError = require("../../shared/errors/AppError");
const { validarCrearFactura, validarActualizarFactura, validarRegistrarPago, validarFormatoKit } = require("../../shared/validations");

class FacturasService {
  async listar() {
    return facturasRepository.findAll();
  }

  async crear(data) {
    validarCrearFactura(data);

    const { cliente_id, numero, fecha, estado_pago, periodo } = data;
    const fechaFactura = fecha ? new Date(fecha) : new Date();

    const existe = await facturasRepository.existePorClienteYMes(cliente_id, fechaFactura);
    if (existe) throw new AppError("Este cliente ya tiene factura este mes", 400);

    const existeNumero = await facturasRepository.findByClienteId(cliente_id);
    if (existeNumero.some(f => f.numero === numero)) {
      throw new AppError("Ya existe una factura con este número para este cliente", 400);
    }

    const factura = await facturasRepository.create({
      cliente_id,
      numero,
      periodo: periodo || null,
      anio: new Date().getFullYear(),
      fecha: fechaFactura,
      estado_pago: estado_pago || "pendiente",
    });

    await this._actualizarFacturacionCliente(cliente_id, estado_pago);

    return factura;
  }

  async crearPorKit(kit, data) {
    validarFormatoKit(kit);
    validarCrearFactura({ ...data, kit });

    const { numero, fecha, estadoPago, periodo } = data;

    const cliente = await clientesRepository.findByKit(kit);
    if (!cliente) throw new AppError("Cliente no encontrado", 404);

    const existe = await facturasRepository.findByKitAndNumero(kit, numero);
    if (existe) throw new AppError("Ya existe una factura con este número", 400);

    const fechaFactura = fecha ? new Date(fecha) : new Date();

    const factura = await facturasRepository.create({
      cliente_id: cliente.id,
      numero,
      periodo: periodo || null,
      anio: new Date().getFullYear(),
      fecha: fechaFactura,
      estado_pago: estadoPago || "pendiente",
    });

    let estadoFacturacion = null;
    if (fechaFactura) {
      const mismoMes = await facturasRepository.existePorClienteYMes(cliente.id, fechaFactura);
      if (mismoMes) {
        const update = await facturasRepository.update(cliente.id, { estado_facturacion: "facturado" }, "clientes");
        estadoFacturacion = update?.estado_facturacion;
      }
    }

    return { factura, estado_facturacion: estadoFacturacion };
  }

  async actualizar(kit, numeroFactura, data) {
    validarFormatoKit(kit);
    validarActualizarFactura(data);

    const { numero, fecha, estadoPago, periodo } = data;

    const result = await facturasRepository.updateByKitAndNumero(kit, numeroFactura, {
      numero,
      fecha: fecha ? new Date(fecha) : null,
      estado_pago: estadoPago,
      periodo: periodo || null,
    });

    if (!result) throw new AppError("Factura no encontrada para actualizar", 404);
    return { message: "Factura actualizada correctamente", factura: result };
  }

  async eliminar(kit, numeroFactura) {
    validarFormatoKit(kit);

    const result = await facturasRepository.deleteByKitAndNumero(kit, numeroFactura);
    if (!result) throw new AppError("Factura no encontrada para eliminar", 404);
    return { message: "Factura eliminada correctamente" };
  }

  async registrarPago(kit, numeroFactura, data) {
    validarFormatoKit(kit);
    validarRegistrarPago(data);

    const { fechaPago, periodo } = data;

    const factura = await facturasRepository.findByKitAndNumero(kit, numeroFactura);
    if (!factura) throw new AppError("Factura no encontrada", 404);
    if (factura.estado_pago === "pagado") throw new AppError("La factura ya está pagada", 400);

    const result = await facturasRepository.marcarPagado(factura.id, fechaPago);
    return { message: "Pago registrado correctamente", factura: result };
  }

  async _actualizarFacturacionCliente(cliente_id, estado_pago) {
    const mismoMes = true;
    if (mismoMes) {
      let nuevoEstado = "facturado";
      if (estado_pago === "roc") nuevoEstado = "ROC";
      if (estado_pago === "ppc") nuevoEstado = "PPC";
      await facturasRepository.update(cliente_id, { estado_facturacion: nuevoEstado }, "clientes");
    }
  }
}

module.exports = new FacturasService();
