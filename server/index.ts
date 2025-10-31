import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { requestId, auditLog } from "./logging"; // ✅ new: safe, structured logging (no bodies)

const app = express();

// Trust proxy for production (must be set before session middleware)
app.set("trust proxy", 1);

// ----- Minimal, privacy-safe request logging -----
// Adds a stable request id and logs method/path/status/duration (no bodies, no PII)
app.use(requestId);
app.use(auditLog);

// ----- Parsers & basics -----
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Keep raw body capture for webhooks if needed (still safe; we don't log it)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ❌ Removed old middleware that monkey-patched res.json and logged response bodies
// (This prevented PII/token leakage into logs.)

(async () => {
  const server = await registerRoutes(app);

  // Central error handler (returns minimal message; no stack/PII)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    // Keep a server-side error for operators without leaking response bodies
    try {
      log(`[ERROR] ${status} ${message}`);
    } catch {}
  });

  // Only setup Vite dev server in development after routes are registered
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve API + client
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
