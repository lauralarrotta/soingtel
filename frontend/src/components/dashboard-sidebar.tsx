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
        "h-[calc(100vh-4rem)] border-r bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50",
        "transition-[width] duration-300 ease-in-out relative z-40 shadow-sm",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 mt-1">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="px-2 text-xs font-semibold tracking-wide text-muted-foreground"
            >
              MENÚ
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
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    collapsed
                      ? "flex justify-center p-3"
                      : "flex items-center gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm font-medium"
                      : "text-foreground hover:bg-accent/80 hover:text-accent-foreground",
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                    />
                  )}

                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200",
                      "group-hover:scale-110",
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
