// server/logging.ts
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const PROD = process.env.NODE_ENV === 'production';
const SAFE_LOGGING = process.env.SAFE_LOGGING !== 'false'; // default true

// Mask common secret fields in query/headers (best-effort)
function mask(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  if (!value) return value;
  // Keep first/last 2 chars at most
  const len = value.length;
  if (len <= 6) return '***';
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

function sanitizeHeaders(h: Record<string, unknown>) {
  const clone: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(h)) {
    if (['authorization', 'cookie', 'x-api-key', 'x-auth-token', 'set-cookie'].includes(k.toLowerCase())) {
      clone[k] = '***';
    } else {
      clone[k] = v;
    }
  }
  return clone;
}

function sanitizeQuery(q: Record<string, unknown>) {
  const clone: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(q)) {
    if (/(token|auth|code|password)/i.test(k)) {
      clone[k] = mask(String(v ?? ''));
    } else {
      clone[k] = v;
    }
  }
  return clone;
}

// 1) Attach a stable request id
export function requestId(req: Request, _res: Response, next: NextFunction) {
  (req as any).requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  next();
}

// 2) Log minimal request/response metadata (no bodies)
export function auditLog(req: Request, res: Response, next: NextFunction) {
  if (!SAFE_LOGGING) return next();

  const started = Date.now();
  const id = (req as any).requestId;

  const metaIn = {
    id,
    method: req.method,
    path: req.originalUrl || req.url,
    query: PROD ? undefined : sanitizeQuery(req.query as any),
    headers: PROD ? undefined : sanitizeHeaders(req.headers as any),
  };
  console.log('[REQ]', metaIn);

  res.on('finish', () => {
    const ms = Date.now() - started;
    const metaOut = {
      id,
      status: res.statusCode,
      duration_ms: ms,
    };
    console.log('[RES]', metaOut);
  });

  next();
}
