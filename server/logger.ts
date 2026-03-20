import winston from "winston";

const logLevel = process.env.LOG_LEVEL || "info";
const nodeEnv = process.env.NODE_ENV || "development";

const PII_PATTERNS = [
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: "[EMAIL_REDACTED]",
  },
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "[SSN_REDACTED]" },
  { pattern: /\b\d{16}\b/g, replacement: "[CARD_REDACTED]" },
  { pattern: /\b\d{3}-\d{3}-\d{4}\b/g, replacement: "[PHONE_REDACTED]" },
  { pattern: /"password"\s*:\s*"[^"]*"/gi, replacement: '"password":"[REDACTED]"' },
  { pattern: /"token"\s*:\s*"[^"]*"/gi, replacement: '"token":"[REDACTED]"' },
  { pattern: /"secret"\s*:\s*"[^"]*"/gi, replacement: '"secret":"[REDACTED]"' },
  { pattern: /"apiKey"\s*:\s*"[^"]*"/gi, replacement: '"apiKey":"[REDACTED]"' },
  { pattern: /"authorization"\s*:\s*"[^"]*"/gi, replacement: '"authorization":"[REDACTED]"' },
];

function scrubPII(text: string): string {
  let scrubbedText = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    scrubbedText = scrubbedText.replace(pattern, replacement);
  }
  return scrubbedText;
}

function scrubObject(obj: any): any {
  if (typeof obj === "string") {
    return scrubPII(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(scrubObject);
  }
  if (obj && typeof obj === "object") {
    const scrubbed: any = {};
    for (const key of Object.keys(obj)) {
      if (["password", "token", "secret", "apiKey", "authorization"].includes(key.toLowerCase())) {
        scrubbed[key] = "[REDACTED]";
      } else {
        scrubbed[key] = scrubObject(obj[key]);
      }
    }
    return scrubbed;
  }
  return obj;
}

const piiScrubFormat = winston.format((info) => {
  if (info.message && typeof info.message === "string") {
    info.message = scrubPII(info.message);
  }
  if (info.meta) {
    info.meta = scrubObject(info.meta);
  }
  return info;
})();

const logFormat = winston.format.combine(
  piiScrubFormat,
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  piiScrubFormat,
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: nodeEnv === "development" ? consoleFormat : logFormat,
  }),
];

if (nodeEnv === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: logFormat,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: logFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  exitOnError: false,
});

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: string, message: string, meta?: any) {
    logger.log(level, message, { context: this.context, ...meta });
  }

  error(message: string, error?: Error | any, meta?: any) {
    this.log("error", message, {
      error: error?.message,
      stack: error?.stack,
      ...meta,
    });
  }

  warn(message: string, meta?: any) {
    this.log("warn", message, meta);
  }

  info(message: string, meta?: any) {
    this.log("info", message, meta);
  }

  debug(message: string, meta?: any) {
    this.log("debug", message, meta);
  }

  http(message: string, meta?: any) {
    this.log("http", message, meta);
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
