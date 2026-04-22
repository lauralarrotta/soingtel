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
          <h2 className="text-xl font-semibold">Panel de Administración</h2>
          <p className="text-sm text-muted-foreground">
            Vista general del sistema Soingtel
          </p>
        </div>
        <Badge className="bg-blue-500 hover:bg-blue-600 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Admin Dashboard
        </Badge>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Empresas registradas
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${ingresosMensualesEsperados.toFixed(0)}
            </div>
            <p className="text-xs text-green-600 mt-1 font-medium">
              ${ingresosConfirmados.toFixed(0)} confirmados
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Confirmación</CardTitle>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tasaConfirmacion}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clientesConfirmados} de {totalClientes} clientes
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-400" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia de Cobro</CardTitle>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tasaCobro}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={parseFloat(tasaCobro)} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {facturasPagadas}/{totalFacturas} facturas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Facturación */}
      <div>
        <h3 className="text-base font-medium mb-3 text-muted-foreground">Análisis de Facturación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalFacturas}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Promedio: {promedioFacturasPorCliente} por cliente
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-green-200">
            <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Facturas Pagadas</CardTitle>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{facturasPagadas}</div>
              <p className="text-xs text-green-600 mt-1 font-medium">
                ${montoFacturasPagadas.toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-yellow-200">
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-400" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Facturas Pendientes</CardTitle>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">
                {facturasPendientes}
              </div>
              <p className="text-xs text-yellow-600 mt-1">Por confirmar</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-red-200">
            <div className="h-1 bg-gradient-to-r from-red-500 to-red-400" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Facturas Vencidas</CardTitle>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">{facturasVencidas}</div>
              <p className="text-xs text-red-600 mt-1 font-medium">
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
          <h3 className="text-lg mb-3 flex items-center gap-2 text-orange-700">
            <AlertTriangle className="h-5 w-5" />
            Alertas Críticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clientesEnMora > 0 && (
              <Card className="border-orange-300 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                    <Ban className="h-4 w-4" />
                    Pendientes de Suspensión
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-orange-700 mb-2">
                    {clientesEnMora}
                  </div>
                  <p className="text-sm text-orange-600">
                    Clientes con exactamente 2 facturas vencidas
                  </p>
                  <Badge className="bg-orange-500 mt-2">Acción requerida</Badge>
                </CardContent>
              </Card>
            )}

            {clientesMasDe2Vencidas > 0 && (
              <Card className="border-red-300 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                    <Ban className="h-4 w-4" />
                    Mora Crítica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-red-700 mb-2">
                    {clientesMasDe2Vencidas}
                  </div>
                  <p className="text-sm text-red-600">
                    Clientes con más de 2 facturas vencidas
                  </p>
                  <Badge className="bg-red-500 mt-2">Urgente</Badge>
                </CardContent>
              </Card>
            )}

            {parseFloat(tasaMorosidad) > 15 && (
              <Card className="border-yellow-300 bg-yellow-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-yellow-700">
                    <Percent className="h-4 w-4" />
                    Tasa de Morosidad Alta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-yellow-700 mb-2">
                    {tasaMorosidad}%
                  </div>
                  <p className="text-sm text-yellow-600">
                    Se recomienda gestión de cobranza
                  </p>
                  <Badge className="bg-yellow-500 mt-2">Atención</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Detalles por estado de clientes */}
      <div>
        <h3 className="text-lg mb-3">Estado de Clientes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-700 mb-3">
                {clientesConfirmados}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Ingresos mensuales:
                  </span>
                  <span className="text-green-600">
                    ${ingresosConfirmados.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={parseFloat(tasaConfirmacion)}
                  className="h-2"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Porcentaje:</span>
                  <span className="text-green-600">{tasaConfirmacion}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-yellow-700 mb-3">
                {clientesPendientes}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">En riesgo:</span>
                  <span className="text-yellow-600">
                    ${ingresosPendientes.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={
                    totalClientes > 0
                      ? (clientesPendientes / totalClientes) * 100
                      : 0
                  }
                  className="h-2"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Porcentaje:</span>
                  <span className="text-yellow-600">
                    {totalClientes > 0
                      ? ((clientesPendientes / totalClientes) * 100).toFixed(1)
                      : "0"}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Ban className="h-4 w-4 text-red-600" />
                Suspendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-red-700 mb-3">
                {clientesSuspendidos}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Pérdidas mensuales:
                  </span>
                  <span className="text-red-600">
                    ${ingresosSuspendidos.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={parseFloat(tasaSuspension)}
                  className="h-2 bg-red-200"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tasa de suspensión:
                  </span>
                  <span className="text-red-600">{tasaSuspension}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumen Financiero */}
      <div>
        <h3 className="text-lg mb-3">Resumen Financiero</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Flujo de Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total facturado:</span>
                  <span className="text-lg">
                    ${montoTotalFacturas.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-green-600">
                  <span className="text-sm">✓ Cobrado:</span>
                  <span className="text-lg">
                    ${montoFacturasPagadas.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-red-600">
                  <span className="text-sm">✗ En mora:</span>
                  <span className="text-lg">
                    ${montoFacturasVencidas.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasa de recuperación:</span>
                    <Badge className="bg-blue-500">
                      {montoTotalFacturas > 0
                        ? (
                            (montoFacturasPagadas / montoTotalFacturas) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                Indicadores de Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Eficiencia de cobro:</span>
                    <span className="text-sm">{tasaCobro}%</span>
                  </div>
                  <Progress value={parseFloat(tasaCobro)} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Tasa de confirmación:</span>
                    <span className="text-sm">{tasaConfirmacion}%</span>
                  </div>
                  <Progress
                    value={parseFloat(tasaConfirmacion)}
                    className="h-2"
                  />
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estado general:</span>
                    <Badge
                      className={
                        parseFloat(tasaCobro) >= 80
                          ? "bg-green-500"
                          : parseFloat(tasaCobro) >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }
                    >
                      {parseFloat(tasaCobro) >= 80
                        ? "Excelente"
                        : parseFloat(tasaCobro) >= 60
                          ? "Bueno"
                          : "Requiere atención"}
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
        <h3 className="text-lg mb-3">Recomendaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parseFloat(tasaSuspension) > 20 && (
            <Card className="border-orange-300 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-4 w-4" />
                  Tasa de suspensión elevada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  La tasa de suspensión es de {tasaSuspension}%. Se recomienda
                  revisar los clientes suspendidos y tomar acciones para
                  recuperar estos servicios.
                </p>
              </CardContent>
            </Card>
          )}

          {parseFloat(tasaMorosidad) > 15 && (
            <Card className="border-yellow-300 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  Morosidad alta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700">
                  {tasaMorosidad}% de las facturas están vencidas. Considere
                  implementar estrategias de cobranza más agresivas.
                </p>
              </CardContent>
            </Card>
          )}

          {clientesEnMora > 0 && (
            <Card className="border-red-300 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                  <Ban className="h-4 w-4" />
                  Acción requerida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">
                  Hay {clientesEnMora}{" "}
                  {clientesEnMora === 1 ? "cliente" : "clientes"} con
                  exactamente 2 facturas vencidas. Es momento de gestionar la
                  suspensión del servicio.
                </p>
              </CardContent>
            </Card>
          )}

          {parseFloat(tasaCobro) >= 90 && (
            <Card className="border-green-300 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Excelente rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  La eficiencia de cobro es del {tasaCobro}%. ¡El sistema está
                  funcionando de manera óptima!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
