import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { Sparkles, Heart, TrendingUp, ShoppingBag } from 'lucide-react';

function PlatformCarousel() {
  const [activeTab, setActiveTab] = useState<'shop' | 'ai' | 'resources' | 'expert'>('shop');

  const carouselContent = {
    shop: {
      buttonText: 'Shop Now',
      heading: 'Taking the guess work out of the toy aisle',
      description: 'In pellentesque leo at nulla laoreet, vel auctor augue porttitor. Nulla ac massa nunc. Nulla scelerisque mattis lorem, sit amet tempus tellus euismod nec. Vivamus.',
      link: '/shop'
    },
    ai: {
      buttonText: 'Get Started',
      heading: "Explore your child's Playboard",
      description: 'Integer vulputate sem nisl, at efficitur mi vehicula eget. Fusce porttitor mauris vitae libero feugiat, ac blandit turpis suscipit. Suspendisse vitae auctor ipsum, at volutpat.',
      link: '/onboarding'
    },
    resources: {
      buttonText: 'Get Started',
      heading: 'Playtime essentials',
      description: 'Integer vulputate sem nisl, at efficitur mi vehicula eget. Fusce porttitor mauris vitae libero feugiat, ac blandit turpis suscipit. Suspendisse vitae auctor ipsum, at volutpat.',
      link: '/playboard'
    },
    expert: {
      buttonText: 'Get Started',
      heading: "Support your child's development anywhere",
      description: 'Integer vulputate sem nisl, at efficitur mi vehicula eget. Fusce porttitor mauris vitae libero feugiat, ac blandit turpis suscipit. Suspendisse vitae auctor ipsum, at volutpat.',
      link: '/find-pros'
    }
  };

  const currentContent = carouselContent[activeTab];

  return (
    <section className="bg-sand/30 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          The ultimate play platform for every stage
        </h2>
        
        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'shop'
                ? 'bg-olive text-ivory'
                : 'bg-white text-espresso hover:bg-olive/10'
            }`}
            data-testid="tab-online-shop"
          >
            Online shop
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'ai'
                ? 'bg-olive text-ivory'
                : 'bg-white text-espresso hover:bg-olive/10'
            }`}
            data-testid="tab-ai-guidance"
          >
            AI guidance
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'resources'
                ? 'bg-olive text-ivory'
                : 'bg-white text-espresso hover:bg-olive/10'
            }`}
            data-testid="tab-play-resources"
          >
            Play resources
          </button>
          <button
            onClick={() => setActiveTab('expert')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'expert'
                ? 'bg-olive text-ivory'
                : 'bg-white text-espresso hover:bg-olive/10'
            }`}
            data-testid="tab-expert-guidance"
          >
            Expert-led guidance
          </button>
        </div>

        {/* Carousel Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            {currentContent.heading}
          </h3>
          <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
            {currentContent.description}
          </p>
          <Link
            to={currentContent.link}
            className="inline-block px-8 py-4 bg-olive text-ivory rounded-lg hover:bg-ochre transition text-lg font-semibold shadow-md hover:shadow-lg"
            data-testid={`button-carousel-cta-${activeTab}`}
          >
            {currentContent.buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}

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

      {/* Category Selection Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            What kind of play are you looking for?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-sensory"
            >
              Sensory & Exploratory
            </Link>
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-fine-motor"
            >
              Fine Motor Development
            </Link>
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-gross-motor"
            >
              Gross Motor Development
            </Link>
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-cognitive"
            >
              Cognitive & Problem-Solving
            </Link>
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-language"
            >
              Language & Communication
            </Link>
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-social-emotional"
            >
              Social-Emotional Development
            </Link>
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-imaginative"
            >
              Imaginative & Pretend Play
            </Link>
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-construction"
            >
              Construction & Building
            </Link>
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-stem"
            >
              Science & Discovery (STEM)
            </Link>
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-creative-arts"
            >
              Creative Arts & Expression
            </Link>
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-music"
            >
              Music & Movement
            </Link>
            <Link
              to="/shop"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-games"
            >
              Games & Structured Play
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Carousel */}
      <PlatformCarousel />

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
