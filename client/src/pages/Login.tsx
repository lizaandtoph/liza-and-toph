import { useState } from 'react';
import { Link } from 'wouter';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/request-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send login link');
      }

      setEmailSent(true);
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send login link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="container mx-auto px-4 max-w-md py-16">
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-olive/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-olive" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-3 text-center" data-testid="heading-check-email">
            Check Your Email
          </h1>
          <p className="text-center mb-6 opacity-70" data-testid="text-email-sent">
            We've sent a login link to <strong>{email}</strong>
          </p>
          
          <div className="bg-white/50 border border-olive/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-center">
              Click the link in your email to log in. The link will expire in 15 minutes.
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm opacity-70 mb-2">
              Didn't receive the email?
            </p>
            <Button
              onClick={() => setEmailSent(false)}
              variant="ghost"
              className="text-olive hover:text-ochre"
              data-testid="button-try-again"
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-md py-16">
      <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-10 rounded-2xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-olive/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-olive" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-3 text-center" data-testid="heading-login">
          Get Started
        </h1>
        <p className="text-center mb-8 opacity-70">
          Enter your email to receive a secure login link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-base">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2"
              disabled={isLoading}
              required
              data-testid="input-email"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-olive hover:bg-olive/90 text-white"
            disabled={isLoading}
            data-testid="button-send-login-link"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Login Link
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm opacity-70">
            New user? No problem! We'll create your account automatically when you use your login link.
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs opacity-60">
            We'll send you a secure link that logs you in instantly—no password needed.
          </p>
        </div>
      </div>
    </div>
  );
}
