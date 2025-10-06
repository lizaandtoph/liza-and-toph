import { useState } from 'react';
import { Link } from 'wouter';
import { z } from 'zod';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      forgotPasswordSchema.parse({ email });

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 max-w-md py-16">
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-olive" data-testid="icon-success" />
          </div>
          <h2 className="text-3xl font-bold mb-4" data-testid="heading-success">
            Check Your Email
          </h2>
          <p className="text-lg mb-6 opacity-80" data-testid="text-success-message">
            If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
          </p>
          <p className="text-sm opacity-60 mb-8">
            Please check your inbox and spam folder.
          </p>
          <Link href="/login">
            <a className="inline-flex items-center gap-2 text-olive hover:underline" data-testid="link-back-to-login">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-md py-16">
      <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-8 h-8 text-olive" data-testid="icon-mail" />
          <h2 className="text-3xl font-bold" data-testid="heading-forgot-password">
            Forgot Password
          </h2>
        </div>
        <p className="mb-8 opacity-70" data-testid="text-instructions">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 font-semibold" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-sand focus:border-olive focus:outline-none transition-colors"
              placeholder="your@email.com"
              data-testid="input-email"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm" data-testid="text-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-olive text-ivory py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="button-send-reset-link"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-ivory border-t-transparent rounded-full" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login">
            <a className="text-olive hover:underline inline-flex items-center gap-2" data-testid="link-back-to-login">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
