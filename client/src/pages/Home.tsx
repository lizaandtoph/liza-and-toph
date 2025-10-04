import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { Sparkles, Heart, TrendingUp, ShoppingBag } from 'lucide-react';

export default function Home() {
  const { isLoggedIn, child } = useStore();

  if (isLoggedIn && child.name) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back, {child.name}'s family!
          </h1>
          <p className="text-lg opacity-80 mb-8">
            Continue exploring personalized play guidance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/playboard"
              className="px-8 py-4 bg-olive text-ivory rounded-lg hover:bg-ochre transition text-lg font-medium"
              data-testid="button-view-playboard"
            >
              View Play Board
            </Link>
            <Link
              to="/shop"
              className="px-8 py-4 border-2 border-olive text-olive rounded-lg hover:bg-olive hover:text-ivory transition text-lg font-medium"
              data-testid="button-browse-shop"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-olive/10 via-ivory to-blush/10 py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight font-heading">
              The new way to design your child's play
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-80">
              Personalized play boards, curated products, and developmental insights tailored to your child's unique journey
            </p>
            <Link
              to="/onboarding"
              className="inline-block px-10 py-5 bg-olive text-ivory rounded-lg hover:bg-ochre transition text-xl font-semibold shadow-lg hover:shadow-xl"
              data-testid="button-try-free-hero"
            >
              Try for $0
            </Link>
            <p className="text-sm mt-4 opacity-70">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Everything your child needs to thrive
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#EDE9DC] p-8 rounded-lg">
              <div className="w-12 h-12 bg-olive/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-olive" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personalized Play Boards</h3>
              <p className="opacity-80">
                Get customized play recommendations based on your child's age, interests, and developmental stage
              </p>
            </div>
            <div className="bg-[#EDE9DC] p-8 rounded-lg">
              <div className="w-12 h-12 bg-ochre/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-ochre" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Milestone Tracking</h3>
              <p className="opacity-80">
                Understand your child's developmental journey across cognitive, motor, language, and social-emotional domains
              </p>
            </div>
            <div className="bg-[#EDE9DC] p-8 rounded-lg">
              <div className="w-12 h-12 bg-burnt/10 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-burnt" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Curated Products</h3>
              <p className="opacity-80">
                Discover toys, books, and materials perfectly matched to your child's needs and development
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-sand/30 py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-olive text-ivory rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Tell us about your child</h3>
              <p className="text-sm opacity-80">Share their age, interests, and play patterns</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-olive text-ivory rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Get your Play Board</h3>
              <p className="text-sm opacity-80">Receive personalized developmental insights</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-olive text-ivory rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Explore recommendations</h3>
              <p className="text-sm opacity-80">Browse curated toys and activities</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-olive text-ivory rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Watch them grow</h3>
              <p className="text-sm opacity-80">Track progress and adapt as they develop</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Heart className="w-16 h-16 text-olive mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start your child's play journey today
          </h2>
          <p className="text-xl mb-8 opacity-80">
            Join thousands of parents creating meaningful play experiences
          </p>
          <Link
            to="/onboarding"
            className="inline-block px-10 py-5 bg-olive text-ivory rounded-lg hover:bg-ochre transition text-xl font-semibold shadow-lg hover:shadow-xl"
            data-testid="button-get-started"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
