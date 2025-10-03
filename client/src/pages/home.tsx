import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, CheckCircle, Sparkles, ClipboardList, Wand2, ShoppingBag, Star, ArrowRight, PlayCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="gradient-hero py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Trusted by 50,000+ Parents
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight mb-6">
                Unlock Your Child's{" "}
                <span className="text-primary">Developmental</span> Potential
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
                Get a personalized Play Board tailored to your child's age, interests, and developmental stage. 
                Discover milestones, developmental shifts, and curated toy & book recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/questionnaire">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg font-heading font-semibold shadow-lg"
                    data-testid="button-create-play-board"
                  >
                    Create Your Play Board
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 text-lg font-heading font-semibold border-2"
                  data-testid="button-watch-demo"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="mt-10 flex items-center justify-center lg:justify-start space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-secondary mr-2" />
                  <span>Free to Start</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-secondary mr-2" />
                  <span>Evidence-Based</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-secondary mr-2" />
                  <span>Expert Curated</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Parent and child playing together" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-xl hidden lg:block border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Track Progress</p>
                    <p className="text-xl font-heading font-bold text-foreground">12 Milestones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to unlock personalized developmental insights for your child
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background card-hover border border-border">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardList className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  Answer Questions
                </h3>
                <p className="text-muted-foreground">
                  Complete a brief questionnaire about your child's age, interests, and developmental stage
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background card-hover border border-border">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wand2 className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  Get Your Play Board
                </h3>
                <p className="text-muted-foreground">
                  Receive personalized milestones, developmental shifts, and learning goals for your child
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background card-hover border border-border">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  Shop Recommendations
                </h3>
                <p className="text-muted-foreground">
                  Explore curated toys and books matched to your child's developmental needs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Loved by Parents Everywhere
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of parents using Liza & Toph to support their child's development
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 text-accent mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4">
                  "The Play Board has been incredible! It's like having a developmental expert guiding us. 
                  The toy recommendations are spot-on for our daughter's stage."
                </p>
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
                    alt="Parent testimonial" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-heading font-semibold text-foreground">Sarah M.</p>
                    <p className="text-sm text-muted-foreground">Mom of 8-month-old</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 text-accent mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4">
                  "Finally, a resource that makes developmental milestones easy to understand. 
                  Love the curated product recommendations - saved us so much research time!"
                </p>
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
                    alt="Parent testimonial" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-heading font-semibold text-foreground">Michael T.</p>
                    <p className="text-sm text-muted-foreground">Dad of 1-year-old</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 text-accent mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4">
                  "As a first-time parent, this app gave me confidence. The milestone tracking is reassuring, 
                  and the activity ideas are practical and fun!"
                </p>
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
                    alt="Parent testimonial" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-heading font-semibold text-foreground">Jessica L.</p>
                    <p className="text-sm text-muted-foreground">Mom of 6-month-old</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 sm:p-16 text-center shadow-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
              Ready to Support Your Child's Development?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Create your personalized Play Board in just 3 minutes and start making every moment count.
            </p>
            <Link href="/questionnaire">
              <Button 
                size="lg" 
                className="h-14 px-10 bg-white text-primary hover:shadow-2xl transition-all transform hover:scale-105 font-heading font-bold text-lg"
                data-testid="button-create-free-play-board"
              >
                Create Your Free Play Board
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
            <p className="text-sm text-white/80 mt-6">
              No credit card required • Takes less than 3 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-heading font-bold text-foreground">Liza & Toph</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Supporting parents with evidence-based developmental guidance and curated product recommendations.
              </p>
              <div className="flex items-center space-x-3">
                <a href="#" className="w-9 h-9 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition">
                  <span>f</span>
                </a>
                <a href="#" className="w-9 h-9 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition">
                  <span>i</span>
                </a>
                <a href="#" className="w-9 h-9 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition">
                  <span>p</span>
                </a>
                <a href="#" className="w-9 h-9 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition">
                  <span>y</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">How It Works</a></li>
                <li><a href="#" className="hover:text-primary transition">Play Board</a></li>
                <li><a href="#" className="hover:text-primary transition">Marketplace</a></li>
                <li><a href="#" className="hover:text-primary transition">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition">Development Guides</a></li>
                <li><a href="#" className="hover:text-primary transition">Activity Ideas</a></li>
                <li><a href="#" className="hover:text-primary transition">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2024 Liza & Toph. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">
              Made with <Heart className="w-4 h-4 text-primary inline mx-1" /> for parents everywhere
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
