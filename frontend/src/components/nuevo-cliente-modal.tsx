import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface NuevoClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (cliente: any) => void;
}

export function NuevoClienteModal({
  open,
  onOpenChange,
  onSave,
}: NuevoClienteModalProps) {
  const [formData, setFormData] = useState({
    kit: "",
    nombrecliente: "",
    cuentastarlink: "",
    coordenadas: "",
    corte: "",
    email: "",
    contrasena: "",
    observacion: "",
    cuenta: "",
    costoplan: "",
    valorFactura: "",
    valorSoporte: "",
    tipoSoporte: "",
    corteFacturacion: "",
    fechaActivacion: "",
    observaciones: "",
    diaCorte: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      kit: formData.kit || `KIT-${Date.now()}`,
      nombrecliente: formData.nombrecliente,
      cuentastarlink: formData.cuentastarlink,
      coordenadas: formData.coordenadas,
      corte: formData.diaCorte || (formData.fechaActivacion
        ? new Date(formData.fechaActivacion).getDate()
        : null),
      email: formData.email,
      contrasena: formData.contrasena,
      observacion: formData.observacion,
      cuenta: formData.cuenta,
      costoplan: formData.costoplan || null,
      valorFactura: formData.valorFactura || null,
      valorSoporte: formData.valorSoporte || null,
      tipoSoporte: formData.tipoSoporte || null,
      corteFacturacion: formData.corteFacturacion || null,
      fechaActivacion: formData.fechaActivacion,
      observaciones: formData.observaciones,
      estadoPago: "pendiente",
      creadoPor: "frontend",
      activo: true,
    });

    setFormData({
      kit: "",
      nombrecliente: "",
      cuentastarlink: "",
      coordenadas: "",
      corte: "",
      email: "",
      contrasena: "",
      observacion: "",
      cuenta: "",
      costoplan: "",
      valorFactura: "",
      valorSoporte: "",
      tipoSoporte: "",
      corteFacturacion: "",
      fechaActivacion: "",
      observaciones: "",
      diaCorte: "",
    });

    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Nueva Empresa Cliente</DialogTitle>
          <DialogDescription>
            Ingresa los datos completos de la empresa para el control de
            mensualidades
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] pr-4">
            <div className="space-y-6 py-4">
              {/* Información General */}
              <div className="space-y-3">
                <h3 className="text-sm text-muted-foreground">
                  Información General
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="kit">Kit (Código) *</Label>
                      <Input
                        id="kit"
                        placeholder="Ej: KIT-1234 o dejarlo vacío para autogenerar"
                        value={formData.kit}
                        onChange={(e) =>
                          setFormData({ ...formData, kit: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nombre">
                        Cliente (Nombre de la empresa) *
                      </Label>
                      <Input
                        id="nombre"
                        placeholder="Nombre de la Empresa"
                        value={formData.nombrecliente}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nombrecliente: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cuentaStarlink">Cuenta Starlink *</Label>
                      <Input
                        id="cuentaStarlink"
                        placeholder="Número de cuenta"
                        value={formData.cuentastarlink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cuentastarlink: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="coordenadas">Coordenadas</Label>
                      <Input
                        id="coordenadas"
                        placeholder="-0.123456, -78.123456"
                        value={formData.coordenadas}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coordenadas: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contacto@empresa.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contrasena">Contraseña</Label>
                      <Input
                        id="contrasena"
                        type="password"
                        placeholder="Contraseña de acceso"
                        value={formData.contrasena}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contrasena: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="Cuenta">Cuenta</Label>
                      <Input
                        id="Cuenta"
                        placeholder="Número de cuenta interna"
                        value={formData.cuenta}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cuenta: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="tipoSoporte">Tipo de Soporte</Label>
                      <select
                        id="tipoSoporte"
                        value={formData.tipoSoporte}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tipoSoporte: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option value="">Seleccionar Tipo Soporte</option>
                        <option value="soporte5*8">5*8</option>
                        <option value="soporte7*24">7*24</option>
                        <option value="soporteno">N/A</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="observacion">Observación CLiente</Label>
                      <Input
                        id="observacion"
                        placeholder="Notas adicionales sobre el cliente..."
                        value={formData.observacion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            observacion: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas y Cortes */}
              <div className="space-y-3">
                <h3 className="text-sm text-muted-foreground">
                  Fechas y Cortes
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fechaActivacion">
                      Fecha de Activación *
                    </Label>
                    <Input
                      id="fechaActivacion"
                      type="date"
                      placeholder="dd/mm/aaaa"
                      value={formData.fechaActivacion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaActivacion: e.target.value,
                        })
                      }
                      required
                    />
                  </div>




                  <div className="grid gap-2">
                    <Label htmlFor="diaCorte">Corte (Día del mes)</Label>
                    <Input
                      id="diaCorte"
                      type="number"
                      placeholder="Ej: 15"
                      value={formData.diaCorte}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          diaCorte: e.target.value,
                        })
                      }
                    />
                  </div>

                </div>
              </div>

              {/* Información Financiera */}
              <div className="space-y-3">
                <h3 className="text-sm text-muted-foreground">
                  Información Financiera
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="costo">Costo Plan *</Label>
                    <Input
                      id="costo"
                      type="number"
                      placeholder="1200"
                      value={formData.costoplan}
                      onChange={(e) =>
                        setFormData({ ...formData, costoplan: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>


              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="observaciones">Observación</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Notas adicionales sobre el cliente..."
                    value={formData.observaciones}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observaciones: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar Cliente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
