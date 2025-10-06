import { useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { z } from 'zod';
import { Lock, CheckCircle } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [, params] = useRoute('/reset-password/:token');
  const [, setLocation] = useLocation();
  const token = params?.token;

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    setIsLoading(true);

    try {
      const validatedData = resetPasswordSchema.parse(formData);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: validatedData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setLocation('/login');
        }, 3000);
      } else {
        setServerError(data.error || 'Failed to reset password');
      }
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        e.errors.forEach(err => {
          newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      } else {
        setServerError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 max-w-md py-16">
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-600" data-testid="heading-invalid-link">
            Invalid Reset Link
          </h2>
          <p className="mb-6 opacity-70">
            This password reset link is invalid or has expired.
          </p>
          <Link href="/forgot-password">
            <a className="text-olive hover:underline font-semibold" data-testid="link-request-new">
              Request a new reset link
            </a>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 max-w-md py-16">
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-olive" data-testid="icon-success" />
          </div>
          <h2 className="text-3xl font-bold mb-4" data-testid="heading-success">
            Password Reset Successful!
          </h2>
          <p className="text-lg mb-6 opacity-80" data-testid="text-success-message">
            Your password has been successfully reset.
          </p>
          <p className="text-sm opacity-60">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-md py-16">
      <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-8 h-8 text-olive" data-testid="icon-lock" />
          <h2 className="text-3xl font-bold" data-testid="heading-reset-password">
            Reset Your Password
          </h2>
        </div>
        <p className="mb-8 opacity-70" data-testid="text-instructions">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 font-semibold" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-sand focus:border-olive focus:outline-none transition-colors"
              placeholder="Enter new password"
              data-testid="input-password"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1" data-testid="error-password">
                {errors.password}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-semibold" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-sand focus:border-olive focus:outline-none transition-colors"
              placeholder="Confirm new password"
              data-testid="input-confirm-password"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1" data-testid="error-confirm-password">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {serverError && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm" data-testid="text-server-error">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-olive text-ivory py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="button-reset-password"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-ivory border-t-transparent rounded-full" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login">
            <a className="text-olive hover:underline" data-testid="link-back-to-login">
              Back to Login
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
