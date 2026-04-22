import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FusagasugaFiltersProps {
  searchTerm: string;
  filterEstado: string;
  filterCorte: string;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onCorteChange: (value: string) => void;
  onLimpiarFiltros: () => void;
}

export function FusagasugaFilters({
  searchTerm,
  filterEstado,
  filterCorte,
  onSearchChange,
  onEstadoChange,
  onCorteChange,
  onLimpiarFiltros,
}: FusagasugaFiltersProps) {
  const showLimpiar = filterEstado !== 'todos' || filterCorte !== 'todos' || searchTerm !== '';

  return (
    <div className="bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-[#0F2744]/80 dark:to-[#0A1628]/80 rounded-xl p-4 mb-6 border border-cyan-100/50 dark:border-cyan-500/20">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <Input
            placeholder="Buscar por nombre, cuenta o email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/80 dark:bg-[#0A1628]/80 border-cyan-200/50 dark:border-cyan-500/30 focus:border-cyan-500 focus:ring-cyan-500/20"
          />
        </div>

        <Select value={filterEstado} onValueChange={onEstadoChange}>
          <SelectTrigger className="w-full md:w-[200px] bg-white/80 dark:bg-[#0A1628]/80 border-cyan-200/50 dark:border-cyan-500/30 focus:ring-cyan-500/20">
            <SelectValue placeholder="Estado de pago" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#0A1628] border-cyan-200/50 dark:border-cyan-500/30">
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="mora">Mora</SelectItem>
            <SelectItem value="suspendido">Suspendido</SelectItem>
            <SelectItem value="en_dano">En Daño</SelectItem>
            <SelectItem value="garantia">En Garantía</SelectItem>
            <SelectItem value="sin_factura">Sin Facturas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCorte} onValueChange={onCorteChange}>
          <SelectTrigger className="w-full md:w-[200px] bg-white/80 dark:bg-[#0A1628]/80 border-cyan-200/50 dark:border-cyan-500/30 focus:ring-cyan-500/20">
            <SelectValue placeholder="Fecha de corte" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#0A1628] border-cyan-200/50 dark:border-cyan-500/30">
            <SelectItem value="todos">Todas las fechas</SelectItem>
            <SelectItem value="1-10">Días 1-10</SelectItem>
            <SelectItem value="11-20">Días 11-20</SelectItem>
            <SelectItem value="21-31">Días 21-31</SelectItem>
          </SelectContent>
        </Select>

        {showLimpiar && (
          <Button
            variant="outline"
            onClick={onLimpiarFiltros}
            className="bg-white/80 dark:bg-[#0A1628]/80 border-cyan-200/50 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
