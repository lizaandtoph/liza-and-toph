import { useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronRight, LogIn } from 'lucide-react';

export default function Login() {
  useEffect(() => {
    window.location.href = '/api/login';
  }, []);

  return (
    <div className="container mx-auto px-4 max-w-md py-16">
      <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-olive/10 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-olive" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-3 text-center" data-testid="heading-login">
          Welcome Back
        </h1>
        <p className="text-center mb-8 opacity-70">
          Redirecting you to sign in...
        </p>

        <p className="text-center text-sm opacity-60 mb-6">
          If you're not redirected automatically,{' '}
          <a 
            href="/api/login"
            className="text-olive font-semibold hover:text-ochre transition"
            data-testid="link-manual-login"
          >
            click here
          </a>
        </p>

        <div className="mt-8 text-center">
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
