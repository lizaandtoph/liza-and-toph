import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useStore } from '../store';
import { z } from 'zod';
import { ChevronRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { parentAccount, setLoggedIn } = useStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const loginData = loginSchema.parse(formData);
      
      if (!parentAccount) {
        setLoginError('No account found. Please sign up first.');
        return;
      }
      
      if (
        parentAccount.email === loginData.email &&
        parentAccount.password === loginData.password
      ) {
        setLoggedIn(true);
        setLocation('/playboard');
      } else {
        setLoginError('Incorrect email or password');
      }
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        e.errors.forEach(err => {
          newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-md py-16">
      <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-3 text-center" data-testid="heading-login">
          Welcome Back
        </h1>
        <p className="text-center mb-8 opacity-70">
          Sign in to access your Play Boards
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-3 font-semibold text-lg">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition"
              placeholder="your@email.com"
              data-testid="input-email"
            />
            {errors.email && <p className="text-burnt text-sm mt-2" data-testid="error-email">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-lg">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-6 py-4 bg-ivory border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition"
              placeholder="Enter your password"
              data-testid="input-password"
            />
            {errors.password && <p className="text-burnt text-sm mt-2" data-testid="error-password">{errors.password}</p>}
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-burnt/10 border-2 border-burnt/30 rounded-xl" data-testid="error-login">
              <p className="text-burnt font-medium">{loginError}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-olive text-ivory rounded-xl hover:bg-ochre transition font-semibold text-lg shadow-md hover:shadow-lg"
            data-testid="button-login"
          >
            Sign In
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm opacity-70">
            Don't have an account?{' '}
            <Link
              to="/onboarding"
              className="text-olive font-semibold hover:text-ochre transition"
              data-testid="link-signup"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
