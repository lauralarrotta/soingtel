import { AlertCircle, AlertTriangle, Ban } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";

interface AlertsPanelProps {
  moraCount: number;
  pendientesCount: number;
  clientesEnMora: number;
  onFilterSuspendidos: () => void;
  onFilterPendientes: () => void;
  onFilterMora?: () => void;
  onAbrirSuspension?: () => void;
  userType?: string;
}

export function AlertsPanel({
  moraCount,
  pendientesCount,
  clientesEnMora,
  onFilterSuspendidos,
  onFilterPendientes,
  onFilterMora,
  onAbrirSuspension,
  userType = "soporte",
}: AlertsPanelProps) {
  // Mostrar alerta de mora solo para Soporte y Admin y si hay clientes en mora
  const mostrarAlertaMora =
    (userType === "soporte" || userType === "admin") && clientesEnMora > 0;

  // Mostrar otras alertas solo si hay contadores mayores a 0
  const mostrarSuspendidos = moraCount > 0;
  const mostrarPendientes = pendientesCount > 0;

  // Si no hay ninguna alerta que mostrar, no renderizar nada
  if (!mostrarSuspendidos && !mostrarPendientes && !mostrarAlertaMora) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 w-full">
      {mostrarSuspendidos && (
        <Alert
          variant="destructive"
          className="cursor-pointer hover:opacity-90 transition-opacity h-full bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800"
          onClick={onFilterSuspendidos}
        >
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-700 dark:text-red-300">Clientes suspendidos</AlertTitle>
          <AlertDescription className="text-sm break-words text-red-600/80 dark:text-red-400/80">
            {moraCount} clientes con servicio suspendido - Clic para filtrar
          </AlertDescription>
        </Alert>
      )}

      {mostrarPendientes && (
        <Alert
          className="border-yellow-500 cursor-pointer hover:opacity-90 transition-opacity h-full bg-yellow-50/80 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800"
          onClick={onFilterPendientes}
        >
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-700 dark:text-yellow-300">Pendientes</AlertTitle>
          <AlertDescription className="text-sm break-words text-yellow-600/80 dark:text-yellow-400/80">
            {pendientesCount} clientes con factura vencida - Clic para filtrar
          </AlertDescription>
        </Alert>
      )}

      {mostrarAlertaMora && (
        <Alert className="border-orange-500 h-full bg-orange-50/80 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
          <Ban className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertTitle className="text-orange-700 dark:text-orange-300">Pendiente de suspensión</AlertTitle>
          <AlertDescription className="space-y-2">
            <div className="text-sm break-words text-orange-600/80 dark:text-orange-400/80">
              {clientesEnMora} {clientesEnMora === 1 ? "cliente" : "clientes"}{" "}
              con 2+ facturas vencidas
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {onFilterMora && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onFilterMora}
                  className="h-7 text-xs bg-yellow-50 dark:bg-yellow-950 border-yellow-500 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                >
                  Ver clientes
                </Button>
              )}
              {onAbrirSuspension && (
                <Button
                  size="sm"
                  onClick={onAbrirSuspension}
                  className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white border-0"
                >
                  Gestionar suspensión
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
