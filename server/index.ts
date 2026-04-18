import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5001",
  "https://electro-manager.vercel.app",
  "https://veneziaelectro.vercel.app",
  "https://electro-manager-dashboard.onrender.com",
];

const apiCors = cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("CORS blocked origin:", origin);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: unknown = undefined;

  const originalJson = res.json.bind(res);

  res.json = ((body: unknown) => {
    capturedJsonResponse = body;
    return originalJson(body);
  }) as typeof res.json;

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (capturedJsonResponse !== undefined) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          logLine += ` :: [unserializable response]`;
        }
      }

      log(logLine);
    }
  });

  next();
});

let isBootstrapped = false;

async function bootstrap() {
  if (isBootstrapped) return;
  isBootstrapped = true;

  app.use("/api", apiCors);

  app.get("/healthz", (_req, res) => {
    res.status(200).send("ok");
  });

  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) return;

    res.status(status).json({ message });
  });
}

if (process.env.VERCEL !== "1") {
  bootstrap()
    .then(() => {
      const port = Number(process.env.PORT || 10000);
      app.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("[bootstrap error]", err);
      process.exit(1);
    });
} else {
  bootstrap();
}

export default app;