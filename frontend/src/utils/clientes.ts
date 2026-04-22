import { Cliente, Factura } from "@/types/cliente";

export const calcularEstadoCliente = (cliente: Cliente) => {
  if (cliente.estado_pago === "suspendido") return "suspendido";
  if (cliente.estado_pago === "en_dano") return "en_dano";
  if (cliente.estado_pago === "garantia") return "garantia";
  if (cliente.estado_pago === "transferida") return "transferida";
  if (cliente.estado_pago === "ROC") return "ROC";
  if (cliente.estado_pago === "ppc") return "ppc";

  if (!cliente.facturas || cliente.facturas.length === 0) {
    return "pendiente";
  }

  const pendientes = cliente.facturas.filter(
    (f: Factura) =>
      f.estadoPago === "pendiente" || f.estadoPago === "vencido"
  ).length;

  if (pendientes >= 2) return "mora";
  if (pendientes === 1) return "pendiente";
  return "confirmado";
};