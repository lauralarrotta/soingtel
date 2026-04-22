import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';

interface Estadisticas {
  total: number;
  ppc: number;
  danadas: number;
  suspendidas: number;
  garantias: number;
}

interface FusagasugaStatsCardsProps {
  estadisticas: Estadisticas;
  activeCardFilter: string;
  onCardFilterChange: (filter: string) => void;
  loading?: boolean;
  serverAvailable?: boolean;
}

const cards = [
  { key: 'todos', label: 'Total Activos', color: 'blue' },
  { key: 'ppc', label: 'Pausados PPC', color: 'orange' },
  { key: 'danadas', label: 'Kits Dañados', color: 'red' },
  { key: 'garantias', label: 'En Garantía', color: 'cyan' },
] as const;

export function FusagasugaStatsCards({
  estadisticas,
  activeCardFilter,
  onCardFilterChange,
  loading,
  serverAvailable,
}: FusagasugaStatsCardsProps) {
  const getValue = (key: string) => {
    switch (key) {
      case 'todos': return estadisticas.total;
      case 'ppc': return estadisticas.ppc;
      case 'danadas': return estadisticas.danadas;
      case 'garantias': return estadisticas.garantias;
      default: return 0;
    }
  };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const isActive = activeCardFilter === card.key;
        return (
          <Card
            key={card.key}
            onClick={() => onCardFilterChange(card.key)}
            className={`cursor-pointer overflow-hidden transition-all duration-200 ${
              isActive ? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20 hover:scale-[1.02]' : 'hover:shadow-md hover:scale-[1.02]'
            }`}
          >
            <div className={`h-1 bg-gradient-to-r from-${card.color}-500 to-${card.color}-400`} />
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className={`h-5 w-5 text-${card.color}-500`} />
                {loading ? (
                  <Badge variant="outline" className="text-[10px] animate-pulse">
                    <RefreshCw className="h-3 w-3 mr-1" />
                  </Badge>
                ) : serverAvailable === false ? (
                  <Badge variant="outline" className="text-[10px] bg-yellow-50">
                    Offline
                  </Badge>
                ) : null}
              </div>
              <div className="text-3xl font-bold">{getValue(card.key)}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
