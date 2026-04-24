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

    await this._actualizarClientePorUltimaFactura(cliente_id);

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

    // Actualizar estado del cliente según la última factura
    await this._actualizarClientePorUltimaFactura(cliente.id);

    const clienteActualizado = await clientesRepository.findByKit(kit);

    return { factura, estado_facturacion: clienteActualizado?.estado_facturacion };
  }

  async actualizar(kit, numeroFactura, data) {
    validarFormatoKit(kit);
    validarActualizarFactura(data);

    const cliente = await clientesRepository.findByKit(kit);
    if (!cliente) throw new AppError("Cliente no encontrado", 404);

    const { numero, fecha, estadoPago, periodo } = data;

    const result = await facturasRepository.updateByKitAndNumero(kit, numeroFactura, {
      numero,
      fecha: fecha ? new Date(fecha) : null,
      estado_pago: estadoPago,
      periodo: periodo || null,
    });

    if (!result) throw new AppError("Factura no encontrada para actualizar", 404);

    await this._actualizarClientePorUltimaFactura(cliente.id);

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

    await this._actualizarClientePorUltimaFactura(factura.cliente_id);

    return { message: "Pago registrado correctamente", factura: result };
  }

  async _actualizarClientePorUltimaFactura(cliente_id) {
    const facturas = await facturasRepository.findByClienteId(cliente_id);
    if (!facturas || facturas.length === 0) return;

    const ultimaFactura = facturas.sort((a, b) =>
      new Date(b.fecha) - new Date(a.fecha)
    )[0];

    const estadoPago = ultimaFactura.estado_pago;

    let estadoPagoCliente = "pendiente";
    let estadoFacturacion = "facturado";

    if (estadoPago === "pagado") {
      estadoPagoCliente = "confirmado";
      estadoFacturacion = "facturado";
    } else if (estadoPago === "roc") {
      estadoPagoCliente = "pendiente";
      estadoFacturacion = "ROC";
    } else if (estadoPago === "ppc") {
      estadoPagoCliente = "pendiente";
      estadoFacturacion = "PPC";
    } else if (estadoPago === "pendiente" || estadoPago === "vencido") {
      estadoPagoCliente = "pendiente";
      estadoFacturacion = "facturado";
    }

    await facturasRepository.update(cliente_id, {
      estado_pago: estadoPagoCliente,
      estado_facturacion: estadoFacturacion
    }, "clientes");
  }
}

module.exports = new FacturasService();
