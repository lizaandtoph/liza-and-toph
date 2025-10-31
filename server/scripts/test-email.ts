// server/scripts/test-email.ts
import { sendMagicLinkEmail } from "../email";

const to = process.env.TEST_EMAIL || "your@email.com";

// Use a harmless token for testing
await sendMagicLinkEmail({ to, token: "TEST" });

console.log("✓ Test email attempted. Check your inbox (or provider logs).");
