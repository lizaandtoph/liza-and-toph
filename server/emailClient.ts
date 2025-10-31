// server/emailClient.ts
import "dotenv/config";
import { Resend } from "resend";

type SendArgs = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

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
    try {
      const response = await (this.resend as any).emails.send({
        from: this.from,
        to,
        subject,
        html,
        text,
      });

      if (response.error) {
        console.error("[EMAIL][RESEND][ERROR]", {
          code: response.error.name || "Error",
          message: response.error.message,
        });
        throw new Error("Email send failed");
      }

      return { id: response.data?.id };
    } catch (err: any) {
      console.error("[EMAIL][RESEND][EXCEPTION]", err.message);
      throw new Error("Email send failed");
    }
  }
}

export function getEmailClient(): EmailClient {
  const provider = (process.env.EMAIL_PROVIDER || "").toLowerCase();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;

  if ((provider === "resend" || apiKey) && apiKey && from) {
    console.log("[EMAIL] Using Resend provider");
    return new ResendEmailClient(apiKey, from);
  }

  console.log("[EMAIL] Using Console (dev) provider");
  return new ConsoleEmailClient();
}

function mask(email: string) {
  try {
    const [u, d] = email.split("@");
    return `${u?.slice(0, 2) ?? ""}***@${d ?? ""}`;
  } catch {
    return "***";
  }
}
