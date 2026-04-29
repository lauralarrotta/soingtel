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

interface Estadisticas {
  total: number;
  ppc: number;
  danadas: number;
  suspendidas: number;
  garantias: number;
  transferidas: number;
  totalFacturas: number;
  facturasPagadas: number;
  facturasPendientes: number;
  facturasVencidas: number;
}

interface DashboardStatsProps {
  estadisticas?: Estadisticas;
}

export function DashboardStats({ estadisticas }: DashboardStatsProps) {
  const totalClientes = estadisticas?.total || 0;
  const totalFacturas = estadisticas?.totalFacturas || 0;
  const facturasPagadas = estadisticas?.facturasPagadas || 0;
  const facturasPendientes = estadisticas?.facturasPendientes || 0;
  const facturasVencidas = estadisticas?.facturasVencidas || 0;
  const clientesEnMora = estadisticas?.clientesEnMora || 0;

  const promedioFacturasPorCliente = totalClientes > 0 ? (totalFacturas / totalClientes).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium mb-3 text-slate-400">Analisis de Facturacion</h3>
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
                confirmadas
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
                clientes con 2+ vencidas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
