import { BarChart3, Users, Clock, AlertTriangle, Ban, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';

interface Estadisticas {
  total: number;
  ppc: number;
  pendientesFacturar: number;
  suspendidos: number;
  enMora: number;
  rocPorPeriodo: number;
}

interface InformesStatsCardsProps {
  estadisticas: Estadisticas;
  loading?: boolean;
}

const cards = [
  { key: 'total', label: 'Clientes Activos', icon: Users, color: 'blue' },
  { key: 'ppc', label: 'Pausados PPC', icon: Clock, color: 'orange' },
  { key: 'pendientesFacturar', label: 'Pendientes Facturar', icon: FileText, color: 'yellow' },
  { key: 'suspendidos', label: 'Suspendidos', icon: Ban, color: 'red' },
  { key: 'enMora', label: 'En Mora', icon: AlertTriangle, color: 'purple' },
] as const;

export function InformesStatsCards({
  estadisticas,
  loading,
}: InformesStatsCardsProps) {
  const getValue = (key: string) => {
    switch (key) {
      case 'total': return estadisticas.total;
      case 'ppc': return estadisticas.ppc;
      case 'pendientesFacturar': return estadisticas.pendientesFacturar;
      case 'suspendidos': return estadisticas.suspendidos;
      case 'enMora': return estadisticas.enMora;
      default: return 0;
    }
  };

  const getColorClasses = (color: string, key: string) => {
    const colorMap: Record<string, string> = {
      blue: 'from-blue-500 to-blue-400 border-blue-500/20',
      orange: 'from-orange-500 to-orange-400 border-orange-500/20',
      yellow: 'from-yellow-500 to-yellow-400 border-yellow-500/20',
      red: 'from-red-500 to-red-400 border-red-500/20',
      purple: 'from-purple-500 to-purple-400 border-purple-500/20',
    };
    const iconMap: Record<string, string> = {
      blue: 'text-blue-500',
      orange: 'text-orange-500',
      yellow: 'text-yellow-500',
      red: 'text-red-500',
      purple: 'text-purple-500',
    };
    const badgeMap: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };
    const textMap: Record<string, string> = {
      blue: 'text-blue-500',
      orange: 'text-orange-500',
      yellow: 'text-yellow-500',
      red: 'text-red-500',
      purple: 'text-purple-500',
    };
    return {
      card: colorMap[color] || colorMap.blue,
      icon: iconMap[color] || iconMap.blue,
      badge: badgeMap[color] || badgeMap.blue,
      text: textMap[color] || textMap.blue,
    };
  };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const colors = getColorClasses(card.color, card.key);
        return (
          <Card
            key={card.key}
            className={`overflow-hidden border ${colors.card.split(' ').map(c => c.includes('border') ? c : '').join(' ')}`}
          >
            <div className={`h-1 bg-gradient-to-r ${colors.card}`} />
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${colors.icon}`} />
                {loading ? (
                  <Badge variant="outline" className="text-[10px] animate-pulse">
                    <RefreshCw className="h-3 w-3 mr-1" />
                  </Badge>
                ) : null}
              </div>
              <div className={`text-3xl font-bold ${colors.text}`}>
                {getValue(card.key)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
