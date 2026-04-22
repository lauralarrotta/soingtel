import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
  onSave: (kit: string, datos: any) => void;
  userType?: "admin" | "soporte";
}

export function EditarClienteModal({
  open,
  onOpenChange,
  cliente,
  onSave,
}: Props) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (cliente) {
      setFormData({
        kit: formData.kit || `KIT-${Date.now()}`,
        nombrecliente: formData.nombrecliente,
        cuentastarlink: formData.cuentastarlink,
        coordenadas: formData.coordenadas,
        corte: formData.fechaActivacion
          ? new Date(formData.fechaActivacion).getDate()
          : null,
        email: formData.email,
        contrasena: formData.contrasena,
        observacion: formData.observacion,
        cuenta: formData.cuenta,
        costoplan: formData.costoplan || null,
        valorFactura: formData.valorFactura || null,
        valorSoporte: formData.valorSoporte || null,
        tipoSoporte: formData.tipoSoporte || null,
        corteFacturacion: formData.corteFacturacion,
        fechaActivacion: formData.fechaActivacion,
        observaciones: formData.observaciones,
        estadoPago: "pendiente",
        creadoPor: "frontend",
        activo: true,
      });
    }
  }, [cliente]);

  const handleChange = (campo: string, valor: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(cliente?.kit, formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
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
                      <Label htmlFor="kit">Kit (Código)</Label>
                      <Input
                        id="kit"
                        placeholder="Ej: KIT-1234 o dejarlo vacío para autogenerar"
                        value={formData.kit}
                        onChange={(e) => handleChange("kit", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nombrecliente">Nombre del Cliente</Label>
                      <Input
                        id="nombrecliente"
                        placeholder="Nombre de la Empresa"
                        value={formData.nombrecliente}
                        onChange={(e) =>
                          handleChange("nombrecliente", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cuentaStarlink">Cuenta Starlink</Label>
                      <Input
                        id="cuentaStarlink"
                        placeholder="Número de cuenta"
                        value={formData.cuentastarlink}
                        onChange={(e) =>
                          handleChange("cuentastarlink", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="coordenadas">Coordenadas</Label>
                      <Input
                        id="coordenadas"
                        placeholder="-0.123456, -78.123456"
                        value={formData.coordenadas}
                        onChange={(e) =>
                          handleChange("coordinadas", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contacto@empresa.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contrasena">Contraseña</Label>
                      <Input
                        id="contrasena"
                        type="text"
                        placeholder="Contraseña de acceso"
                        value={formData.contrasena}
                        onChange={(e) =>
                          handleChange("contrasena", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="Cuenta">Cuenta</Label>
                      <Input
                        id="Cuenta"
                        placeholder="Número de cuenta interna"
                        value={formData.cuenta}
                        onChange={(e) => handleChange("cuenta", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tipoSoporte">Tipo de Soporte</Label>
                      <select
                        id="tipoSoporte"
                        value={formData.tipoSoporte}
                        onChange={(e) =>
                          handleChange("tipoSoporte", e.target.value)
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
                          handleChange("observacion", e.target.value)
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
                    <Label htmlFor="fechaActivacion">Fecha de Activación</Label>
                    <Input
                      id="fechaActivacion"
                      type="date"
                      placeholder="dd/mm/aaaa"
                      value={formData.fechaActivacion}
                      onChange={(e) =>
                        handleChange("fechaActivacion", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="corte">Corte (Día)</Label>
                    <Input
                      id="corte"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Ej: 5"
                      value={formData.corte}
                      onChange={(e) => handleChange("corte", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="corteFacturacion">Corte Facturación</Label>
                    <select
                      id="corte"
                      value={formData.corteFacturacion}
                      onChange={(e) =>
                        handleChange("corteFacturacion", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Seleccionar CorteFacturación</option>
                      <option value="1">1ER</option>
                      <option value="2">2DO</option>
                    </select>
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
                    <Label htmlFor="costo">Costo Plan</Label>
                    <Input
                      id="costo"
                      type="number"
                      placeholder="1200"
                      value={formData.costoplan}
                      onChange={(e) =>
                        handleChange("costoplan", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="valorFactura">Valor Factura</Label>
                    <Input
                      id="valorFactura"
                      type="number"
                      placeholder="1200"
                      value={formData.valorFactura}
                      onChange={(e) =>
                        handleChange("valorFactura", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="valorSoporte">Valor Soporte</Label>
                    <Input
                      id="valorSoporte"
                      type="number"
                      placeholder="300"
                      value={formData.valorSoporte}
                      onChange={(e) =>
                        handleChange("valorSoporte", e.target.value)
                      }
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
                      handleChange("observaciones", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
