import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

export async function getUncachableResendClient() {
  const {apiKey, fromEmail} = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'onboarding@resend.dev'
  };
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const { client, fromEmail } = await getUncachableResendClient();
  const resetUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/reset-password/${resetToken}`;
  
  await client.emails.send({
    from: fromEmail,
    to,
    subject: 'Reset Your Password - Liza & Toph',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4A5D23;">Password Reset Request</h2>
        <p>We received a request to reset your password for your Liza & Toph account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4A5D23; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 14px; margin-top: 24px;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendMagicLinkEmail(to: string, loginToken: string, protocol: string = 'https') {
  const { client, fromEmail } = await getUncachableResendClient();
  
  // Determine the base URL
  const hostname = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
  const baseUrl = hostname.includes('localhost') ? `http://${hostname}` : `${protocol}://${hostname}`;
  const loginUrl = `${baseUrl}/api/auth/verify/${loginToken}`;
  
  await client.emails.send({
    from: fromEmail,
    to,
    subject: 'Your Login Link - Liza & Toph',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4A5D23;">Login to Your Account</h2>
        <p>Click the button below to securely log in to your Liza & Toph account:</p>
        <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4A5D23; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">Log In to Liza & Toph</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${loginUrl}</p>
        <p style="color: #999; font-size: 14px; margin-top: 24px;">This link will expire in 15 minutes and can only be used once.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this login link, you can safely ignore this email.</p>
      </div>
    `,
  });
}
