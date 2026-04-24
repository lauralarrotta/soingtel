import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CampoEditable } from "./campoEditable";

interface VerDetallesClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
  onGuardarCliente: (kit: string, datos: any) => Promise<void>;
  userType?: string;
}

export function VerDetallesClienteModal({
  open,
  onOpenChange,
  cliente,
  onGuardarCliente,
  userType,
}: VerDetallesClienteModalProps) {
  if (!cliente) return null;

  const guardarCampo = async (campo: string, valor: any) => {
    await onGuardarCliente(cliente.kit, {
      [campo]: valor,
    });
  };

  const calcularEstadoCliente = () => {
    if (!cliente.facturas || cliente.facturas.length === 0) {
      return "pendiente";
    }

    const pendientes = cliente.facturas.filter(
      (f: any) => f.estadoPago === "pendiente",
    ).length;

    if (pendientes >= 2) return "suspendido";
    if (pendientes === 1) return "pendiente";
    return "confirmado";
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmado":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            Pago Confirmado
          </Badge>
        );

      case "pendiente":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendiente</Badge>
        );

      case "suspendido":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">Suspendido</Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalles Completos del Cliente</DialogTitle>
          <DialogDescription>
            Información completa de {cliente.nombre_cliente}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-150px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Información General */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-3">
                Información General
              </h3>

              <div className="grid grid-cols-2 gap-4 bg-muted/50 dark:bg-[#0F2744]/50 rounded-lg p-4">
                <div>
                  <CampoEditable
                    label="KIT"
                    campo="kit"
                    valor={cliente.kit}
                    disabled={userType === "facturacion"}
                    onGuardar={guardarCampo}
                  />
                </div>

                <CampoEditable
                  label="NOMBRE DE LA EMPRESA"
                  campo="nombre_cliente"
                  valor={cliente.nombre_cliente}
                  disabled={userType === "facturacion"}
                  onGuardar={guardarCampo}
                />

                <CampoEditable
                  label="CUENTA STARLINK"
                  campo="cuenta_starlink"
                  valor={cliente.cuenta_starlink}
                  disabled={userType === "facturacion"}
                  onGuardar={guardarCampo}
                />

                <CampoEditable
                  label="COORDENADAS"
                  campo="coordenadas"
                  valor={cliente.coordenadas}
                  disabled={userType === "facturacion"}
                  onGuardar={guardarCampo}
                />

                <CampoEditable
                  label="EMAIL"
                  campo="email"
                  valor={cliente.email}
                  disabled={userType === "facturacion"}
                  onGuardar={guardarCampo}
                />

                <CampoEditable
                  label="CONTRASEÑA"
                  campo="contrasena"
                  valor={cliente.contrasena}
                  disabled={userType === "facturacion"}
                  onGuardar={guardarCampo}
                />

                <CampoEditable
                  label="OBSERVACIÓN"
                  campo="observacion"
                  valor={cliente.observacion}
                  disabled={userType === "facturacion"}
                  onGuardar={guardarCampo}
                />

                <CampoEditable
                  label="CUENTA"
                  campo="cuenta"
                  valor={cliente.cuenta}
                  disabled={userType === "facturacion"}
                  onGuardar={guardarCampo}
                />

                <CampoEditable
                  label="TIPO SOPORTE"
                  campo="tipo_soporte"
                  valor={cliente.tipo_soporte}
                  type="select"
                  options={[
                    { label: "5*8", value: "5*8" },
                    { label: "7*24", value: "7*24" },
                    { label: "Ninguno", value: "ninguno" },
                  ]}
                  disabled={userType === "facturacion"}
                  onGuardar={guardarCampo}
                />

                <div>
                  <p className="text-xs text-muted-foreground">
                    ESTADO DE PAGO
                  </p>
                  <div className="mt-1">
                    {getEstadoBadge(calcularEstadoCliente())}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Información Financiera */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-3">
                Información Financiera
              </h3>

              <div className="grid grid-cols-3 gap-4 bg-muted/50 dark:bg-[#0F2744]/50 rounded-lg p-4">
                <CampoEditable
                  label="COSTO PLAN"
                  campo="costo_plan"
                  valor={cliente.costo_plan}
                  disabled={userType === "facturacion"}
                  onGuardar={guardarCampo}
                />

                <CampoEditable
                  label="VALOR A FACTURAR"
                  campo="valor_factura"
                  valor={cliente.valor_factura}
                  disabled={userType === "soporte"}
                  onGuardar={guardarCampo}
                />

                <CampoEditable
                  label="VALOR SOPORTE"
                  campo="valor_soporte"
                  valor={cliente.valor_soporte}
                  disabled={userType === "soporte"}
                  onGuardar={guardarCampo}
                />
              </div>
            </div>

            <Separator />

            {/* Fechas */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-3">
                Fechas y Cortes
              </h3>

              <div className="grid grid-cols-3 gap-4 bg-muted/50 dark:bg-[#0F2744]/50 rounded-lg p-4">
                <CampoEditable
                  label="CORTE (DÍA DEL MES)"
                  campo="corte"
                  valor={cliente.corte}
                  disabled={userType === "facturacion"}
                  onGuardar={guardarCampo}
                />

                <CampoEditable
                  label="CORTE FACTURACIÓN"
                  campo="corte_facturacion"
                  valor={cliente.corte_facturacion}
                  type="select"
                  options={[
                    { label: "1ER", value: "1ER" },
                    { label: "2DO", value: "2DO" },
                  ]}
                  disabled={userType === "soporte"}
                  onGuardar={guardarCampo}
                />

                <CampoEditable
                  label="FECHA ACTIVACIÓN"
                  campo="fecha_activacion"
                  valor={cliente.fecha_activacion?.split("T")[0] || ""}
                  type="date"
                  disabled={userType === "facturacion"}
                  onGuardar={guardarCampo}
                />
              </div>
            </div>

            <Separator />

            {/* Observaciones */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-3">
                Observaciones
              </h3>

              <CampoEditable
                label="OBSERVACIONES"
                campo="observaciones"
                valor={cliente.observaciones}
                disabled={userType === "facturacion"}
                onGuardar={guardarCampo}
              />
            </div>

            {/* Facturas */}
            {cliente.facturas && cliente.facturas.length > 0 && (
              <>
                <Separator />

                <div>
                  <h3 className="text-sm text-muted-foreground mb-3">
                    Facturas ({cliente.facturas.length})
                  </h3>

                  <div className="space-y-2">
                    {cliente.facturas.map((factura: any, index: number) => (
                      <div
                        key={index}
                        className="bg-muted/50 dark:bg-[#0F2744]/50 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{factura.numero}</p>

                          <p className="text-xs text-muted-foreground">
                            {factura.periodo &&
                              `Periodo: ${factura.periodo} | `}
                            Fecha: {factura.fecha ? new Date(factura.fecha).toLocaleDateString('es-CO') : '-'}
                          </p>
                        </div>

                        <Badge
                          className={
                            factura.estadoPago === "pagado"
                              ? "bg-green-500"
                              : factura.estadoPago === "pendiente"
                                ? "bg-yellow-500"
                                : factura.estadoPago === "roc"
                                  ? "bg-purple-500 uppercase"
                                  : factura.estadoPago === "ppc"
                                    ? "bg-orange-600 uppercase"
                                    : "bg-red-500"
                          }
                        >
                          {factura.estadoPago === "roc" ? "ROC" : factura.estadoPago === "ppc" ? "PPC" : factura.estadoPago}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
