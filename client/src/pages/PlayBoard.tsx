import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { logEvent } from '../analytics';
import milestonesData from '../data/milestones.json';
import rulesData from '../data/rules.json';
import { Sparkles, Lock, TrendingUp, ShoppingCart } from 'lucide-react';

export default function PlayBoard() {
  const { child, answers, subscribed, setSubscribed } = useStore();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    logEvent('playboard_viewed', { ageBand: child.ageBand });
    if (!subscribed) {
      logEvent('paywall_viewed');
      setShowPaywall(true);
    }
  }, [child.ageBand, subscribed]);

  if (!child.ageBand) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">No Play Board Yet</h2>
        <p className="mb-4">Complete the onboarding first.</p>
        <Link 
          to="/onboarding" 
          className="text-olive underline hover:text-ochre transition"
          data-testid="link-start-onboarding"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  const milestones = milestonesData[child.ageBand as keyof typeof milestonesData];
  const domains = ['socialEmotional', 'cognitive', 'languageCommunication', 'motor'];
  const domainLabels: Record<string, string> = {
    socialEmotional: 'Social-Emotional',
    cognitive: 'Cognitive',
    languageCommunication: 'Language & Communication',
    motor: 'Motor Skills',
  };

  const domainIcons: Record<string, any> = {
    socialEmotional: '❤️',
    cognitive: '🧠',
    languageCommunication: '💬',
    motor: '🤸',
  };

  const computeInsights = () => {
    const insights: string[] = [];
    const allConditions = [...answers.schemas, ...answers.barriers];
    
    rulesData.forEach((rule) => {
      if (allConditions.includes(rule.condition)) {
        const needLabels: Record<string, string> = {
          'accessible-storage': 'Consider accessible storage solutions',
          'fine-motor-mark-making': 'Support fine motor development with mark-making tools',
          'gross-motor-climb': 'Provide climbing and gross motor opportunities',
          'nurturing-dolls': 'Introduce nurturing play with dolls',
          'building-foundations': 'Offer building and construction toys',
        };
        const insight = needLabels[rule.need];
        if (insight && !insights.includes(insight)) {
          insights.push(insight);
        }
      }
    });

    return insights.slice(0, 3);
  };

  const insights = computeInsights();

  const handleSubscribe = () => {
    logEvent('subscribe_clicked');
    setSubscribed(true);
    setShowPaywall(false);
  };

  return (
    <div className="relative">
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-br from-olive/20 via-ivory to-blush/20 py-12 -mt-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3" data-testid="text-playboard-title">
              {child.name}'s Play Board
            </h1>
            <p className="text-lg opacity-80" data-testid="text-age-range">
              Age: {child.ageBand.replace('-', ' - ')} years
            </p>
          </div>

          {subscribed && insights.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm border-2 border-olive/20 rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-ochre" />
                <h3 className="text-2xl font-semibold">Personalized Insights</h3>
              </div>
              <ul className="space-y-3">
                {insights.map((insight, i) => (
                  <li 
                    key={i} 
                    className="flex items-start gap-3 text-lg"
                    data-testid={`insight-${i}`}
                  >
                    <span className="text-olive text-2xl">✓</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Paywall Overlay Modal */}
        {!subscribed && showPaywall && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
              <button
                onClick={() => setShowPaywall(false)}
                className="absolute top-4 right-4 text-espresso/50 hover:text-espresso text-2xl"
                data-testid="button-close-paywall"
              >
                ×
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-olive to-ochre rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-ivory" />
                </div>
                <h2 className="text-3xl font-bold mb-3">Unlock Full Insights</h2>
                <p className="text-lg mb-6 opacity-80">
                  Subscribe to see the complete developmental journey, personalized recommendations, and expert guidance for {child.name}
                </p>
                <div className="bg-sand/30 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold mb-3">What you'll get:</h3>
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-olive" />
                      <span>Complete developmental milestones</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-ochre" />
                      <span>Personalized play insights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-burnt" />
                      <span>Curated product recommendations</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={handleSubscribe}
                  className="w-full bg-olive text-ivory px-8 py-4 rounded-xl hover:bg-ochre transition text-lg font-semibold shadow-lg hover:shadow-xl"
                  data-testid="button-subscribe"
                >
                  Subscribe Now
                </button>
                <p className="text-sm mt-4 opacity-60">Cancel anytime</p>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Banner for Non-subscribers */}
        {!subscribed && !showPaywall && (
          <div className="sticky top-20 z-40 bg-gradient-to-r from-blush to-ochre/30 border-2 border-burnt/30 rounded-xl p-4 mb-6 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-espresso" />
                <p className="font-medium">Unlock full insights and personalized recommendations</p>
              </div>
              <button
                onClick={() => setShowPaywall(true)}
                className="px-6 py-2 bg-olive text-ivory rounded-lg hover:bg-espresso transition font-medium whitespace-nowrap"
                data-testid="button-open-paywall"
              >
                Subscribe
              </button>
            </div>
          </div>
        )}

        {/* Milestone Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {domains.map((domain) => {
            const data = milestones[domain as keyof typeof milestones];
            return (
              <div 
                key={domain} 
                className="bg-white border-2 border-sand rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
                data-testid={`card-milestone-${domain}`}
              >
                <div className="bg-gradient-to-br from-olive/10 to-blush/10 p-6 border-b-2 border-sand">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{domainIcons[domain]}</span>
                    <h3 className="text-2xl font-bold">{domainLabels[domain]}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-olive uppercase tracking-wide mb-1">Current Stage</p>
                    <p className="text-lg">{data.currentMilestone}</p>
                  </div>
                  {subscribed ? (
                    <>
                      <div>
                        <p className="text-sm font-semibold text-ochre uppercase tracking-wide mb-1">Developmental Journey</p>
                        <p>{data.shiftSummary}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-burnt uppercase tracking-wide mb-1">Looking Ahead</p>
                        <p>{data.endMilestone}</p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gradient-to-r from-blush/10 to-ochre/10 border-2 border-burnt/20 rounded-xl p-4 text-center">
                      <Lock className="w-8 h-8 text-espresso/40 mx-auto mb-2" />
                      <p className="text-sm font-medium text-espresso/70">
                        Subscribe to unlock developmental insights
                      </p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-sand">
                    <p className="text-sm font-semibold text-espresso/70 mb-1">💡 Play Support</p>
                    <p className="text-sm">{data.playSupport}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-espresso/70 mb-1">👨‍👩‍👧 Parent Support</p>
                    <p className="text-sm">{data.parentSupport}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-br from-olive/10 to-blush/10 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to bring these ideas to life?</h2>
          <p className="mb-6 text-lg opacity-80">
            Explore curated toys and products perfectly matched to {child.name}'s development
          </p>
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-2 px-8 py-4 bg-olive text-ivory rounded-xl hover:bg-ochre transition text-lg font-semibold shadow-lg hover:shadow-xl"
            data-testid="button-view-recommendations"
          >
            <ShoppingCart className="w-5 h-5" />
            See Tailored Picks
          </Link>
        </div>
      </div>
    </div>
  );
}
