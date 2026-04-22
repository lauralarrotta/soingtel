import { useState } from "react";
import { BarChart3, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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

  // El menú está colapsado si no está bloqueado (abierto fijamente) y tampoco tiene el cursor encima.
  const collapsed = !isLocked && !isHovered;

  const allMenuItems = [
    {
      id: "mensualidades",
      label: "Control de Mensualidades",
      icon: BarChart3,
      roles: ["facturacion", "soporte", "admin"],
    },
    {
      id: "fusagasuga",
      label: "Fusagasugá",
      icon: BarChart3,
      roles: ["facturacion", "soporte", "admin"],
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
        "h-[calc(100vh-4rem)] border-r bg-[#0A1628]/60 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0A1628]/40",
        "transition-[width] duration-300 ease-in-out relative z-40",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Glow effect on the right edge */}
      <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />

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
            "rounded-lg p-2 transition-colors",
            "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isLocked ? "bg-accent/50 text-primary" : "text-muted-foreground"
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
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative w-full rounded-xl",
                    "transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                    collapsed
                      ? "flex justify-center p-3"
                      : "flex items-center gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-400 shadow-lg shadow-cyan-500/10"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-cyan-500 shadow-lg shadow-cyan-500/30"
                    />
                  )}

                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200",
                      "group-hover:scale-110",
                      isActive ? "text-cyan-400" : ""
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
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
