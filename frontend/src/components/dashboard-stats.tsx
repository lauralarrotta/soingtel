import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  FileText,
} from "lucide-react";

interface Cliente {
  kit: string;
  nombrecliente: string;
  cuenta: string;
  email: string;
  corte: number;
  estado_pago: "confirmado" | "pendiente" | "suspendido" | "en_dano" | string;
  observaciones: string;
  costo: string;
  facturas?: any[];
}

interface DashboardStatsProps {
  clientes: Cliente[];
}

export function DashboardStats({ clientes }: DashboardStatsProps) {
  // Estadísticas generales
  const totalClientes = clientes.length;
  const clientesConfirmados = clientes.filter(
    (c) => c.estado_pago === "confirmado",
  ).length;
  const clientesPendientes = clientes.filter(
    (c) => c.estado_pago === "pendiente",
  ).length;
  const clientesSuspendidos = clientes.filter(
    (c) => c.estado_pago === "suspendido",
  ).length;

  // Cálculos financieros
  const ingresosMensualesEsperados = clientes.reduce(
    (acc, c) => acc + parseFloat(c.costo || "0"),
    0,
  );
  const ingresosConfirmados = clientes
    .filter((c) => c.estado_pago === "confirmado")
    .reduce((acc, c) => acc + parseFloat(c.costo || "0"), 0);
  const ingresosPendientes = clientes
    .filter((c) => c.estado_pago === "pendiente")
    .reduce((acc, c) => acc + parseFloat(c.costo || "0"), 0);
  const ingresosSuspendidos = clientes
    .filter((c) => c.estado_pago === "suspendido")
    .reduce((acc, c) => acc + parseFloat(c.costo || "0"), 0);

  // Tasas y porcentajes
  const tasaConfirmacion =
    totalClientes > 0
      ? ((clientesConfirmados / totalClientes) * 100).toFixed(1)
      : "0";
  const tasaSuspension =
    totalClientes > 0
      ? ((clientesSuspendidos / totalClientes) * 100).toFixed(1)
      : "0";

  // Facturas totales
  const totalFacturas = clientes.reduce(
    (acc, c) => acc + (c.facturas?.length || 0),
    0,
  );
  const facturasPagadas = clientes.reduce((acc, c) => {
    return (
      acc + (c.facturas?.filter((f) => f.estadoPago === "pagado").length || 0)
    );
  }, 0);
  const facturasPendientes = clientes.reduce((acc, c) => {
    return (
      acc +
      (c.facturas?.filter((f) => f.estadoPago === "pendiente").length || 0)
    );
  }, 0);

  // Clientes en mora (2+ facturas vencidas)
  const clientesEnMora = clientes.filter((c) => {
    const vencidas = c.facturas?.filter((f) => f.estadoPago === "vencido").length || 0;
    return vencidas >= 2;
  }).length;

  // Clientes en mora (exactamente 2 facturas vencidas)
  const clientesEnMora = clientes.filter((c) => {
    const vencidas =
      c.facturas?.filter((f) => f.estadoPago === "vencido").length || 0;
    return vencidas === 2 && c.estado_pago !== "suspendido";
  }).length;

  // Clientes con más de 2 facturas vencidas
  const clientesMasDe2Vencidas = clientes.filter((c) => {
    const vencidas =
      c.facturas?.filter((f) => f.estadoPago === "vencido").length || 0;
    return vencidas > 2;
  }).length;

  // Eficiencia de cobro
  const tasaCobro =
    totalFacturas > 0
      ? ((facturasPagadas / totalFacturas) * 100).toFixed(1)
      : "0";
  const tasaMorosidad =
    totalFacturas > 0
      ? ((facturasVencidas / totalFacturas) * 100).toFixed(1)
      : "0";

  // Ingresos por facturas
  const montoTotalFacturas = clientes.reduce((acc, c) => {
    return (
      acc +
      (c.facturas?.reduce((sum, f) => sum + parseFloat(f.monto || "0"), 0) || 0)
    );
  }, 0);
  const montoFacturasPagadas = clientes.reduce((acc, c) => {
    return (
      acc +
      (c.facturas
        ?.filter((f) => f.estadoPago === "pagado")
        .reduce((sum, f) => sum + parseFloat(f.monto || "0"), 0) || 0)
    );
  }, 0);
  const montoFacturasVencidas = clientes.reduce((acc, c) => {
    return (
      acc +
      (c.facturas
        ?.filter((f) => f.estadoPago === "vencido")
        .reduce((sum, f) => sum + parseFloat(f.monto || "0"), 0) || 0)
    );
  }, 0);

  // Promedio de facturas por cliente
  const promedioFacturasPorCliente =
    totalClientes > 0 ? (totalFacturas / totalClientes).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Análisis de Facturación */}
      <div>
        <h3 className="text-base font-medium mb-3 text-slate-400">Análisis de Facturación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden bg-[#0A1628]/80 border-slate-500/20 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent" />
            <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-400">Total Facturas</CardTitle>
              <div className="w-10 h-10 bg-slate-500/20 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-white">{totalFacturas}</div>
              <p className="text-xs text-slate-500 mt-1">
                Promedio: {promedioFacturasPorCliente} por cliente
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-[#0A1628]/80 border-green-500/20 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
            <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-green-400">Facturas Pagadas</CardTitle>
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-green-400">{facturasPagadas}</div>
              <p className="text-xs text-green-400/60 mt-1 font-medium">
                ${montoFacturasPagadas.toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-[#0A1628]/80 border-yellow-500/20 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-400" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-yellow-400">Facturas Pendientes</CardTitle>
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-yellow-400">
                {facturasPendientes}
              </div>
              <p className="text-xs text-yellow-400/60 mt-1">Por confirmar</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-[#0A1628]/80 border-red-500/20 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
            <div className="h-1 bg-gradient-to-r from-red-500 to-red-400" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-red-400">En Mora</CardTitle>
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-red-400">{clientesEnMora}</div>
              <p className="text-xs text-red-400/60 mt-1 font-medium">
                clientes con 2+ facturas vencidas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
