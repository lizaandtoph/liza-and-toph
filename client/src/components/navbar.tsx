import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, HelpCircle } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-heading font-bold text-foreground">Liza & Toph</span>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="hidden sm:inline-flex"
              data-testid="button-how-it-works"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              How It Works
            </Button>
            <Link href="/questionnaire">
              <Button 
                className="shadow-md font-medium"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
