import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface ContadorCorteProps {
  diaCorte: number;
  mostrarIcono?: boolean;
  className?: string;
}

export function ContadorCorte({ diaCorte, mostrarIcono = true, className = "" }: ContadorCorteProps) {
  // Calcular días restantes hasta el corte
  const calcularDiasRestantes = (diaCorte: number): number => {
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    // Fecha de corte en el mes actual
    let fechaCorte = new Date(añoActual, mesActual, diaCorte);

    // Si el día de corte ya pasó este mes, calcular para el próximo mes
    if (diaActual > diaCorte) {
      fechaCorte = new Date(añoActual, mesActual + 1, diaCorte);
    }

    // Calcular diferencia en días
    const diferencia = fechaCorte.getTime() - hoy.getTime();
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

    return dias;
  };

  const diasRestantes = calcularDiasRestantes(diaCorte);

  // Determinar el estilo según los días restantes - colores más profesionales
  const getEstilo = () => {
    if (diasRestantes <= 3) {
      return {
        variant: "destructive" as const,
        icon: <AlertTriangle className="w-3 h-3" />,
        className: "bg-red-950/50 text-red-400 border-red-900/50 hover:bg-red-950/70"
      };
    } else if (diasRestantes <= 7) {
      return {
        variant: "default" as const,
        icon: <Clock className="w-3 h-3" />,
        className: "bg-amber-950/50 text-amber-400 border-amber-900/50 hover:bg-amber-950/70"
      };
    } else {
      return {
        variant: "secondary" as const,
        icon: <CheckCircle2 className="w-3 h-3" />,
        className: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/70"
      };
    }
  };

  const estilo = getEstilo();
  const mensaje = diasRestantes === 1 
    ? "1 día" 
    : diasRestantes === 0 
      ? "Hoy" 
      : `${diasRestantes} días`;

  return (
    <Badge 
      variant={estilo.variant}
      className={`${estilo.className} ${className} flex items-center gap-1 px-2 py-0.5 text-xs font-medium`}
    >
      {mostrarIcono && estilo.icon}
      <span>{mensaje}</span>
    </Badge>
  );
}

// Componente para mostrar el detalle completo del corte
interface DetalleCorteProps {
  diaCorte: number;
}

export function DetalleCorte({ diaCorte }: DetalleCorteProps) {
  const calcularFechaCorte = (diaCorte: number): string => {
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    let fechaCorte = new Date(añoActual, mesActual, diaCorte);

    if (diaActual > diaCorte) {
      fechaCorte = new Date(añoActual, mesActual + 1, diaCorte);
    }

    return fechaCorte.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Corte día {diaCorte}</span>
      <span className="text-muted-foreground">•</span>
      <span className="text-muted-foreground">{calcularFechaCorte(diaCorte)}</span>
      <span className="text-muted-foreground">•</span>
      <ContadorCorte diaCorte={diaCorte} />
    </div>
  );
}