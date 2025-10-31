// server/email.ts
import "dotenv/config";
import { getEmailClient } from "./emailClient";
import { checkRateLimit } from "./utils/rateLimit";

// Resolve the public base URL safely
function resolveBaseUrl(protocolOverride?: string) {
  // Highest priority: explicit public URL
  const explicit = process.env.PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  // Next: Replit domains (prefer custom over *.replit.app)
  const domains =
    process.env.REPLIT_DOMAINS?.split(",")
      .map((d) => d.trim())
      .filter(Boolean) || [];
  const custom = domains.find((d) => !d.includes(".replit.app"));
  const host = custom || domains[0];
  if (host) {
    const protocol = protocolOverride || "https";
    return `${protocol}://${host}`;
  }

  // Local dev fallback
  return "http://localhost:5000";
}

function layout(innerHtml: string) {
  return `
  <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111; line-height:1.5">
    <div style="max-width:640px;margin:24px auto;padding:24px;border:1px solid #eee;border-radius:16px;background:#fff">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-weight:700;font-size:18px;">Liza & Toph</div>
        <div style="color:#666;font-size:14px;">Because childhood isn’t guesswork.</div>
      </div>
      ${innerHtml}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <div style="font-size:12px;color:#666">
        You’re receiving this message because someone requested this action in Liza & Toph.
        If this wasn’t you, ignore this email—no changes were made.
      </div>
    </div>
  </div>`;
}

function hashEmail(email: string) {
  try {
    const s = email.trim().toLowerCase();
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return `h${h.toString(16)}`;
  } catch {
    return "h0";
  }
}

/**
 * Send a password reset email.
 * Rate-limited: 3 per 5 minutes per email.
 */
export async function sendPasswordResetEmail(to: string, resetToken: string) {
  // Lightweight rate limit
  if (!checkRateLimit(`reset_${to}`)) {
    console.warn("[RATE LIMIT] Too many reset requests", {
      toHash: hashEmail(to),
    });
    return;
  }

  const baseUrl = resolveBaseUrl(); // prefer PUBLIC_APP_URL, then REPLIT_DOMAINS, then localhost
  const resetUrl = `${baseUrl}/reset-password/${encodeURIComponent(resetToken)}`;

  const subject = "Reset your password — Liza & Toph";
  const html = layout(`
    <p>We received a request to reset your password for your Liza & Toph account.</p>
    <p>Click the button below to reset your password:</p>
    <p><a href="${resetUrl}" style="display:inline-block;background:#3D572A;color:#fff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:600">Reset password</a></p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="color:#666;word-break:break-all">${resetUrl}</p>
    <p style="color:#999;font-size:14px;margin-top:24px">This link will expire in 1 hour.</p>
    <p style="color:#999;font-size:14px">If you didn't request this, you can safely ignore this email.</p>
  `);
  const text = `Reset your Liza & Toph password:\n${resetUrl}\nThis link expires in 1 hour.`;

  const client = getEmailClient();
  const { id } = await client.send({ to, subject, html, text });

  // Privacy-safe log (no PII)
  console.log("[EMAIL] password_reset sent", { id, toHash: hashEmail(to) });
}

/**
 * Send a magic link email.
 * Rate-limited: 3 per 5 minutes per email.
 * @param protocol Optional override to force http/https when using REPLIT_DOMAINS. PUBLIC_APP_URL is preferred.
 */
export async function sendMagicLinkEmail(
  to: string,
  loginToken: string,
  protocol: string = "https",
) {
  // Lightweight rate limit
  if (!checkRateLimit(`magic_${to}`)) {
    console.warn("[RATE LIMIT] Too many magic link requests", {
      toHash: hashEmail(to),
    });
    return;
  }

  // Prefer PUBLIC_APP_URL if set; otherwise allow protocol override for REPLIT_DOMAINS path
  const baseUrl = process.env.PUBLIC_APP_URL
    ? resolveBaseUrl()
    : resolveBaseUrl(protocol);

  const loginUrl = `${baseUrl}/api/auth/verify/${encodeURIComponent(loginToken)}`;

  const subject = "Your login link — Liza & Toph";
  const html = layout(`
    <p>Tap the button below to sign in:</p>
    <p><a href="${loginUrl}" style="display:inline-block;background:#3D572A;color:#fff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:600">Sign in</a></p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="color:#666;word-break:break-all">${loginUrl}</p>
    <p style="color:#999;font-size:14px;margin-top:24px">This link will expire in 15 minutes and can only be used once.</p>
    <p style="color:#999;font-size:14px">If you didn't request this, you can safely ignore this email.</p>
  `);
  const text = `Sign in to Liza & Toph:\n${loginUrl}\nThis link expires in 15 minutes and can only be used once.`;

  const client = getEmailClient();
  const { id } = await client.send({ to, subject, html, text });

  // Privacy-safe log (no PII)
  console.log("[EMAIL] magic_link sent", { id, toHash: hashEmail(to) });
}
