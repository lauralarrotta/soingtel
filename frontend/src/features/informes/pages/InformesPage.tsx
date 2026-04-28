import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InformesStatsCards } from "../components/InformesStatsCards";
import { ROCFiltroPeriodo } from "../components/ROCFiltroPeriodo";
import { informesService, InformesStats } from "@/services/informesService";
import { RefreshCw, FileText, CheckCircle, Clock, Ban, AlertTriangle } from "lucide-react";

interface InformesPageProps {
  userType?: string;
}

export function InformesPage({ userType = "admin" }: InformesPageProps) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<InformesStats>({
    total: 0,
    ppc: 0,
    danadas: 0,
    suspendidas: 0,
    garantias: 0,
    transferidas: 0,
    pendientesFacturar: 0,
    enMora: 0,
    rocPorPeriodo: 0,
  });
  const [rocMes, setRocMes] = useState((new Date().getMonth() + 1).toString());
  const [rocAnio, setRocAnio] = useState(new Date().getFullYear().toString());

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const data = await informesService.obtenerEstadisticas();
      setStats(data);
    } catch (error) {
      console.error("Error cargando informes:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarROCPorPeriodo = async () => {
    setLoading(true);
    try {
      const data = await informesService.obtenerEstadisticas(rocMes, rocAnio);
      setStats((prev) => ({ ...prev, rocPorPeriodo: data.rocPorPeriodo }));
    } catch (error) {
      console.error("Error buscando ROC:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const getMesNombre = (mes: string | number) => {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const m = typeof mes === 'string' ? parseInt(mes) : mes;
    return meses[m - 1] || "";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Informes y Estadisticas</h2>
          <p className="text-sm text-cyan-400/70">Panel de reportes generales del sistema</p>
        </div>
        <Badge className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 gap-1.5 px-3 py-1">
          <FileText className="h-4 w-4" />
          Admin Reports
        </Badge>
      </div>

      {/* Summary Cards */}
      <InformesStatsCards estadisticas={stats} loading={loading} />

      {/* ROC Period Filter */}
      <ROCFiltroPeriodo
        mes={rocMes}
        anio={rocAnio}
        onMesChange={setRocMes}
        onAnioChange={setRocAnio}
        onBuscar={buscarROCPorPeriodo}
        rocCount={stats.rocPorPeriodo}
        loading={loading}
      />

      {/* Detailed Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Clientes Activos */}
        <Card className="bg-[#0A1628]/80 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5" />
              Clientes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white mb-3">{stats.total}</div>
            <p className="text-sm text-slate-400">
              Clientes con servicio activo y pagos al día
            </p>
          </CardContent>
        </Card>

        {/* Clientes Pausados PPC */}
        <Card className="bg-[#0A1628]/80 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-400 flex items-center gap-2 text-base">
              <Clock className="h-5 w-5" />
              Clientes Pausados PPC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-orange-400 mb-3">{stats.ppc}</div>
            <p className="text-sm text-slate-400">
              Clientes en pausa por problema de pago
            </p>
          </CardContent>
        </Card>

        {/* Pendientes por Facturar */}
        <Card className="bg-[#0A1628]/80 border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400 flex items-center gap-2 text-base">
              <FileText className="h-5 w-5" />
              Pendientes por Facturar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-yellow-400 mb-3">{stats.pendientesFacturar}</div>
            <p className="text-sm text-slate-400">
              Clientes con estado facturado pendientes de pago
            </p>
          </CardContent>
        </Card>

        {/* Clientes Suspendidos */}
        <Card className="bg-[#0A1628]/80 border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-400 flex items-center gap-2 text-base">
              <Ban className="h-5 w-5" />
              Clientes Suspendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-red-400 mb-3">{stats.suspendidas}</div>
            <p className="text-sm text-slate-400">
              Clientes con servicio suspendido por mora
            </p>
          </CardContent>
        </Card>

        {/* Clientes en Mora */}
        <Card className="bg-[#0A1628]/80 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-400 flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" />
              Clientes en Mora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-purple-400 mb-3">{stats.enMora}</div>
            <p className="text-sm text-slate-400">
              Clientes con 2 o más facturas vencidas
            </p>
          </CardContent>
        </Card>

        {/* ROC por Periodo */}
        <Card className="bg-[#0A1628]/80 border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-cyan-400 flex items-center gap-2 text-base">
              <FileText className="h-5 w-5" />
              ROC en Periodo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-cyan-400 mb-3">{stats.rocPorPeriodo}</div>
            <p className="text-sm text-slate-400">
              Clientes con facturas ROC en {getMesNombre(rocMes)} {rocAnio}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
