import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ShieldCheck, Eye, EyeOff, Lock, User, Zap, Cpu, Globe } from "lucide-react";

interface LoginProps {
  onLogin: (userType: string, token?: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const particles = useMemo(
    () =>
      [...Array(20)].map(() => ({
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        size: Math.random() * 3 + 1,
      })),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://soingtel.onrender.com/api'}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: username, contrasena: password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("token", data.data.token);
        onLogin(data.data.rol, data.data.token);
      } else {
        setError(data.message || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de conexión. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-[#030712] text-slate-100 selection:bg-cyan-500/30 selection:text-white relative">

      {/* Grid background */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />

      {/* VIDEO */}
      <div className="relative h-[25%] md:h-full md:w-1/2">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="./video.mp4" type="video/mp4" />
        </video>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.8, 0], y: [-30, -100] }}
              transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, delay: p.delay }}
              className="absolute rounded-full bg-cyan-400/60"
              style={{ left: p.left, bottom: '20%', width: p.size, height: p.size }}
            />
          ))}
        </div>

        {/* Logo overlay */}
        <div className="absolute bottom-8 left-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Globe className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight neon-text-cyan">Soingtel</h1>
              <p className="text-xs text-cyan-400/70 uppercase tracking-widest">Starlink Management</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* LOGIN */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 md:py-0 md:px-12 lg:px-24 relative">

        {/* Glow effects */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute w-72 h-72 bg-cyan-500/10 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute w-64 h-64 bg-blue-500/10 blur-[140px] rounded-full right-12"
        />

        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          {/* Main card */}
          <div className="relative rounded-2xl overflow-hidden">
            {/* Animated border gradient */}
            <div className="absolute inset-0 p-[1px] rounded-2xl bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-cyan-500/50 animate-border-glow" />
            <div className="absolute inset-0 p-[1px] rounded-2xl bg-gradient-to-br from-transparent via-cyan-500/20 to-transparent" />

            <div className="relative bg-[#0A1628]/90 backdrop-blur-2xl rounded-2xl p-8 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">

              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30 rounded-br-2xl" />

              {/* HEADER */}
              <div className="mb-8 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 glow-cyan">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Acceso Seguro
                  </h2>
                  <p className="text-xs text-cyan-400/70 mt-1 flex items-center gap-1.5">
                    <Cpu className="h-3 w-3" />
                    Sistema de Gestión Starlink
                  </p>
                </div>
              </div>

              {/* Decorative line */}
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-6" />

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* USERNAME */}
                <div className="space-y-2 relative">
                  <Label className="text-[10px] text-cyan-400/80 uppercase tracking-widest font-medium">
                    Identificador
                  </Label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur-[1px]" />
                    <div className="relative flex items-center">
                      <User className="absolute left-4 h-5 w-5 text-cyan-500/50 z-10" />
                      <Input
                        type="text"
                        placeholder="Ingresa tu usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="h-12 bg-[#0F2744]/50 border border-cyan-500/20 text-white placeholder:text-slate-500 rounded-lg pl-12 pr-4 transition-all duration-300 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 focus:bg-[#0F2744]/70"
                      />
                    </div>
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2 relative">
                  <Label className="text-[10px] text-cyan-400/80 uppercase tracking-widest font-medium">
                    Contraseña
                  </Label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur-[1px]" />
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 h-5 w-5 text-cyan-500/50 z-10" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 bg-[#0F2744]/50 border border-cyan-500/20 text-white placeholder:text-slate-500 rounded-lg pl-12 pr-12 transition-all duration-300 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 focus:bg-[#0F2744]/70"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="absolute right-4 text-cyan-500/50 hover:text-cyan-400 transition-colors z-10"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="text-sm text-red-400 border border-red-500/30 px-4 py-3 rounded-lg bg-red-500/10 flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    {error}
                  </motion.div>
                )}

                {/* BUTTON */}
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-12 rounded-lg font-semibold overflow-hidden group disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-2"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-cyan-500/20 to-blue-500/20" />

                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 opacity-90 group-hover:opacity-100 group-hover:brightness-110 transition-all duration-300" />

                    {/* Animated shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity">
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>

                    <span className="relative z-10 text-black flex items-center justify-center gap-2 font-semibold tracking-wide">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                          <span>Verificando...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          <span>ACCEDER AL SISTEMA</span>
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>

              </form>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-cyan-500/10">
                <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">
                  Soingtel v2.0 • Sistema de Gestión Starlink
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
