import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

const meses = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

interface ROCFiltroPeriodoProps {
  mes: string;
  anio: string;
  onMesChange: (mes: string) => void;
  onAnioChange: (anio: string) => void;
  onBuscar: () => void;
  rocCount: number;
  loading?: boolean;
}

export function ROCFiltroPeriodo({
  mes,
  anio,
  onMesChange,
  onAnioChange,
  onBuscar,
  rocCount,
  loading,
}: ROCFiltroPeriodoProps) {
  const anioActual = new Date().getFullYear();
  const anios = [anioActual, anioActual - 1, anioActual - 2, anioActual - 3, anioActual - 4];

  return (
    <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-[#0F2744]/80 dark:to-[#0A1628]/80 rounded-xl p-4 mb-6 border border-purple-100/50 dark:border-purple-500/20">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <Label className="text-sm font-medium mb-2 block text-purple-600 dark:text-purple-400">
            Clientes con ROC por Periodo
          </Label>
          <div className="flex gap-2 flex-wrap">
            <Select value={mes} onValueChange={onMesChange}>
              <SelectTrigger className="w-[140px] bg-white/80 dark:bg-[#0A1628]/80 border-purple-200/50 dark:border-purple-500/30">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0A1628] border-purple-200/50 dark:border-purple-500/30">
                {meses.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={anio} onValueChange={onAnioChange}>
              <SelectTrigger className="w-[120px] bg-white/80 dark:bg-[#0A1628]/80 border-purple-200/50 dark:border-purple-500/30">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0A1628] border-purple-200/50 dark:border-purple-500/30">
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
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
        <div className="text-center px-6 py-3 bg-white/50 dark:bg-[#0A1628]/50 rounded-lg border border-purple-200/50 dark:border-purple-500/30">
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
            {loading ? "-" : rocCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {meses.find((m) => m.value === mes)?.label} {anio}
          </p>
        </div>
      </div>
    </div>
  );
}
