import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ShieldCheck, Eye, EyeOff, Lock, User } from "lucide-react";

interface LoginProps {
  onLogin: (userType: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 partículas optimizadas (no se recalculan en cada render)
  const particles = useMemo(
    () =>
      [...Array(15)].map(() => ({
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 3,
      })),
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (username === "facturacion" && password === "facturacion123") {
        onLogin("facturacion");
      } else if (username === "soporte" && password === "soporte123") {
        onLogin("soporte");
      } else if (username === "admin" && password === "admin123") {
        onLogin("admin");
      } else {
        setError("Credenciales incorrectas. Intenta nuevamente.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-black text-white selection:bg-blue-500/30 selection:text-white">

      {/* 🎬 VIDEO */}
      <div className="relative h-[30%] md:h-full md:w-1/2">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>

        {/* ✨ partículas */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: [-20, -80] }}
              transition={{ duration: 6, repeat: Infinity, delay: p.delay }}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{ left: p.left, bottom: 0 }}
            />
          ))}
        </div>
      </div>

      {/* 🔐 LOGIN */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 md:py-0 md:px-12 lg:px-20 relative">

        {/* 🌌 glow */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute w-64 h-64 md:w-96 md:h-96 bg-blue-500/10 blur-[140px] rounded-full"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="relative rounded-2xl p-px bg-gradient-to-r from-blue-500/40 via-cyan-500/30 to-transparent"
          >
            <div className="bg-[#0F172A]/80 backdrop-blur-2xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">

              {/* HEADER */}
              <div className="mb-6 md:mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                    Bienvenido
                  </h2>
                  <p className="text-xs md:text-sm text-white/60 mt-0.5">
                    Sistema de Gestión Soingtel
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">

                {/* USERNAME */}
                <div className="space-y-1.5 md:space-y-2 relative">
                  <Label className="text-[10px] md:text-xs text-white/60 uppercase tracking-wide">
                    Usuario
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      type="text"
                      placeholder="Ingresa tu usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className={`h-10 md:h-11 bg-white/5 border text-white placeholder:text-white/30 rounded-md pl-10 pr-3 transition-all duration-200
                      ${
                        error
                          ? "border-red-400 focus-visible:ring-red-400"
                          : "border-white/10 focus-visible:ring-blue-400/70 focus-visible:border-blue-400"
                      }`}
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-1.5 md:space-y-2 relative">
                  <Label className="text-[10px] md:text-xs text-white/60 uppercase tracking-wide">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`h-10 md:h-11 bg-white/5 border text-white placeholder:text-white/30 rounded-md pl-10 pr-10 transition-all duration-200
                      ${
                        error
                          ? "border-red-400 focus-visible:ring-red-400"
                          : "border-white/10 focus-visible:ring-blue-400/70 focus-visible:border-blue-400"
                      }`}
                    />

                  {/* 👁️ */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-[30px] md:top-[34px] text-white/50 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs md:text-sm text-red-400 border border-red-400/30 px-3 py-2 rounded-md bg-red-400/5"
                  >
                    {error}
                  </motion.div>
                )}

                {/* BOTÓN */}
                <motion.div whileTap={{ scale: 0.96 }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-10 md:h-11 rounded-md font-semibold overflow-hidden group disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-90 group-hover:opacity-100 group-hover:brightness-110 transition" />

                    <span className="relative z-10 text-black flex items-center justify-center gap-2 text-sm md:text-base">
                      {loading && (
                        <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                      )}
                      {loading ? "Validando..." : "Entrar"}
                    </span>
                  </Button>
                </motion.div>

              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}