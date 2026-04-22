import { Bell, User, LogOut, Globe, Ban, Power } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

interface DashboardHeaderProps {
  userType: string;
  onLogout: () => void;
  alertCount: number;
  onOpenAlertas: () => void;
  onOpenAlertasSuspension: () => void;
  onOpenAlertasReactivacion: () => void;

  currentTheme: "light" | "dark";
  onToggleTheme: () => void;
}

export function DashboardHeader({
  userType,
  onLogout,
  alertCount,
  onOpenAlertas,
  onOpenAlertasSuspension,
  onOpenAlertasReactivacion,
  currentTheme,
  onToggleTheme,
}: DashboardHeaderProps) {
  const [alertasCount, setAlertasCount] = useState(0);
  const [alertasSuspensionCount, setAlertasSuspensionCount] = useState(0);
  const [alertasReactivacionCount, setAlertasReactivacionCount] = useState(0);

  useEffect(() => {
    // Cargar contador de alertas para facturación
    if (userType === "facturacion" || userType === "admin") {
      const cargarAlertas = () => {
        const alertasGuardadas = localStorage.getItem("alertas_facturacion");
        if (alertasGuardadas) {
          const alertas = JSON.parse(alertasGuardadas);
          const pendientes = alertas.filter((a: any) => !a.completada).length;
          setAlertasCount(pendientes);
        }
      };

      cargarAlertas();

      // Actualizar cada segundo para reflejar cambios
      const interval = setInterval(cargarAlertas, 1000);
      return () => clearInterval(interval);
    }

    // Cargar contador de alertas de reactivación y suspensión para soporte
    if (userType === "soporte" || userType === "admin") {
      const cargarAlertasSoporte = async () => {
        // Locales
        const alertasReactivacion = localStorage.getItem("alertas_reactivacion");
        const alertasSuspension = localStorage.getItem("alertas_suspension");
        let countReactivacion = 0;
        let countSuspension = 0;

        if (alertasReactivacion) {
          const alertas = JSON.parse(alertasReactivacion);
          countReactivacion = alertas.filter((a: any) => !a.vista).length;
        }
        if (alertasSuspension) {
          const alertas = JSON.parse(alertasSuspension);
          countSuspension = alertas.filter((a: any) => !a.vista).length;
        }

        // Servidor
        try {
          const [resSusp, resReac] = await Promise.all([
            fetch("https://soingtel.onrender.com/api/alertas_suspension"),
            fetch("https://soingtel.onrender.com/api/alertas_reactivacion"),
          ]);

          if (resSusp.ok) {
            const data = await resSusp.json();
            const delServidor = (data.alertas_suspension || []).filter((a: any) => !a.vista).length;
            countSuspension = countSuspension + delServidor;
          }
          if (resReac.ok) {
            const data = await resReac.json();
            const delServidor = (data.alertas_reactivacion || []).filter((a: any) => !a.vista).length;
            countReactivacion = countReactivacion + delServidor;
          }
        } catch (e) {
          // Silencioso — si falla el servidor, mostramos solo los locales
        }

        setAlertasReactivacionCount(countReactivacion);
        setAlertasSuspensionCount(countSuspension);
      };

      cargarAlertasSoporte();

      // Actualizar cada segundo para reflejar cambios
      const interval = setInterval(cargarAlertasSoporte, 1000);
      return () => clearInterval(interval);
    }
  }, [userType]);

  const getUserName = () => {
    switch (userType) {
      case "facturacion":
        return "Usuario Facturación";
      case "soporte":
        return "Usuario Soporte";
      case "admin":
        return "Administrador";
      default:
        return "Usuario";
    }
  };

  return (
    <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Soingtel</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gestión Starlink</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Alertas para Facturación y Admin */}
        {(userType === "facturacion" || userType === "admin") && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={onOpenAlertas}
              title="Nuevos clientes - Requieren factura"
            >
              <Bell className="h-5 w-5" />
              {alertasCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-500">
                  {alertasCount}
                </Badge>
              )}
            </Button>
          </>
        )}

        {/* Alertas para Soporte y Admin */}
        {(userType === "soporte" || userType === "admin") && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={onOpenAlertasReactivacion}
              title="Clientes para reactivar"
            >
              <Power className="h-5 w-5 text-green-600" />
              {alertasReactivacionCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500">
                  {alertasReactivacionCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={onOpenAlertasSuspension}
              title="Clientes para suspender - Requieren atención"
            >
              <Ban className="h-5 w-5 text-red-600" />
              {alertasSuspensionCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                  {alertasSuspensionCount}
                </Badge>
              )}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={onToggleTheme}
          title={currentTheme === "dark" ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        >
          {currentTheme === "dark" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <User className="h-4 w-4" />
              {getUserName()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
