const clientesRepository = require("./clientes.repository");
const facturasRepository = require("../facturas/facturas.repository");
const { limpiarNumero, limpiarFecha, mapearEstadoPago } = require("../../shared/utils/fecha.utils");
const { TABLAS } = require("../../shared/constants");
const AppError = require("../../shared/errors/AppError");
const { validarCrearCliente, validarActualizarCliente, validarFormatoKit } = require("../../shared/validations");

class ClientesService {
  async listar(query, sede = "principal") {
    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    return clientesRepository.findAll(query, table);
  }

  async obtenerPorKit(kit, sede = "principal") {
    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    const cliente = await clientesRepository.findByKit(kit, table);
    if (!cliente) throw new AppError("Cliente no encontrado", 404);
    return cliente;
  }

  async crear(data, sede = "principal") {
    validarCrearCliente(data);

    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    const kitFinal =
      data.kit && data.kit.trim() !== "" ? data.kit : `KIT-${Date.now()}`;

    const payload = {
      kit: kitFinal,
      nombrecliente:
        sede === "fusagasuga" && data.nombrecliente
          ? data.nombrecliente.toUpperCase()
          : data.nombrecliente,
      cuenta_starlink: data.cuentastarlink || "",
      coordenadas: data.coordenadas || "",
      corte: data.corte || null,
      email: data.email || "",
      contrasena: data.contrasena || "",
      observacion: data.observacion || "",
      cuenta: data.cuenta || "",
      costo_plan: data.costoplan ? parseFloat(data.costoplan) : null,
      valor_factura: data.valorFactura ? parseFloat(data.valorFactura) : null,
      valor_soporte: data.valorSoporte ? parseFloat(data.valorSoporte) : null,
      tipo_soporte: data.tipoSoporte || "",
      corte_facturacion: data.corteFacturacion || null,
      fecha_activacion: data.fechaActivacion || null,
      estado_pago: data.estadoPago || "pendiente",
      observaciones: data.observaciones || "",
      creado_por: data.creadoPor || "sistema",
      activo: data.activo !== undefined ? data.activo : true,
      sede: sede === "fusagasuga" ? "fusagasuga" : "principal",
    };

    return clientesRepository.create(payload, table);
  }

  async actualizar(kit, campos, sede = "principal") {
    // Solo validar formato kit si se está cambiando a un valor diferente
    if (campos.kit && campos.kit !== kit) {
      validarFormatoKit(campos.kit);
    }

    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    const result = await clientesRepository.update(kit, campos, table);
    if (!result) throw new AppError("Cliente no encontrado", 404);
    return result;
  }

  async actualizarEstado(kit, estado_pago, sede = "principal") {
    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    const result = await clientesRepository.updateEstado(kit, estado_pago, table);
    if (!result) throw new AppError("Cliente no encontrado", 404);
    return { message: "Estado actualizado correctamente" };
  }

  async actualizarFacturacion(kit, estado_facturacion, sede = "principal") {
    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    const result = await clientesRepository.updateFacturacion(kit, estado_facturacion, table);
    if (!result) throw new AppError("Cliente no encontrado", 404);
    return { message: "Estado de facturación actualizado", cliente: result };
  }

  async actualizarObservacion(kit, observacion, sede = "principal") {
    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    const result = await clientesRepository.updateObservacion(kit, observacion, table);
    if (!result) throw new AppError("Cliente no encontrado", 404);
    return { message: "Observación actualizada" };
  }

  async eliminar(kit, sede = "principal") {
    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    const deleted = await clientesRepository.delete(kit, table);
    if (!deleted) throw new AppError("Cliente no encontrado", 404);
    return { message: "Cliente eliminado completamente" };
  }

  async obtenerEstadisticas(sede = "principal") {
    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    return clientesRepository.getEstadisticas(table);
  }

  async obtenerEstadisticasInformes(sede = "principal", { periodo, anio } = {}) {
    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    return clientesRepository.getEstadisticasInformes(table, { periodo, anio });
  }

  async obtenerDetalleInforme(sede = "principal", { periodo, anio, tipo } = {}) {
    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    return clientesRepository.getDetalleInforme(table, { periodo, anio, tipo });
  }

  async recalcularEstados(sede = "principal") {
    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;

    // Obtener todos los clientes activos
    const clientes = await clientesRepository.findAllForExport(table);

    let actualizados = 0;
    let errores = [];

    for (const cliente of clientes) {
      try {
        // Obtener facturas del cliente ordenadas por fecha
        const facturas = await facturasRepository.findByClienteId(cliente.id);

        if (!facturas || facturas.length === 0) {
          // Sin facturas -> pendiente
          if (cliente.estado_pago !== "pendiente" || cliente.estado_facturacion !== "facturado") {
            await clientesRepository.update(cliente.kit, {
              estado_pago: "pendiente",
              estado_facturacion: "facturado"
            }, table);
            actualizados++;
          }
          continue;
        }

        // Ordenar por fecha descendente para obtener la más reciente
        const facturasOrdenadas = facturas.sort((a, b) =>
          new Date(b.fecha) - new Date(a.fecha)
        );
        const ultimaFactura = facturasOrdenadas[0];
        const estadoPago = ultimaFactura.estado_pago;

        let nuevoEstadoPago = "pendiente";
        let nuevoEstadoFacturacion = "facturado";

        if (estadoPago === "pagado") {
          nuevoEstadoPago = "confirmado";
          nuevoEstadoFacturacion = "facturado";
        } else if (estadoPago === "roc") {
          nuevoEstadoPago = "pendiente";
          nuevoEstadoFacturacion = "ROC";
        } else if (estadoPago === "ppc") {
          nuevoEstadoPago = "pendiente";
          nuevoEstadoFacturacion = "PPC";
        } else if (estadoPago === "pendiente" || estadoPago === "vencido") {
          nuevoEstadoPago = "pendiente";
          nuevoEstadoFacturacion = "facturado";
        }

        // Solo actualizar si hay cambio
        if (cliente.estado_pago !== nuevoEstadoPago || cliente.estado_facturacion !== nuevoEstadoFacturacion) {
          await clientesRepository.update(cliente.kit, {
            estado_pago: nuevoEstadoPago,
            estado_facturacion: nuevoEstadoFacturacion
          }, table);
          actualizados++;
        }
      } catch (err) {
        errores.push({ kit: cliente.kit, error: err.message });
      }
    }

    return { message: "Estados recalculados", actualizados, errores };
  }

  async importar({ clientes, usuario }, sede = "principal") {
    if (!Array.isArray(clientes) || !clientes.length) {
      throw new AppError("Se requiere un array de clientes para importar", 400);
    }

    const table = sede === "fusagasuga" ? TABLAS.FUSAGASUGA : TABLAS.PRINCIPAL;
    const clientesInsertados = [];
    const errores = [];

    const client = await require("../../config/database").connect();

    try {
      await client.query("BEGIN");

      for (let i = 0; i < clientes.length; i++) {
        const cliente = clientes[i];
        await client.query(`SAVEPOINT cliente_${i}`);

        try {
          const existente = await client.query(
            `SELECT id FROM ${table.cliente} WHERE kit = $1`,
            [cliente.kit]
          );

          let clienteId;
          const nombreUpper =
            sede === "fusagasuga" && cliente.nombre_cliente
              ? cliente.nombre_cliente.toUpperCase()
              : cliente.nombre_cliente;

          if (existente.rows.length > 0) {
            clienteId = existente.rows[0].id;
            await client.query(
              `UPDATE ${table.cliente} SET
                nombre_cliente = COALESCE($2, nombre_cliente),
                cuenta_starlink = COALESCE($3, cuenta_starlink),
                coordenadas = COALESCE($4, coordenadas),
                email = COALESCE($5, email),
                contrasena = COALESCE($6, contrasena),
                observacion = COALESCE($7, observacion),
                cuenta = COALESCE($8, cuenta),
                costo_plan = COALESCE($9, costo_plan),
                corte = COALESCE($10, corte),
                valor_factura = COALESCE($11, valor_factura),
                valor_soporte = COALESCE($12, valor_soporte),
                tipo_soporte = COALESCE($13, tipo_soporte),
                corte_facturacion = COALESCE($14, corte_facturacion),
                estado_pago = $15
              WHERE id = $1`,
              [
                clienteId, nombreUpper, cliente.cuenta_starlink,
                cliente.coordenadas || null, cliente.email || null,
                cliente.contrasena || null, cliente.observacion || null,
                cliente.cuenta || null, limpiarNumero(cliente.costo_plan),
                cliente.corte ? Number(cliente.corte) : null,
                limpiarNumero(cliente.valor_factura),
                limpiarNumero(cliente.valor_soporte),
                cliente.tipo_soporte || null,
                cliente.corte_facturacion || cliente.corte || null,
                mapearEstadoPago(cliente.estado_pago),
              ]
            );
            const r = await client.query(`SELECT * FROM ${table.cliente} WHERE id = $1`, [clienteId]);
            clientesInsertados.push(r.rows[0]);
          } else {
            const resultado = await client.query(
              `INSERT INTO ${table.cliente}
              (kit, nombre_cliente, cuenta_starlink, coordenadas, email, contrasena,
               observacion, cuenta, costo_plan, corte, valor_factura, valor_soporte,
               tipo_soporte, corte_facturacion, fecha_activacion, estado_pago, creado_por, activo, sede)
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,true,$18)
              RETURNING *`,
              [
                cliente.kit, nombreUpper, cliente.cuenta_starlink,
                cliente.coordenadas || null, cliente.email || null,
                cliente.contrasena || null, cliente.observacion || null,
                cliente.cuenta || null, limpiarNumero(cliente.costo_plan),
                cliente.corte ? Number(cliente.corte) : null,
                limpiarNumero(cliente.valor_factura),
                limpiarNumero(cliente.valor_soporte),
                cliente.tipo_soporte || null,
                cliente.corte_facturacion || cliente.corte || null,
                limpiarFecha(cliente.fecha_activacion) || new Date().toISOString().split("T")[0],
                mapearEstadoPago(cliente.estado_pago),
                usuario || "importacion",
                cliente.sede || (sede === "fusagasuga" ? "fusagasuga" : "principal"),
              ]
            );
            clientesInsertados.push(resultado.rows[0]);
            clienteId = resultado.rows[0].id;
          }

          if (Array.isArray(cliente.facturas)) {
            for (const factura of cliente.facturas) {
              if (!factura?.numero) continue;

              const sp = `factura_${i}_${Math.random().toString(36).substring(7)}`;
              let estadoFinal = "pendiente";
              let fechaFinal = new Date().toISOString().split("T")[0];

              try {
                const estadoRaw = (factura.estadoPago || "").toString().toLowerCase().trim();
                if (estadoRaw === "pagado") estadoFinal = "pagado";
                else if (estadoRaw === "roc") estadoFinal = "roc";
                else if (estadoRaw === "ppc") estadoFinal = "ppc";

                fechaFinal = limpiarFecha(factura.fecha) || fechaFinal;
                await client.query(`SAVEPOINT ${sp}`);

                const invExist = await client.query(
                  `SELECT id FROM ${table.factura} WHERE cliente_id = $1 AND numero = $2`,
                  [clienteId, factura.numero]
                );

                if (invExist.rows.length > 0) {
                  await client.query(
                    `UPDATE ${table.factura} SET numero = COALESCE($1, numero), fecha = COALESCE($2, fecha), estado_pago = $3 WHERE id = $4`,
                    [factura.numero, fechaFinal, estadoFinal, invExist.rows[0].id]
                  );
                } else {
                  await client.query(
                    `INSERT INTO ${table.factura} (cliente_id, numero, periodo, anio, fecha, estado_pago)
                     VALUES ($1,$2,$3,$4,$5,$6)`,
                    [clienteId, factura.numero, factura.periodo || null, factura.anio || new Date().getFullYear(), fechaFinal, estadoFinal]
                  );
                }

                if (estadoFinal === "roc" || estadoFinal === "ppc") {
                  await client.query(
                    `UPDATE ${table.cliente} SET estado_facturacion = $1 WHERE id = $2`,
                    [estadoFinal.toUpperCase(), clienteId]
                  );
                }

                await client.query(`RELEASE SAVEPOINT ${sp}`);
              } catch (errFactura) {
                await client.query(`ROLLBACK TO SAVEPOINT ${sp}`);
                errores.push({ tipo: "factura", fila: i + 1, kit: cliente.kit, factura: factura?.numero || null, mensaje: errFactura.message });
              }
            }
          }

          await client.query(`RELEASE SAVEPOINT cliente_${i}`);
        } catch (error) {
          await client.query(`ROLLBACK TO SAVEPOINT cliente_${i}`);
          errores.push({ tipo: "cliente", fila: i + 1, kit: cliente.kit, mensaje: error.message });
        }
      }

      await client.query("COMMIT");
      return { success: true, clientesInsertados: clientesInsertados.length, errores, clientes: clientesInsertados };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ClientesService();
