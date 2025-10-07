import { useState, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { useStore } from "../store";
import { Sparkles, Heart, TrendingUp, ShoppingBag } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

function PlatformCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    skipSnaps: false,
  });

  const carouselSlides = [
    {
      id: "shop",
      tabLabel: "Curated for Development",
      buttonText: "Shop Now",
      heading: "Taking the Guesswork Out of the Toy Aisle",
      description:
        "Our expert-curated online shop, featuring developmentally-rich toys and activities personalized for your child's unique journey.",
      link: "/shop",
      testId: "tab-online-shop",
    },
    {
      id: "ai",
      tabLabel: "Personalized for Your Child",
      buttonText: "Create Your Free Profile",
      heading: "Discover Your Child's Personal Play Board",
      description:
        "Our AI analyzes 93 data points across 5 developmental domains to generate a curated list of toys and activities perfectly matched to your child's current needs and emerging skills.",
      link: "/onboarding",
      testId: "tab-ai-guidance",
    },
    {
      id: "resources",
      tabLabel: "More Than Just Toys",
      buttonText: "Empower Your Parenting",
      heading: "Track Milestones, Get Insights",
      description:
        "Our platform helps you track your child’s progress over time. We celebrate their victories and provide gentle alerts if we notice an area where extra professional support might be beneficial, helping you support them when it matters most.",
      link: "/playboard",
      testId: "tab-play-resources",
    },
    {
      id: "expert",
      tabLabel: "Expert-led Guidance",
      buttonText: "Work With Professionals",
      heading: "Guidance You Can Trust",
      description:
        "Our platform is built by a developmental psychologist using validated assessment frameworks, not marketing trends. Every recommendation is grounded in the science of how children learn and grow.",
      link: "/find-pros",
      testId: "tab-expert-guidance",
    },
  ];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  return (
    <section className="bg-sand/30 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Not Another Toy Store. A Tool for Growth.
        </h2>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {carouselSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => scrollTo(index)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedIndex === index
                  ? "bg-olive text-ivory"
                  : "bg-white text-espresso hover:bg-olive/10"
              }`}
              data-testid={slide.testId}
            >
              {slide.tabLabel}
            </button>
          ))}
        </div>

        {/* Embla Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {carouselSlides.map((slide) => (
              <div key={slide.id} className="flex-[0_0_100%] min-w-0">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto text-center">
                  <h3 className="text-2xl md:text-3xl font-bold mb-6">
                    {slide.heading}
                  </h3>
                  <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                  <Link
                    to={slide.link}
                    className="inline-block px-8 py-4 bg-olive text-ivory rounded-lg hover:bg-ochre transition text-lg font-semibold shadow-md hover:shadow-lg"
                    data-testid={`button-carousel-cta-${slide.id}`}
                  >
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                selectedIndex === index
                  ? "bg-olive w-8"
                  : "bg-olive/30 hover:bg-olive/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              data-testid={`dot-indicator-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { isLoggedIn, getActiveChild } = useStore();
  const child = getActiveChild();

  if (isLoggedIn && child?.name) {
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
              Not Another Toy Store. A Tool for Growth.
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-80">
              The first evidence-based platform that matches the perfect toys to
              your child's unique stage of development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/onboarding"
                className="inline-block px-10 py-5 bg-olive text-ivory rounded-lg hover:bg-ochre transition text-xl font-semibold shadow-lg hover:shadow-xl"
                data-testid="button-try-free-hero"
              >
                Discover Your Child's Play Board
              </Link>
              <Link
                to="/login"
                className="inline-block px-10 py-5 border-2 border-olive text-olive rounded-lg hover:bg-olive hover:text-ivory transition text-xl font-semibold"
                data-testid="button-sign-in"
              >
                Sign In
              </Link>
            </div>
            <p className="text-sm mt-4 opacity-70">
              Start for free. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Category Selection Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              Your Playroom is Full of Toys. So Why Are They Bored?
            </h1>
            <div className="max-w-3xl mx-auto mb-12">
              <p className="text-lg opacity-90 mb-8">
                Parents spend billions on toys each year, yet most of them end
                up in the bottom of a bin, untouched. The problem isn't the
                toys—it's the mismatch. A toy that doesn't align with a child's
                specific developmental needs, interests, or temperament is just
                beautiful clutter. Even more importantly, 1 in 6 children has a
                developmental delay that often goes unnoticed until school.
                These are critical years where the right support could make all
                the difference.
              </p>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-olive mb-8">
              Discover Toys by Category.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <Link
              to="/shop?category=sensory"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-sensory"
            >
              Sensory & Exploratory
            </Link>
            <Link
              to="/shop?category=fine motor"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-fine-motor"
            >
              Fine Motor Development
            </Link>
            <Link
              to="/shop?category=gross motor"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-gross-motor"
            >
              Gross Motor Development
            </Link>
            <Link
              to="/shop?category=cognitive"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-cognitive"
            >
              Cognitive & Problem-Solving
            </Link>
            <Link
              to="/shop?category=language"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-language"
            >
              Language & Communication
            </Link>
            <Link
              to="/shop?category=social"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-social-emotional"
            >
              Social-Emotional Development
            </Link>
            <Link
              to="/shop?category=pretend"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-imaginative"
            >
              Imaginative & Pretend Play
            </Link>
            <Link
              to="/shop?category=building"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-construction"
            >
              Construction & Building
            </Link>
            <Link
              to="/shop?category=stem"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-stem"
            >
              Science & Discovery (STEM)
            </Link>
            <Link
              to="/shop?category=art"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-creative-arts"
            >
              Creative Arts & Expression
            </Link>
            <Link
              to="/shop?category=music"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-music"
            >
              Music & Movement
            </Link>
            <Link
              to="/shop?category=games"
              className="px-6 py-4 bg-white border-2 border-sand rounded-xl hover:bg-olive hover:text-ivory hover:border-olive transition text-center font-medium"
              data-testid="button-category-games"
            >
              Games & Structured Play
            </Link>
          </div>
        </div>
      </section>

      {/* Science Behind Your Recommendations Section */}
      <section className="py-20 bg-gradient-to-br from-blush/10 via-ivory to-olive/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-olive uppercase tracking-wider mb-4">
              Intelligent by Design
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              The Science Behind Your Recommendations
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-olive mb-8">
              The Smart Engine Behind Every Recommendation
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6 text-lg opacity-90">
            <p>
              At the heart of Liza & Toph is a powerful, proprietary engine
              designed to think like a developmental psychologist. We use a
              sophisticated, data-driven approach to translate your unique
              observations into a clear and actionable play plan.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">
              It's More Than an Algorithm—It's a Methodology
            </h3>

            <p>
              When you complete your child's profile, our system doesn't just
              look for keywords. It analyzes 93 distinct data points across five
              critical developmental domains, from fine motor skills to
              social-emotional growth.
            </p>

            <p>
              Our AI then cross-references this unique developmental snapshot
              against our extensive product database, which is cataloged with
              over 105 developmental filters and 210 product attributes. This
              allows us to go beyond simple age recommendations to find the toy
              that matches your child's specific needs and passions.
            </p>

            <p className="font-semibold">
              The result is a level of personalization that is simply
              unmatched—a set of recommendations as unique as your child.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Carousel */}
      <PlatformCarousel />

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-olive/10 via-ivory to-blush/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay in the loop
          </h2>
          <p className="text-lg mb-8 opacity-80 max-w-2xl mx-auto">
            Neque porro quisquam est qui dolorem ipsum quia dolor sit amet,
            consectetur, adipisci.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 px-6 py-4 bg-white border-2 border-sand rounded-xl focus:border-olive focus:outline-none text-lg transition"
              data-testid="input-newsletter-email"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-olive text-ivory rounded-xl hover:bg-ochre transition text-lg font-semibold shadow-md hover:shadow-lg whitespace-nowrap"
              data-testid="button-subscribe"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
