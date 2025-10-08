import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";

export default function Subscribe() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand/30">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/30 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-[#fff9ec] border-olive/20">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-olive/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-olive" />
              </div>
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-serif text-espresso">
              You're In. Enjoy Full Access, On Us.
            </CardTitle>
            <CardDescription className="text-lg text-espresso/80 max-w-2xl mx-auto">
              As one of our foundational users, you have complete, unrestricted access to all Liza & Toph platform features, entirely free through January 2026.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="bg-white/50 rounded-lg p-6 space-y-4">
              <p className="text-espresso/90 leading-relaxed">
                We are in a critical stage of building this platform, and your experience is our most valuable guide. During this early-access period, we ask for your expertise. Your insights on what's working, what's missing, and what you'd love to see will directly shape the future of this tool for families everywhere.
              </p>
              <p className="text-espresso/90 leading-relaxed font-medium">
                Have an idea or feedback to share? We would be honored if you'd take a few minutes to help us design the future of play.
              </p>
            </div>
            
            <div className="pt-4">
              <Button 
                size="lg"
                className="bg-olive hover:bg-olive/90 text-white px-8 py-6 text-lg h-auto"
                onClick={() => window.open('https://app-feedback.lizaandtoph.com', '_blank')}
                data-testid="button-share-feedback"
              >
                Share Your Insights at app-feedback.lizaandtoph.com
              </Button>
            </div>

            <div className="pt-6">
              <Button 
                variant="outline"
                onClick={() => setLocation('/playboard')}
                data-testid="button-continue-to-playboard"
              >
                Continue to Your Play Board
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
