import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MilestoneTimeline from "@/components/milestone-timeline";
import ProductGrid from "@/components/product-grid";
import { CheckCircle, Download, Printer, Share2, Star, TrendingUp } from "lucide-react";

export default function PlayBoard() {
  const { id } = useParams<{ id: string }>();

  const { data: playBoardData, isLoading, error } = useQuery<{
    childProfile: any;
    milestones: any[];
    products: any[];
  }>({
    queryKey: ["/api/play-boards", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <main className="pt-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  if (error || !playBoardData) {
    return (
      <main className="pt-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
                Play Board Not Found
              </h1>
              <p className="text-muted-foreground">
                The Play Board you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { childProfile, milestones, products } = playBoardData;
  const childName = childProfile?.name || "Your Child";

  // Calculate milestone stats by category
  const milestoneStats = {
    cognitive: milestones?.filter((m: any) => m.category === 'cognitive').length || 0,
    motor: milestones?.filter((m: any) => m.category === 'motor').length || 0,
    language: milestones?.filter((m: any) => m.category === 'language').length || 0,
    socialEmotional: milestones?.filter((m: any) => m.category === 'social-emotional').length || 0
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${childName}'s Play Board`,
          text: 'Check out this personalized Play Board from Liza & Toph',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <main className="pt-16 bg-card">
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          
          {/* Results Header */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 sm:p-12 mb-12 border border-border">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium mb-4">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Your Play Board is Ready!
                </div>
                <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
                  {childName}'s Personalized Play Board
                </h1>
                <p className="text-lg text-muted-foreground">
                  Age: {childProfile?.ageRange} • Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 no-print">
                <Button 
                  variant="outline" 
                  onClick={handlePrint}
                  data-testid="button-print"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Printer
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleShare}
                  data-testid="button-share"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button className="shadow-md" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Developmental Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-background border border-border">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cognitive</p>
                    <p className="text-2xl font-heading font-bold text-foreground">{milestoneStats.cognitive} milestones</p>
                    <p className="text-xs text-secondary mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Development area
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background border border-border">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Motor Skills</p>
                    <p className="text-2xl font-heading font-bold text-foreground">{milestoneStats.motor} milestones</p>
                    <p className="text-xs text-secondary mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Development area
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background border border-border">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Language</p>
                    <p className="text-2xl font-heading font-bold text-foreground">{milestoneStats.language} milestones</p>
                    <p className="text-xs text-secondary mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Development area
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border border-border">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Social-Emotional</p>
                    <p className="text-2xl font-heading font-bold text-foreground">{milestoneStats.socialEmotional} milestones</p>
                    <p className="text-xs text-secondary mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Development area
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Milestones Timeline */}
          {milestones && milestones.length > 0 && (
            <div className="mb-12">
              <MilestoneTimeline milestones={milestones} />
            </div>
          )}

          {/* Developmental Shifts Alert */}
          <div className="bg-accent/10 border-l-4 border-accent rounded-lg p-6 mb-12">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="text-lg font-heading font-semibold text-foreground mb-2">
                  Upcoming Developmental Shift
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your child's age range, expect exciting changes in mobility and cognitive development. 
                  This is a wonderful time of exploration and discovery!
                </p>
                <Button variant="link" className="p-0 h-auto text-accent">
                  Learn how to prepare →
                </Button>
              </div>
            </div>
          </div>

          {/* Product Recommendations */}
          {products && products.length > 0 && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
                  Recommended for {childName}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Expert-curated toys and books matched to your child's developmental stage and interests
                </p>
              </div>
              <ProductGrid products={products} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
