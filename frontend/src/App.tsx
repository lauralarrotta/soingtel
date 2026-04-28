import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import { InformesPage } from "./features/informes/pages/InformesPage";
import { Users, Activity, FileText, Settings } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { SECTIONS } from "./constants/navigation";

const ROUTES = {
  LOGIN: "/login",
  MENSUALIDADES: "/mensualidades",
  FUSAGASUGA: "/fusagasuga",
  CLIENTES_STATUS: "/clientes-status",
  CLIENTES: "/clientes",
  SEMAFORIZACION: "/semaforizacion",
  REPORTES: "/reportes",
  CONFIGURACION: "/configuracion",
} as const;

function ProtectedRoute({ children, userType }: { children: React.ReactNode; userType: string }) {
  const isLoggedIn = userType !== "";
  if (!isLoggedIn) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <>{children}</>;
}

function DashboardLayout({
  userType,
  theme,
  onLogout,
  onToggleTheme,
  alertCount,
  onOpenAlertas,
  onOpenAlertasSuspension,
  onOpenAlertasReactivacion,
  children,
}: {
  userType: string;
  theme: "light" | "dark";
  onLogout: () => void;
  onToggleTheme: () => void;
  alertCount: number;
  onOpenAlertas: () => void;
  onOpenAlertasSuspension: () => void;
  onOpenAlertasReactivacion: () => void;
  children: React.ReactNode;
}) {
  const location = useLocation();

  const activeSection = (() => {
    const path = location.pathname;
    if (path === ROUTES.MENSUALIDADES) return SECTIONS.MENSUALIDADES;
    if (path === ROUTES.FUSAGASUGA) return SECTIONS.FUSAGASUGA;
    if (path === ROUTES.CLIENTES_STATUS) return SECTIONS.CLIENTES_STATUS;
    if (path === ROUTES.CLIENTES) return SECTIONS.CLIENTES;
    if (path === ROUTES.SEMAFORIZACION) return SECTIONS.SEMAFORIZACION;
    if (path === ROUTES.REPORTES) return SECTIONS.REPORTES;
    if (path === ROUTES.CONFIGURACION) return SECTIONS.CONFIGURACION;
    return SECTIONS.MENSUALIDADES;
  })();

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader
        userType={userType}
        onLogout={onLogout}
        alertCount={alertCount}
        onOpenAlertas={onOpenAlertas}
        onOpenAlertasSuspension={onOpenAlertasSuspension}
        onOpenAlertasReactivacion={onOpenAlertasReactivacion}
        currentTheme={theme}
        onToggleTheme={onToggleTheme}
      />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          activeSection={activeSection}
          onSectionChange={() => {}}
          userType={userType}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  const [userType, setUserType] = useState("");
  const [alertasModalOpen, setAlertasModalOpen] = useState(false);
  const [alertasSuspensionOpen, setAlertasSuspensionOpen] = useState(false);
  const [alertasReactivacionOpen, setAlertasReactivacionOpen] = useState(false);
  const [clienteParaFacturar, setClienteParaFacturar] = useState<any>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
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

  const handleLogin = (type: string, token?: string) => {
    if (token) localStorage.setItem("token", token);
    setUserType(type);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserType("");
  };

  useEffect(() => {
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
    setClienteParaFacturar(alerta);
    toast.info(`Abriendo formulario de factura para ${alerta.nombre}`);
  };

  const dashboardProps = {
    userType,
    theme,
    onLogout: handleLogout,
    onToggleTheme: toggleTheme,
    alertCount,
    onOpenAlertas: handleOpenAlertas,
    onOpenAlertasSuspension: handleOpenAlertasSuspension,
    onOpenAlertasReactivacion: handleOpenAlertasReactivacion,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={ROUTES.LOGIN}
          element={
            userType ? (
              <Navigate to={ROUTES.MENSUALIDADES} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route
          path={ROUTES.MENSUALIDADES}
          element={
            <ProtectedRoute userType={userType}>
              <DashboardLayout {...dashboardProps}>
                <ControlMensualidades
                  userType={userType}
                  clienteParaFacturar={clienteParaFacturar}
                  onFacturaAgregada={() => setClienteParaFacturar(null)}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.FUSAGASUGA}
          element={
            <ProtectedRoute userType={userType}>
              <DashboardLayout {...dashboardProps}>
                <FusagasugaMensualidades
                  userType={userType}
                  clienteParaFacturar={clienteParaFacturar}
                  onFacturaAgregada={() => setClienteParaFacturar(null)}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.CLIENTES_STATUS}
          element={
            <ProtectedRoute userType={userType}>
              <DashboardLayout {...dashboardProps}>
                <ClientesStatusPanel />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.CLIENTES}
          element={
            <ProtectedRoute userType={userType}>
              <DashboardLayout {...dashboardProps}>
                <PlaceholderSection
                  title="Clientes"
                  description="Esta sección mostrará el listado completo de clientes con sus detalles y historial."
                  icon={<Users className="h-16 w-16" />}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.SEMAFORIZACION}
          element={
            <ProtectedRoute userType={userType}>
              <DashboardLayout {...dashboardProps}>
                <PlaceholderSection
                  title="Semaforización de pagos"
                  description="Visualización en tiempo real del estado de pagos con indicadores de color."
                  icon={<Activity className="h-16 w-16" />}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.REPORTES}
          element={
            <ProtectedRoute userType={userType}>
              <DashboardLayout {...dashboardProps}>
                {userType === "admin" ? (
                  <InformesPage userType={userType} />
                ) : (
                  <PlaceholderSection
                    title="Acceso Restringido"
                    description="Solo los administradores pueden ver esta sección."
                    icon={<FileText className="h-16 w-16" />}
                  />
                )}
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.CONFIGURACION}
          element={
            <ProtectedRoute userType={userType}>
              <DashboardLayout {...dashboardProps}>
                <PlaceholderSection
                  title="Configuración"
                  description="Configura los parámetros del sistema y preferencias de usuario."
                  icon={<Settings className="h-16 w-16" />}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            userType ? (
              <Navigate to={ROUTES.MENSUALIDADES} replace />
            ) : (
              <Navigate to={ROUTES.LOGIN} replace />
            )
          }
        />
      </Routes>

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
    </BrowserRouter>
  );
}
