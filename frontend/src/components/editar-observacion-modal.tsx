import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { AlertCircle, Wrench } from "lucide-react";

interface EditarObservacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
  observacionActual: string;
  onSave: (kit: string, observacion: string) => void;
}

export function EditarObservacionModal({
  open,
  onOpenChange,
  cliente,
  observacionActual,
  onSave,
}: EditarObservacionModalProps) {
  const [observacion, setObservacion] = useState(observacionActual);
  const [tipoIncidencia, setTipoIncidencia] = useState("");

  useEffect(() => {
    setObservacion(observacionActual);
  }, [observacionActual]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(cliente?.kit, observacion);
    onOpenChange(false);
  };

  const incidenciasComunes = [
    { valor: "antena_dañada", texto: "Antena dañada - requiere reemplazo" },
    { valor: "mal_tiempo", texto: "Afectación por mal tiempo" },
    { valor: "fallo_electrico", texto: "Fallo eléctrico en equipo" },
    { valor: "obstruccion", texto: "Obstrucción en línea de vista" },
    { valor: "mantenimiento", texto: "En mantenimiento preventivo" },
    { valor: "revision_pago", texto: "Pendiente revisión de pago" },
    { valor: "contactar", texto: "Contactar urgente" },
  ];

  const handleIncidenciaChange = (valor: string) => {
    setTipoIncidencia(valor);
    const incidencia = incidenciasComunes.find((i) => i.valor === valor);
    if (incidencia) {
      setObservacion(incidencia.texto);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Editar Observación
          </DialogTitle>
          <DialogDescription>
            Cliente: {cliente?.nombre} | Kit: {cliente?.kit}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="bg-purple-50 border border-purple-200 rounded-md p-3 text-sm text-purple-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Las observaciones son visibles para todos los usuarios y sirven para documentar incidencias técnicas y estados del servicio.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="incidencia" className="flex items-center gap-2">
                Incidencia común (opcional)
                <Badge variant="outline" className="text-xs">Plantillas</Badge>
              </Label>
              <Select value={tipoIncidencia} onValueChange={handleIncidenciaChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una incidencia predefinida" />
                </SelectTrigger>
                <SelectContent>
                  {incidenciasComunes.map((inc) => (
                    <SelectItem key={inc.valor} value={inc.valor}>
                      {inc.texto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Selecciona una plantilla predefinida o escribe tu propia observación
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="observacion">Observación</Label>
              <Textarea
                id="observacion"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                rows={5}
                placeholder="Ingrese observaciones sobre el cliente o servicio..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}