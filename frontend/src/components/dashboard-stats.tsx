import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  FileText,
  Calendar,
  Activity,
  Percent,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

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
  const facturasVencidas = clientes.reduce((acc, c) => {
    return (
      acc + (c.facturas?.filter((f) => f.estadoPago === "vencido").length || 0)
    );
  }, 0);

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
      {/* Título del Dashboard */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Panel de Administración</h2>
          <p className="text-sm text-cyan-400/70">
            Sistema Soingtel • Starlink Management
          </p>
        </div>
        <Badge className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 gap-1.5 px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Admin Dashboard
        </Badge>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-[#0A1628]/80 border-cyan-500/20 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-cyan-400" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">Total Clientes</CardTitle>
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center glow-cyan">
              <Users className="h-5 w-5 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-white">{totalClientes}</div>
            <p className="text-xs text-cyan-400/60 mt-1">
              Empresas registradas
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-[#0A1628]/80 border-green-500/20 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">Ingresos Mensuales</CardTitle>
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white">
              ${ingresosMensualesEsperados.toFixed(0)}
            </div>
            <p className="text-xs text-green-400 mt-1 font-medium">
              ${ingresosConfirmados.toFixed(0)} confirmados
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-[#0A1628]/80 border-emerald-500/20 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">Tasa de Confirmación</CardTitle>
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-white">{tasaConfirmacion}%</div>
            <p className="text-xs text-slate-400 mt-1">
              {clientesConfirmados} de {totalClientes} clientes
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-[#0A1628]/80 border-purple-500/20 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
          <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-400" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">Eficiencia de Cobro</CardTitle>
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-white">{tasaCobro}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={parseFloat(tasaCobro)} className="h-2 bg-slate-800" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {facturasPagadas}/{totalFacturas} facturas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Facturación */}
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
              <CardTitle className="text-sm font-medium text-red-400">Facturas Vencidas</CardTitle>
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-red-400">{facturasVencidas}</div>
              <p className="text-xs text-red-400/60 mt-1 font-medium">
                ${montoFacturasVencidas.toFixed(0)} en mora
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alertas Críticas */}
      {(clientesEnMora > 0 ||
        clientesMasDe2Vencidas > 0 ||
        parseFloat(tasaMorosidad) > 15) && (
        <div>
          <h3 className="text-base font-medium mb-3 flex items-center gap-2 text-orange-400">
            <AlertTriangle className="h-5 w-5" />
            Alertas Críticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clientesEnMora > 0 && (
              <Card className="relative overflow-hidden bg-[#0A1628]/80 border-orange-500/30 backdrop-blur">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
                <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-400" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="text-sm flex items-center gap-2 text-orange-400">
                    <Ban className="h-4 w-4" />
                    Pendientes de Suspensión
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-bold text-orange-400 mb-2">
                    {clientesEnMora}
                  </div>
                  <p className="text-xs text-orange-400/70">
                    Clientes con exactamente 2 facturas vencidas
                  </p>
                  <Badge className="bg-orange-500/20 border border-orange-500/30 text-orange-400 mt-2">Acción requerida</Badge>
                </CardContent>
              </Card>
            )}

            {clientesMasDe2Vencidas > 0 && (
              <Card className="relative overflow-hidden bg-[#0A1628]/80 border-red-500/30 backdrop-blur">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
                <div className="h-1 bg-gradient-to-r from-red-500 to-red-400" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                    <Ban className="h-4 w-4" />
                    Mora Crítica
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-bold text-red-400 mb-2">
                    {clientesMasDe2Vencidas}
                  </div>
                  <p className="text-xs text-red-400/70">
                    Clientes con más de 2 facturas vencidas
                  </p>
                  <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 mt-2">Urgente</Badge>
                </CardContent>
              </Card>
            )}

            {parseFloat(tasaMorosidad) > 15 && (
              <Card className="relative overflow-hidden bg-[#0A1628]/80 border-yellow-500/30 backdrop-blur">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent" />
                <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-400" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
                    <Percent className="h-4 w-4" />
                    Tasa de Morosidad Alta
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">
                    {tasaMorosidad}%
                  </div>
                  <p className="text-xs text-yellow-400/70">
                    Se recomienda gestión de cobranza
                  </p>
                  <Badge className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 mt-2">Atención</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Detalles por estado de clientes */}
      <div>
        <h3 className="text-base font-medium mb-3 text-slate-400">Estado de Clientes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="relative overflow-hidden bg-[#0A1628]/80 border-green-500/20 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
            <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-green-400 mb-3">
                {clientesConfirmados}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Ingresos mensuales:
                  </span>
                  <span className="text-green-400 font-medium">
                    ${ingresosConfirmados.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={parseFloat(tasaConfirmacion)}
                  className="h-2 bg-slate-800"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Porcentaje:</span>
                  <span className="text-green-400 font-medium">{tasaConfirmacion}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-[#0A1628]/80 border-yellow-500/20 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-400" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
                <Clock className="h-4 w-4" />
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-yellow-400 mb-3">
                {clientesPendientes}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">En riesgo:</span>
                  <span className="text-yellow-400 font-medium">
                    ${ingresosPendientes.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={
                    totalClientes > 0
                      ? (clientesPendientes / totalClientes) * 100
                      : 0
                  }
                  className="h-2 bg-slate-800"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Porcentaje:</span>
                  <span className="text-yellow-400 font-medium">
                    {totalClientes > 0
                      ? ((clientesPendientes / totalClientes) * 100).toFixed(1)
                      : "0"}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-[#0A1628]/80 border-red-500/20 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
            <div className="h-1 bg-gradient-to-r from-red-500 to-red-400" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                <Ban className="h-4 w-4" />
                Suspendidos
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-red-400 mb-3">
                {clientesSuspendidos}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Pérdidas mensuales:
                  </span>
                  <span className="text-red-400 font-medium">
                    ${ingresosSuspendidos.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={parseFloat(tasaSuspension)}
                  className="h-2 bg-slate-800"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Tasa de suspensión:
                  </span>
                  <span className="text-red-400 font-medium">{tasaSuspension}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumen Financiero */}
      <div>
        <h3 className="text-base font-medium mb-3 text-slate-400">Resumen Financiero</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="relative overflow-hidden bg-[#0A1628]/80 border-blue-500/20 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-400">
                <DollarSign className="h-4 w-4" />
                Flujo de Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total facturado:</span>
                  <span className="text-lg font-bold text-white">${montoTotalFacturas.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-green-400">
                  <span className="text-sm">✓ Cobrado:</span>
                  <span className="text-lg font-bold">${montoFacturasPagadas.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-red-400">
                  <span className="text-sm">✗ En mora:</span>
                  <span className="text-lg font-bold">${montoFacturasVencidas.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Tasa de recuperación:</span>
                    <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-400">
                      {montoTotalFacturas > 0 ? ((montoFacturasPagadas / montoTotalFacturas) * 100).toFixed(1) : "0"}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-[#0A1628]/80 border-purple-500/20 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
            <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-400" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-400">
                <Activity className="h-4 w-4" />
                Indicadores de Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-400">Eficiencia de cobro:</span>
                    <span className="text-sm text-purple-400 font-medium">{tasaCobro}%</span>
                  </div>
                  <Progress value={parseFloat(tasaCobro)} className="h-2 bg-slate-800" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-400">Tasa de confirmación:</span>
                    <span className="text-sm text-purple-400 font-medium">{tasaConfirmacion}%</span>
                  </div>
                  <Progress value={parseFloat(tasaConfirmacion)} className="h-2 bg-slate-800" />
                </div>
                <div className="pt-2 border-t border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Estado general:</span>
                    <Badge className={parseFloat(tasaCobro) >= 80 ? "bg-green-500/20 border border-green-500/30 text-green-400" : parseFloat(tasaCobro) >= 60 ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400" : "bg-red-500/20 border border-red-500/30 text-red-400"}>
                      {parseFloat(tasaCobro) >= 80 ? "Excelente" : parseFloat(tasaCobro) >= 60 ? "Bueno" : "Requiere atención"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recomendaciones del Sistema */}
      <div>
        <h3 className="text-base font-medium mb-3 text-slate-400">Recomendaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parseFloat(tasaSuspension) > 20 && (
            <Card className="relative overflow-hidden bg-[#0A1628]/80 border-orange-500/20 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
              <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-400" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-400">
                  <AlertTriangle className="h-4 w-4" />
                  Tasa de suspensión elevada
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-slate-400">
                  La tasa de suspensión es de {tasaSuspension}%. Se recomienda revisar los clientes suspendidos y tomar acciones para recuperar estos servicios.
                </p>
              </CardContent>
            </Card>
          )}

          {parseFloat(tasaMorosidad) > 15 && (
            <Card className="relative overflow-hidden bg-[#0A1628]/80 border-yellow-500/20 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
              <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-400" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="h-4 w-4" />
                  Morosidad alta
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-slate-400">
                  {tasaMorosidad}% de las facturas están vencidas. Considere implementar estrategias de cobranza más agresivas.
                </p>
              </CardContent>
            </Card>
          )}

          {clientesEnMora > 0 && (
            <Card className="relative overflow-hidden bg-[#0A1628]/80 border-red-500/20 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
              <div className="h-1 bg-gradient-to-r from-red-500 to-red-400" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                  <Ban className="h-4 w-4" />
                  Acción requerida
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-slate-400">
                  Hay {clientesEnMora} {clientesEnMora === 1 ? "cliente" : "clientes"} con exactamente 2 facturas vencidas. Es momento de gestionar la suspensión del servicio.
                </p>
              </CardContent>
            </Card>
          )}

          {parseFloat(tasaCobro) >= 90 && (
            <Card className="relative overflow-hidden bg-[#0A1628]/80 border-green-500/20 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
              <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  Excelente rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-slate-400">
                  La eficiencia de cobro es del {tasaCobro}%. ¡El sistema está funcionando de manera óptima!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
