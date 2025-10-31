// server/emailClient.ts
import "dotenv/config";
import { Resend } from "resend";

type SendArgs = { to: string; subject: string; html?: string; text?: string };

export interface EmailClient {
  send(args: SendArgs): Promise<{ id?: string }>;
}

class ConsoleEmailClient implements EmailClient {
  async send({ to, subject }: SendArgs) {
    console.log(
      `[EMAIL][DEV] to=${mask(to)} subject="${subject}" (body suppressed)`,
    );
    return { id: "dev-console" };
  }
}

class ResendEmailClient implements EmailClient {
  private resend: Resend;
  private from: string;
  constructor(apiKey: string, from: string) {
    this.resend = new Resend(apiKey);
    this.from = from;
  }
  async send({ to, subject, html, text }: SendArgs) {
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      // Don’t throw raw error contents; keep logs minimal + safe
      console.error("[EMAIL][RESEND][ERROR]", {
        code: (error as any)?.name || "Error",
      });
      throw new Error("Email send failed");
    }

    return { id: (data as any)?.id };
  }
}

export function getEmailClient(): EmailClient {
  const provider = (process.env.EMAIL_PROVIDER || "").toLowerCase();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if ((provider === "resend" || apiKey) && apiKey && from) {
    return new ResendEmailClient(apiKey, from);
  }
  return new ConsoleEmailClient(); // safe dev fallback
}

function mask(email: string) {
  try {
    const [u, d] = email.split("@");
    return `${u?.slice(0, 2) ?? ""}***@${d ?? ""}`;
  } catch {
    return "***";
  }
}

function logProvider() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (apiKey && from) {
    console.log("[EMAIL] provider=Resend (env)");
  } else {
    console.log("[EMAIL] provider=Console (dev fallback)");
  }
}
logProvider();
