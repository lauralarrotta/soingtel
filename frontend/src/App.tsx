import { useState, useEffect } from "react";
import { Login } from "./components/login";
import { DashboardHeader } from "./components/dashboard-header";
import DashboardSidebar from "./components/dashboard-sidebar";
import { ControlMensualidades } from "./components/control-mensualidades";
import { FusagasugaMensualidades } from "./components/fusagasuga-mensualidades";
import { ClientesStatusPanel } from "./components/clientes-status-panel";
import { AlertasFacturacionModal } from "./components/alertas-facturacion-modal";
import { AlertasSuspensionModal } from "./components/alertas-suspension-modal";
import { AlertasReactivacionModal } from "./components/alertas-reactivacion-modal";
import { PlaceholderSection } from "./components/placeholder-section";
import { Users, Activity, FileText, Settings } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState("");
  const [activeSection, setActiveSection] = useState("mensualidades");
  const [alertasModalOpen, setAlertasModalOpen] = useState(false);
  const [alertasSuspensionOpen, setAlertasSuspensionOpen] = useState(false);
  const [alertasReactivacionOpen, setAlertasReactivacionOpen] = useState(false);
  const [clienteParaFacturar, setClienteParaFacturar] = useState<any>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check system preference or saved theme
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogin = (type: string) => {
    setUserType(type);
    setIsLoggedIn(true);
    setActiveSection("mensualidades");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType("");
    setActiveSection("mensualidades");
  };

  useEffect(() => {
    // Actualizar contador de alertas
    const updateAlertCount = () => {
      if (userType === "facturacion" || userType === "admin") {
        const alertasFact = localStorage.getItem("alertas_facturacion");
        const alertasSusp = localStorage.getItem("alertas_suspension");

        let count = 0;

        if (alertasFact) {
          const factData = JSON.parse(alertasFact);
          count += factData.filter((a: any) => !a.completada).length;
        }

        if (alertasSusp) {
          const suspData = JSON.parse(alertasSusp);
          count += suspData.filter((a: any) => !a.vista).length;
        }

        setAlertCount(count);
      }
    };

    updateAlertCount();
    const interval = setInterval(updateAlertCount, 5000);
    return () => clearInterval(interval);
  }, [userType]);

  const handleOpenAlertas = () => {
    if (userType === "facturacion" || userType === "admin") {
      // Abrir modal de facturación o suspensión según contexto
      // Por defecto abrimos facturación
      setAlertasModalOpen(true);
    }
  };

  const handleOpenAlertasSuspension = () => {
    if (userType === "soporte" || userType === "admin") {
      setAlertasSuspensionOpen(true);
    }
  };

  const handleOpenAlertasReactivacion = () => {
    if (userType === "soporte" || userType === "admin") {
      setAlertasReactivacionOpen(true);
    }
  };

  const handleAgregarFacturaDesdeAlerta = (alerta: any) => {
    // Buscar el cliente en el componente de control de mensualidades
    setClienteParaFacturar(alerta);
    toast.info(`Abriendo formulario de factura para ${alerta.nombre}`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "mensualidades":
        return (
          <ControlMensualidades
            userType={userType}
            clienteParaFacturar={clienteParaFacturar}
            onFacturaAgregada={() => setClienteParaFacturar(null)}
          />
        );
      case "fusagasuga":
        return (
          <FusagasugaMensualidades
            userType={userType}
            clienteParaFacturar={clienteParaFacturar}
            onFacturaAgregada={() => setClienteParaFacturar(null)}
          />
        );
      case "clientes-status":
        return <ClientesStatusPanel />;
      case "clientes":
        return (
          <PlaceholderSection
            title="Clientes"
            description="Esta sección mostrará el listado completo de clientes con sus detalles y historial."
            icon={<Users className="h-16 w-16" />}
          />
        );
      case "semaforizacion":
        return (
          <PlaceholderSection
            title="Semaforización de pagos"
            description="Visualización en tiempo real del estado de pagos con indicadores de color."
            icon={<Activity className="h-16 w-16" />}
          />
        );
      case "reportes":
        return (
          <PlaceholderSection
            title="Reportes"
            description="Generación de reportes detallados de facturación y pagos."
            icon={<FileText className="h-16 w-16" />}
          />
        );
      case "configuracion":
        return (
          <PlaceholderSection
            title="Configuración"
            description="Configura los parámetros del sistema y preferencias de usuario."
            icon={<Settings className="h-16 w-16" />}
          />
        );
      default:
        return <ControlMensualidades userType={userType} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader
        userType={userType}
        onLogout={handleLogout}
        alertCount={alertCount}
        onOpenAlertas={handleOpenAlertas}
        onOpenAlertasSuspension={handleOpenAlertasSuspension}
        onOpenAlertasReactivacion={handleOpenAlertasReactivacion}
        currentTheme={theme}
        onToggleTheme={toggleTheme}
      />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userType={userType}
        />
        <main className="flex-1 overflow-y-auto">{renderSection()}</main>
      </div>

      <AlertasFacturacionModal
        open={alertasModalOpen}
        onOpenChange={setAlertasModalOpen}
        onAgregarFactura={handleAgregarFacturaDesdeAlerta}
        userType={userType}
      />

      <AlertasSuspensionModal
        open={alertasSuspensionOpen}
        onOpenChange={setAlertasSuspensionOpen}
        userType={userType}
      />

      <AlertasReactivacionModal
        open={alertasReactivacionOpen}
        onOpenChange={setAlertasReactivacionOpen}
        userType={userType}
      />

      <Toaster />
    </div>
  );
}
