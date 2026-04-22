import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Shield,
  Users,
  CreditCard,
  Receipt,
  Edit,
  Trash2,
  Bell
} from "lucide-react";
import { Separator } from "./ui/separator";

interface GuiaUsuarioProps {
  userType: string;
}

export function GuiaUsuario({ userType }: GuiaUsuarioProps) {
  const [open, setOpen] = useState(false);

  const getGuiaContent = () => {
    switch (userType) {
      case "admin":
        return {
          title: "Guía del Administrador",
          icon: <Shield className="h-5 w-5 text-blue-600" />,
          badge: <Badge className="bg-blue-500">Admin</Badge>,
          description: "Como administrador, tienes acceso completo al sistema con todos los permisos",
          permisos: [
            { accion: "Ver estadísticas completas del sistema", permitido: true },
            { accion: "Crear nuevas empresas clientes", permitido: true },
            { accion: "Editar todos los datos de clientes", permitido: true },
            { accion: "Eliminar clientes permanentemente", permitido: true },
            { accion: "Agregar y modificar facturas", permitido: true },
            { accion: "Cambiar estados de pago", permitido: true },
            { accion: "Editar observaciones", permitido: true },
            { accion: "Ver historial completo", permitido: true },
            { accion: "Exportar datos a Excel", permitido: true },
            { accion: "Recibir alertas de facturación", permitido: true },
          ],
          acciones: [
            {
              titulo: "Editar Cliente Completo",
              descripcion: "Usa el botón 'Editar Todo' para modificar cualquier dato del cliente",
              icon: <Edit className="h-4 w-4" />,
            },
            {
              titulo: "Eliminar Cliente",
              descripcion: "El botón rojo 'Eliminar' te permite borrar clientes. Esta acción es irreversible",
              icon: <Trash2 className="h-4 w-4 text-red-600" />,
            },
            {
              titulo: "Dashboard de Estadísticas",
              descripcion: "Visualiza métricas importantes en la parte superior del dashboard",
              icon: <Shield className="h-4 w-4" />,
            },
          ],
        };
      case "facturacion":
        return {
          title: "Guía de Facturación",
          icon: <Receipt className="h-5 w-5 text-green-600" />,
          badge: <Badge className="bg-green-500">Facturación</Badge>,
          description: "Como usuario de Facturación, puedes gestionar facturas y estados de pago",
          permisos: [
            { accion: "Agregar nuevas facturas", permitido: true },
            { accion: "Modificar estados de pago", permitido: true },
            { accion: "Ver historial de facturas", permitido: true },
            { accion: "Recibir alertas de nuevos clientes", permitido: true },
            { accion: "Exportar facturas a Excel", permitido: true },
            { accion: "Crear nuevas empresas", permitido: false },
            { accion: "Editar información de clientes", permitido: false },
            { accion: "Eliminar clientes", permitido: false },
            { accion: "Editar observaciones técnicas", permitido: false },
          ],
          acciones: [
            {
              titulo: "Alertas de Nuevos Clientes",
              descripcion: "Cuando Soporte crea un cliente, recibirás una notificación (campana naranja)",
              icon: <Bell className="h-4 w-4 text-orange-600" />,
            },
            {
              titulo: "Agregar Factura",
              descripcion: "Haz clic en 'Agregar Factura' junto a cada cliente. El número se genera automáticamente",
              icon: <Receipt className="h-4 w-4" />,
            },
            {
              titulo: "Cambiar Estado de Pago",
              descripcion: "Usa el ícono de tarjeta junto al estado actual para cambiarlo",
              icon: <CreditCard className="h-4 w-4" />,
            },
          ],
        };
      case "soporte":
        return {
          title: "Guía de Soporte",
          icon: <Users className="h-5 w-5 text-purple-600" />,
          badge: <Badge className="bg-purple-500">Soporte</Badge>,
          description: "Como usuario de Soporte, puedes gestionar clientes y observaciones técnicas",
          permisos: [
            { accion: "Crear nuevas empresas clientes", permitido: true },
            { accion: "Editar observaciones técnicas", permitido: true },
            { accion: "Ver historial de clientes", permitido: true },
            { accion: "Crear tickets de Jira", permitido: true },
            { accion: "Exportar clientes a Excel", permitido: true },
            { accion: "Agregar facturas", permitido: false },
            { accion: "Modificar estados de pago", permitido: false },
            { accion: "Ver alertas de facturación", permitido: false },
            { accion: "Eliminar clientes", permitido: false },
          ],
          acciones: [
            {
              titulo: "Nueva Empresa",
              descripcion: "Usa el botón 'Nueva Empresa' para registrar clientes. Facturación será notificado automáticamente",
              icon: <Users className="h-4 w-4" />,
            },
            {
              titulo: "Editar Observaciones",
              descripcion: "Usa el ícono de lápiz para documentar incidencias como antenas dañadas",
              icon: <Edit className="h-4 w-4" />,
            },
            {
              titulo: "Registrar en Jira",
              descripcion: "Crea tickets para seguimiento de problemas técnicos",
              icon: <HelpCircle className="h-4 w-4" />,
            },
          ],
        };
      default:
        return null;
    }
  };

  const content = getGuiaContent();
  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Guía Rápida
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {content.icon}
            {content.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {content.badge}
            <span>{content.description}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Permisos */}
          <div>
            <h3 className="text-sm mb-3">Permisos de tu rol</h3>
            <div className="space-y-2">
              {content.permisos.map((permiso, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-muted"
                >
                  {permiso.permitido ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                  <span className={permiso.permitido ? "" : "text-muted-foreground"}>
                    {permiso.accion}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Acciones principales */}
          <div>
            <h3 className="text-sm mb-3">Acciones principales</h3>
            <div className="grid gap-3">
              {content.acciones.map((accion, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {accion.icon}
                      {accion.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{accion.descripcion}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm mb-2 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Nota importante
            </h4>
            <p className="text-sm text-muted-foreground">
              {userType === "admin" && "Como administrador, tienes la responsabilidad de gestionar todo el sistema. Ten cuidado al eliminar clientes ya que esta acción no se puede deshacer."}
              {userType === "facturacion" && "Las facturas que crees y los estados que cambies afectan directamente el flujo de caja y el estado del servicio de los clientes."}
              {userType === "soporte" && "Cuando creas un nuevo cliente, Facturación recibe automáticamente una alerta para que pueda agregar la información de facturación correspondiente."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
