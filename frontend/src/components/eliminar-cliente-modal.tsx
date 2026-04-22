import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface EliminarClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
  onConfirm: () => void;
}

export function EliminarClienteModal({
  open,
  onOpenChange,
  cliente,
  onConfirm,
}: EliminarClienteModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ¿Eliminar cliente permanentemente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar al cliente: <strong>{cliente?.nombre}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-md p-3 space-y-1 text-sm">
            <p className="text-red-800">
              <strong>⚠️ Esta acción es irreversible</strong>
            </p>
            <p className="text-red-700">Se eliminarán:</p>
            <ul className="list-disc list-inside text-red-700 ml-2">
              <li>Información del cliente (Kit: {cliente?.kit})</li>
              <li>
                Historial de facturas ({cliente?.facturas?.length || 0}{" "}
                facturas)
              </li>
              <li>Observaciones y registros asociados</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Por favor confirma que deseas continuar con esta acción.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Sí, eliminar permanentemente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
