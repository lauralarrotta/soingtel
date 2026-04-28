import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodoFiltro } from "../components/ROCFiltroPeriodo";
import { informesService, InformesStats } from "@/services/informesService";
import { RefreshCw, FileText, CheckCircle, Clock, Ban, AlertTriangle, DollarSign } from "lucide-react";

interface InformesPageProps {
  userType?: string;
}

const PERIODOS_DISPLAY: Record<string, string> = {
  "ene-feb": "Ene - Feb",
  "feb-mar": "Feb - Mar",
  "mar-abr": "Mar - Abr",
  "abr-may": "Abr - May",
  "may-jun": "May - Jun",
  "jun-jul": "Jun - Jul",
  "jul-ago": "Jul - Ago",
  "ago-sep": "Ago - Sep",
  "sep-oct": "Sep - Oct",
  "oct-nov": "Oct - Nov",
  "nov-dic": "Nov - Dic",
  "dic-ene": "Dic - Ene",
};

export function InformesPage({ userType = "admin" }: InformesPageProps) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<InformesStats | null>(null);
  const [periodo, setPeriodo] = useState("ene-feb");
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [hasSearched, setHasSearched] = useState(false);

  const buscarInformes = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await informesService.obtenerEstadisticas(periodo, anio);
      setStats(data);
    } catch (error) {
      console.error("Error cargando informes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarInformes();
  }, []);

  const statCards = stats ? [
    {
      title: "Facturados",
      value: stats.facturado,
      icon: CheckCircle,
      color: "green",
      description: "Clientes que pagaron en el periodo",
      bgClass: "border-green-500/20",
      iconClass: "text-green-500",
      valueClass: "text-green-400",
    },
    {
      title: "PPC",
      value: stats.ppc,
      icon: Clock,
      color: "orange",
      description: "Clientes en pausa por pago",
      bgClass: "border-orange-500/20",
      iconClass: "text-orange-500",
      valueClass: "text-orange-400",
    },
    {
      title: "Pendientes",
      value: stats.pendiente,
      icon: FileText,
      color: "yellow",
      description: "Facturas pendientes de pago",
      bgClass: "border-yellow-500/20",
      iconClass: "text-yellow-500",
      valueClass: "text-yellow-400",
    },
    {
      title: "ROC",
      value: stats.roc,
      icon: AlertTriangle,
      color: "purple",
      description: "Clientes con reclamación",
      bgClass: "border-purple-500/20",
      iconClass: "text-purple-500",
      valueClass: "text-purple-400",
    },
    {
      title: "Suspendidos",
      value: stats.suspendido,
      icon: Ban,
      color: "red",
      description: "Clientes suspendidos",
      bgClass: "border-red-500/20",
      iconClass: "text-red-500",
      valueClass: "text-red-400",
    },
    {
      title: "En Mora",
      value: stats.enMora,
      icon: AlertTriangle,
      color: "rose",
      description: "Clientes con 2+ facturas vencidas",
      bgClass: "border-rose-500/20",
      iconClass: "text-rose-500",
      valueClass: "text-rose-400",
    },
  ] : [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Informes por Periodo</h2>
          <p className="text-sm text-cyan-400/70">
            Estadísticas de facturación del sistema
          </p>
        </div>
        <Badge className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 gap-1.5 px-3 py-1">
          <FileText className="h-4 w-4" />
          Admin Reports
        </Badge>
      </div>

      {/* Period Filter */}
      <PeriodoFiltro
        periodo={periodo}
        anio={anio}
        onPeriodoChange={setPeriodo}
        onAnioChange={setAnio}
        onBuscar={buscarInformes}
        loading={loading}
      />

      {/* Period Title */}
      {hasSearched && stats && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white">
            Resultados para:{" "}
            <span className="text-cyan-400">
              {PERIODOS_DISPLAY[periodo] || periodo} {anio}
            </span>
          </h3>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-500" />
          <span className="ml-3 text-muted-foreground">Cargando estadísticas...</span>
        </div>
      )}

      {/* No Search Yet */}
      {!hasSearched && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Selecciona un periodo y haz clic en "Ver Informe"</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && !loading && (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className={`bg-[#0A1628]/80 ${card.bgClass}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 text-base ${card.iconClass}`}>
                    <Icon className="h-5 w-5" />
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-5xl font-bold ${card.valueClass} mb-2`}>
                    {card.value}
                  </div>
                  <p className="text-sm text-slate-400">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Card */}
      {stats && !loading && (
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen del Periodo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Total Clientes Facturados</p>
                  <p className="text-2xl font-bold text-green-400">{stats.facturado}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Pendientes de Pago</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pendiente}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">En Proceso (PPC/ROC)</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.ppc + stats.roc}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Sin Servicio</p>
                  <p className="text-2xl font-bold text-red-400">{stats.suspendido}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
