import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Calendar } from "lucide-react";

// Periodos como "ene-feb", "feb-mar", etc.
const periodos = [
  { value: "ene-feb", label: "Ene - Feb" },
  { value: "feb-mar", label: "Feb - Mar" },
  { value: "mar-abr", label: "Mar - Abr" },
  { value: "abr-may", label: "Abr - May" },
  { value: "may-jun", label: "May - Jun" },
  { value: "jun-jul", label: "Jun - Jul" },
  { value: "jul-ago", label: "Jul - Ago" },
  { value: "ago-sep", label: "Ago - Sep" },
  { value: "sep-oct", label: "Sep - Oct" },
  { value: "oct-nov", label: "Oct - Nov" },
  { value: "nov-dic", label: "Nov - Dic" },
  { value: "dic-ene", label: "Dic - Ene" },
];

interface PeriodoFiltroProps {
  periodo: string;
  anio: string;
  onPeriodoChange: (periodo: string) => void;
  onAnioChange: (anio: string) => void;
  onBuscar: () => void;
  loading?: boolean;
}

export function PeriodoFiltro({
  periodo,
  anio,
  onPeriodoChange,
  onAnioChange,
  onBuscar,
  loading,
}: PeriodoFiltroProps) {
  const anioActual = new Date().getFullYear();
  const anios = [anioActual, anioActual - 1, anioActual - 2, anioActual - 3];

  const periodoSeleccionado = periodos.find((p) => p.value === periodo)?.label || "";

  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div>
        <Label className="text-sm font-medium mb-2 block text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Periodo
        </Label>
        <div className="flex gap-2 flex-wrap">
          <Select value={periodo} onValueChange={onPeriodoChange}>
            <SelectTrigger className="w-[140px] bg-white/80 dark:bg-[#0A1628]/80 border-cyan-200/50 dark:border-cyan-500/30">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0A1628] border-cyan-200/50 dark:border-cyan-500/30">
              {periodos.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={anio} onValueChange={onAnioChange}>
            <SelectTrigger className="w-[120px] bg-white/80 dark:bg-[#0A1628]/80 border-cyan-200/50 dark:border-cyan-500/30">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0A1628] border-cyan-200/50 dark:border-cyan-500/30">
              {anios.map((a) => (
                <SelectItem key={a} value={a.toString()}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={onBuscar}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            Ver Informe
          </Button>
        </div>
      </div>
    </div>
  );
}
