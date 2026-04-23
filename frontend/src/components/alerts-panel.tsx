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
          className="cursor-pointer hover:opacity-80 transition-opacity h-full"
          onClick={onFilterSuspendidos}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Clientes suspendidos</AlertTitle>
          <AlertDescription className="text-sm break-words">
            {moraCount} clientes con servicio suspendido - Clic para filtrar
          </AlertDescription>
        </Alert>
      )}

      {mostrarPendientes && (
        <Alert
          className="border-yellow-500 text-yellow-900 [&>svg]:text-yellow-600 cursor-pointer hover:opacity-80 transition-opacity h-full"
          onClick={onFilterPendientes}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pendientes</AlertTitle>
          <AlertDescription className="text-sm break-words">
            {pendientesCount} clientes con factura vencida - Clic para filtrar
          </AlertDescription>
        </Alert>
      )}

      {mostrarAlertaMora && (
        <Alert className="border-orange-500 text-orange-900 [&>svg]:text-orange-600 h-full">
          <Ban className="h-4 w-4" />
          <AlertTitle>Pendiente de suspensión</AlertTitle>
          <AlertDescription className="space-y-2">
            <div className="text-sm break-words">
              {clientesEnMora} {clientesEnMora === 1 ? "cliente" : "clientes"}{" "}
              con 2+ facturas vencidas
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {onFilterMora && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onFilterMora}
                  className="h-7 text-xs border-orange-600 text-orange-700 hover:bg-orange-50"
                >
                  Ver clientes
                </Button>
              )}
              {onAbrirSuspension && (
                <Button
                  size="sm"
                  onClick={onAbrirSuspension}
                  className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white border-0"
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
