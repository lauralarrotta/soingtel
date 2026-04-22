const winston = require("winston");
const path = require("path");
const fs = require("fs");
const config = require("../../config/env");

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const logDir = path.resolve(__dirname, "../../../../logs");

if (config.nodeEnv === "production" && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
  return `${timestamp} [${level}]: ${message} ${metaStr}`;
});

const Logger = winston.createLogger({
  level: config.nodeEnv === "production" ? "info" : "debug",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    config.nodeEnv === "production" ? json() : combine(colorize(), logFormat)
  ),
  defaultMeta: { service: "soingtel-api", env: config.nodeEnv },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
    ...(config.nodeEnv === "production"
      ? [
          new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            maxsize: 5242880,
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
            maxsize: 5242880,
            maxFiles: 5,
          }),
        ]
      : []),
  ],
  exitOnError: false,
});

module.exports = Logger;
