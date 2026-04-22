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
import { motion } from "framer-motion";

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
    <header className="h-16 border-b bg-[#0A1628]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur opacity-30 -z-10" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">Soingtel</h1>
            <p className="text-[9px] text-cyan-400/70 uppercase tracking-widest">Starlink Management</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 mr-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
          />
          <span className="text-[10px] text-cyan-400/80 uppercase tracking-wider">Online</span>
        </div>

        {/* Alertas para Facturación y Admin */}
        {(userType === "facturacion" || userType === "admin") && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
              onClick={onOpenAlertas}
              title="Nuevos clientes - Requieren factura"
            >
              <Bell className="h-5 w-5" />
              {alertasCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/30 animate-pulse">
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
              variant="ghost"
              size="icon"
              className="relative text-slate-400 hover:text-green-400 hover:bg-green-500/10"
              onClick={onOpenAlertasReactivacion}
              title="Clientes para reactivar"
            >
              <Power className="h-5 w-5" />
              {alertasReactivacionCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-green-500 text-white rounded-full shadow-lg shadow-green-500/30 animate-pulse">
                  {alertasReactivacionCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              onClick={onOpenAlertasSuspension}
              title="Clientes para suspender - Requieren atención"
            >
              <Ban className="h-5 w-5" />
              {alertasSuspensionCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white rounded-full shadow-lg shadow-red-500/30 animate-pulse">
                  {alertasSuspensionCount}
                </Badge>
              )}
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          title={currentTheme === "dark" ? "Modo Claro" : "Modo Oscuro"}
          className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
        >
          {currentTheme === "dark" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </Button>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-slate-400 hover:text-white hover:bg-slate-800/50 px-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden md:inline text-sm font-medium">{getUserName()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#0A1628] border-cyan-500/20 shadow-xl shadow-cyan-500/10">
            <DropdownMenuItem onClick={onLogout} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
