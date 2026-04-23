require("dotenv").config();
const { z } = require("zod");

const envSchema = z.object({
  PORT: z.string().default("3001"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:5173,https://soingtel-o6kyf19vj-laura-larrottas-projects.vercel.app"),
  DATABASE_URL: z.string().optional(),
  DATABASE_SSL: z.enum(["true", "false"]).default("false"),
  GOOGLE_SHEET_ID: z.string().optional(),
  GOOGLE_CLIENT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"),
  RATE_LIMIT_MAX: z.string().default("100"),
  USERS: z.string().default("soporte:soporte123,facturacion:facturacion123,admin:admin123"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.warn("Validacion de env fallida:", parsed.error.flatten().fieldErrors);
}

const USUARIOS_VALIDOS = parsed.data.USERS.split(",").map((u) => {
  const [usuario, contrasena, rol = "basic"] = u.split(":");
  return { usuario: usuario.trim(), contrasena: contrasena.trim(), rol: rol.trim() };
});

module.exports = {
  port: parseInt(parsed.data.PORT) || 3001,
  nodeEnv: parsed.data.NODE_ENV,
  cors: {
    origin: parsed.data.CORS_ORIGINS.split(","),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  database: {
    connectionString: parsed.data.DATABASE_URL,
    ssl: parsed.data.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
  },
  googleSheets: {
    spreadsheetId: parsed.data.GOOGLE_SHEET_ID,
    clientEmail: parsed.data.GOOGLE_CLIENT_EMAIL,
    privateKey: parsed.data.GOOGLE_PRIVATE_KEY,
  },
  rateLimit: {
    windowMs: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(parsed.data.RATE_LIMIT_MAX) || 100,
  },
  USUARIOS_VALIDOS,
};
