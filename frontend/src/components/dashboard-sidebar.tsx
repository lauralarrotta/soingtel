import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, PanelLeftClose, PanelLeftOpen, FileText, Settings } from "lucide-react";
import { cn } from "./ui/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userType: string;
}

export default function DashboardSidebar({
  activeSection,
  onSectionChange,
  userType,
}: DashboardSidebarProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const collapsed = !isLocked && !isHovered;

  const allMenuItems = [
    {
      id: "mensualidades",
      label: "Control de Mensualidades",
      icon: BarChart3,
      roles: ["facturacion", "soporte", "admin"],
      path: "/mensualidades",
    },
    {
      id: "fusagasuga",
      label: "Fusagasugá",
      icon: BarChart3,
      roles: ["facturacion", "soporte", "admin"],
      path: "/fusagasuga",
    },
    {
      id: "informes",
      label: "Informes",
      icon: FileText,
      roles: ["admin"],
      path: "/reportes",
    },
    {
      id: "configuracion",
      label: "Configuración",
      icon: Settings,
      roles: ["admin"],
      path: "/configuracion",
    },
  ];

  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(userType),
  );

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "h-[calc(100vh-4rem)] border-r bg-white dark:bg-[#0A1628]/90 backdrop-blur-xl",
        "transition-[width] duration-300 ease-in-out relative z-40 shadow-sm",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Cyan accent line */}
      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-cyan-400 to-cyan-500" />

      {/* Header */}
      <div className="flex items-center justify-between p-3 mt-1">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="px-2 text-[9px] font-bold tracking-[0.2em] text-cyan-400/60 uppercase"
            >
              Menú
            </motion.span>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsLocked(!isLocked)}
          className={cn(
            "rounded-lg p-2 transition-colors cursor-pointer",
            "hover:bg-cyan-100 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
            isLocked ? "bg-cyan-100 text-cyan-600" : "text-slate-500"
          )}
          aria-label={isLocked ? "Desbloquear menú" : "Fijar menú abierto"}
          title={isLocked ? "Desfijar menú" : "Fijar menú abierto"}
        >
          {isLocked ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 pb-4 mt-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "group relative w-full rounded-xl cursor-pointer block",
                      "transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                      collapsed
                        ? "flex justify-center p-3"
                        : "flex items-center gap-3 px-3 py-2.5",
                      isActive || activeSection === item.id
                        ? "bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-600 dark:text-cyan-400 shadow-md shadow-cyan-500/10 font-medium"
                        : "text-slate-600 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator */}
                      {(isActive || activeSection === item.id) && (
                        <motion.div
                          layoutId="sidebar-active-pill"
                          className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-cyan-500 shadow-lg shadow-cyan-500/30"
                        />
                      )}

                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-transform duration-200",
                          "group-hover:scale-110",
                          isActive || activeSection === item.id ? "text-cyan-400" : ""
                        )}
                      />

                      <AnimatePresence initial={false}>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="truncate text-sm"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
