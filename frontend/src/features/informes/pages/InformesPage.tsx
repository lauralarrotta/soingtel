import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PeriodoFiltro } from "../components/ROCFiltroPeriodo";
import { informesService, InformesStats } from "@/services/informesService";
import { RefreshCw, FileText, CheckCircle, Clock, Ban, AlertTriangle, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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
  const [sede, setSede] = useState("principal");
  const [hasSearched, setHasSearched] = useState(false);

  // Modal de detalle
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailType, setDetailType] = useState<string>("");
  const [detailTitle, setDetailTitle] = useState<string>("");
  const [detailData, setDetailData] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const displayValue = (value: number, sinFacturas?: boolean) => {
    if (sinFacturas) return "Sin facturas";
    return value;
  };

  const buscarInformes = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await informesService.obtenerEstadisticas(periodo, anio, sede);
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

  // Abrir modal de detalle
  const abrirDetalle = async (type: string, title: string) => {
    setDetailType(type);
    setDetailTitle(title);
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const data = await informesService.obtenerDetalle(periodo, anio, sede, type);
      setDetailData(data);
    } catch (error) {
      console.error("Error cargando detalle:", error);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const statCards = stats ? [
    {
      title: "Facturados",
      value: stats.facturado,
      icon: FileText,
      color: "cyan",
      description: "Con factura generada en el periodo",
      bgClass: "border-cyan-500/20",
      iconClass: "text-cyan-400",
      valueClass: "text-cyan-400",
      type: "facturado",
    },
    {
      title: "Pagados",
      value: stats.pagados,
      icon: CheckCircle,
      color: "green",
      description: "Ya pagaron en el periodo",
      bgClass: "border-green-500/20",
      iconClass: "text-green-500",
      valueClass: "text-green-400",
      type: "pagado",
    },
    {
      title: "Pendientes",
      value: stats.pendientes,
      icon: Clock,
      color: "yellow",
      description: "Factura pendiente en el periodo",
      bgClass: "border-yellow-500/20",
      iconClass: "text-yellow-500",
      valueClass: "text-yellow-400",
      type: "pendiente",
    },
    {
      title: "PPC",
      value: stats.ppc,
      icon: Clock,
      color: "orange",
      description: "Pausa por pago en el periodo",
      bgClass: "border-orange-500/20",
      iconClass: "text-orange-500",
      valueClass: "text-orange-400",
      type: "ppc",
    },
    {
      title: "ROC",
      value: stats.roc,
      icon: AlertTriangle,
      color: "purple",
      description: "Reclamación en el periodo",
      bgClass: "border-purple-500/20",
      iconClass: "text-purple-500",
      valueClass: "text-purple-400",
      type: "roc",
    },
    {
      title: "x Facturar",
      value: stats.pendientesFacturar,
      icon: FileText,
      color: "slate",
      description: "Sin factura en el periodo",
      bgClass: "border-slate-500/20",
      iconClass: "text-slate-400",
      valueClass: "text-slate-400",
      type: "pendientesFacturar",
    },
    {
      title: "En Mora",
      value: stats.enMora,
      icon: AlertTriangle,
      color: "rose",
      description: "2+ facturas vencidas/pendientes del periodo",
      bgClass: "border-rose-500/20",
      iconClass: "text-rose-500",
      valueClass: "text-rose-400",
      type: "enMora",
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
      type: "suspendido",
    },
  ] : [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-black">Informes por Periodo</h2>
          <p className="text-sm text-cyan-400/70">
            Estadísticas de facturación del sistema
          </p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-[#0F2744]/80 dark:to-[#0A1628]/80 rounded-xl p-4 mb-6 border border-cyan-100/50 dark:border-cyan-500/20">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Periodo seleccionado - Izquierda */}
          <div className="px-6 py-3 bg-white/50 dark:bg-[#0A1628]/50 rounded-lg border border-cyan-200/50 dark:border-cyan-500/30">
            <p className="text-sm text-muted-foreground text-center">
              Periodo seleccionado
            </p>
            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 text-center">
              {PERIODOS_DISPLAY[periodo] || periodo} {anio}
            </p>
          </div>

          {/* Periodo y Año - Centro */}
          <PeriodoFiltro
            periodo={periodo}
            anio={anio}
            onPeriodoChange={setPeriodo}
            onAnioChange={setAnio}
            onBuscar={buscarInformes}
            loading={loading}
          />

          {/* Sede - Derecha */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
              Sede
            </Label>
            <Select value={sede} onValueChange={(v) => { setSede(v); }}>
              <SelectTrigger className="w-[140px] bg-white/80 dark:bg-[#0A1628]/80 border-cyan-200/50 dark:border-cyan-500/30">
                <SelectValue placeholder="Sede" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0A1628] border-cyan-200/50 dark:border-cyan-500/30">
                <SelectItem value="principal">Principal</SelectItem>
                <SelectItem value="fusagasuga">Fusagasuga</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const displayVal = card.title === "Facturados" ? displayValue(card.value, stats.sinFacturas) : card.value;
            return (
              <Card
                key={card.title}
                onClick={() => abrirDetalle(card.type, card.title)}
                className={`bg-[#0A1628]/80 ${card.bgClass} cursor-pointer hover:ring-2 hover:ring-white/20 transition-all`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 text-base ${card.iconClass}`}>
                    <Icon className="h-5 w-5" />
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-5xl font-bold ${card.valueClass} mb-2`}>
                    {displayVal}
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

      {/* Modal de Detalle */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] h-[85vh] overflow-hidden flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="text-xl mb-4">{detailTitle} - {PERIODOS_DISPLAY[periodo] || periodo} {anio}</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
          ) : (
            <div className="overflow-auto flex-1">
              {detailData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay datos</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kit</TableHead>
                      <TableHead>Cliente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailData.map((cliente) => (
                      <TableRow key={cliente.kit}>
                        <TableCell className="font-mono">{cliente.kit}</TableCell>
                        <TableCell>{cliente.nombre_cliente}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
