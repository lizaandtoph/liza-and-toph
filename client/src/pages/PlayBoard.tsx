import { useEffect, useState, useMemo } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { useStore } from '../store';
import { logEvent } from '../analytics';
import milestonesData from '../data/milestones.json';
import rulesData from '../data/rules.json';
import { Sparkles, TrendingUp, ShoppingCart, FileText, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type Product } from '@shared/schema';
import { calculateAgeFromBirthday, categorizeAgeBand } from '@shared/ageUtils';
import { useAuth } from '../hooks/useAuth';

export default function PlayBoard() {
  const [, params] = useRoute('/playboard/:childId');
  const [, setLocation] = useLocation();
  const { getActiveChild, getAnswers, activeChildId, children, setActiveChild } = useStore();
  const { user } = useAuth();
  
  useEffect(() => {
    if (params?.childId && params.childId !== activeChildId) {
      const childExists = children.find(c => c.id === params.childId);
      if (childExists) {
        setActiveChild(params.childId);
      }
    }
  }, [params?.childId, activeChildId, children, setActiveChild]);

  
  const child = getActiveChild();
  const answers = child ? getAnswers(child.id) : { schemas: [], barriers: [], interests: [] };
  
  // Calculate ageBand from birthday if missing (for backwards compatibility)
  const effectiveAgeBand = useMemo(() => {
    if (!child) return '';
    if (child.ageBand) return child.ageBand;
    if (child.birthday) {
      const { totalMonths } = calculateAgeFromBirthday(child.birthday);
      return categorizeAgeBand(totalMonths);
    }
    return '';
  }, [child]);
  
  // Early access period: all authenticated users have full access through January 2026

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  useEffect(() => {
    if (child) {
      logEvent('playboard_viewed', { ageBand: effectiveAgeBand });
    }
  }, [child, effectiveAgeBand]);

  if (!child) {
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

  const milestones = milestonesData[effectiveAgeBand as keyof typeof milestonesData];
  
  if (!milestones) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Milestone Data Not Available</h2>
        <p className="mb-4">We couldn't find milestone data for age band: {effectiveAgeBand}</p>
        <p className="mb-4 text-sm text-espresso/60">This may happen if you completed the questionnaire before the latest update.</p>
        <button
          onClick={() => {
            useStore.getState().reset();
            window.location.href = '/onboarding';
          }}
          className="px-6 py-3 bg-olive text-ivory rounded-xl hover:bg-ochre transition font-medium"
          data-testid="button-restart-onboarding"
        >
          Restart Onboarding
        </button>
      </div>
    );
  }
  
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

  const parseAgeRange = (ageRange: string | null | undefined) => {
    if (!ageRange) {
      return { ageMin: 0, ageMax: 99 };
    }
    
    const parts = ageRange.toLowerCase().split(/[-–—]/);
    
    const parseAgeValue = (str: string): number => {
      const match = str.match(/(\d+\.?\d*)\s*(months?|years?|m|y)?/i);
      if (!match) return 0;
      
      const value = parseFloat(match[1]);
      const unit = match[2];
      
      if (unit && (unit.startsWith('m') || unit === 'months' || unit === 'month')) {
        return value / 12;
      }
      return value;
    };
    
    if (parts.length === 2) {
      return {
        ageMin: parseAgeValue(parts[0].trim()),
        ageMax: parseAgeValue(parts[1].trim())
      };
    }
    
    const singleAge = parseAgeValue(ageRange);
    return { ageMin: singleAge, ageMax: singleAge };
  };

  const getRecommendedProducts = () => {
    if (!child) return [];
    
    const allConditions = [...answers.schemas, ...answers.barriers];
    const childNeeds = new Set<string>();
    
    rulesData.forEach((rule) => {
      if (allConditions.includes(rule.condition)) {
        childNeeds.add(rule.need);
      }
    });

    const childAge = child.ageYears || 0;
    
    const productsWithScores = products
      .map((p) => {
        const { ageMin, ageMax } = parseAgeRange(p.ageRange);
        
        let relevanceScore = 0;
        if (p.categories && Array.isArray(p.categories)) {
          p.categories.forEach(category => {
            const categoryLower = category.toLowerCase();
            if (childNeeds.has('accessible-storage') && categoryLower.includes('storage')) relevanceScore += 2;
            if (childNeeds.has('fine-motor-mark-making') && (categoryLower.includes('art') || categoryLower.includes('motor'))) relevanceScore += 2;
            if (childNeeds.has('gross-motor-climb') && (categoryLower.includes('climb') || categoryLower.includes('motor'))) relevanceScore += 2;
            if (childNeeds.has('nurturing-dolls') && (categoryLower.includes('doll') || categoryLower.includes('pretend'))) relevanceScore += 2;
            if (childNeeds.has('building-foundations') && categoryLower.includes('building')) relevanceScore += 2;
          });
        }
        
        return {
          ...p,
          ageMin,
          ageMax,
          relevanceScore,
        };
      })
      .filter((p) => {
        const ageMatch = childAge >= p.ageMin && childAge <= p.ageMax;
        return ageMatch;
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6);
    
    return productsWithScores;
  };

  const recommendedProducts = getRecommendedProducts();

  const handleProductClick = (skuId: string, url: string) => {
    logEvent('playboard_product_clicked', { sku: skuId });
    const encodedUrl = encodeURIComponent(url || '#');
    window.open(`/api/links?sku=${skuId}&to=${encodedUrl}`, '_blank');
  };

  const journeyDescriptions: Record<string, { title: string; description: string }> = {
    'newborn-18m': {
      title: 'The Journey from Newborn to 2 Years',
      description: "This period is a breathtaking journey from a purely sensory being, completely dependent on caregivers, to a mobile, vocal, and independent little person. A newborn is a Sensory Being, learning about the world through touch, sight, and sound. As they master their body and find their voice, they transform into an Independent Explorer, eager to move, interact, and assert their will on the world around them. Our goal is to design a safe and stimulating environment that supports this journey."
    },
    '18m-3y': {
      title: 'The Journey from 18 Months to 3 Years',
      description: "The journey from 18 months to age three is a magical transition. A young toddler is a physical Explorer, driven by a powerful need to test their limits, master their movements, and declare their independence with a joyful 'me do it!' As they grow, their focus turns from the purely physical to the social and imaginative. A new, creative world blossoms, and they become a Budding Storyteller, using language and pretend play to make sense of their experiences."
    },
    '2-5y': {
      title: 'The Journey from 2 to 5 Years',
      description: "This three-year span is a period of pure magic, where the world of imagination reigns supreme. A two-year-old is an Eager Imitator, watching the world around them and practicing what they see through simple, parallel play. As their social and cognitive worlds explode, they transform into an Imaginative Creator, capable of inventing elaborate worlds, negotiating roles with friends, and using play to make sense of everything. Our goal is to provide the tools and space for this imaginative flowering."
    },
    '3-6y': {
      title: 'The Journey from 3 to 6 Years',
      description: "This stage is defined by the blossoming of a child's inner world. A three-year-old is a Magical Thinker, whose play is a wonderful, free-flowing exploration of their imagination without regard for the rules of reality. As they approach age six, their cognitive and social skills allow them to become an Early Planner, a child who can not only imagine a scenario but can also organize it, assign roles, and follow simple rules to bring it to life. Our goal is to nurture this transition from pure imagination to purposeful creation."
    },
    '4-7y': {
      title: 'The Journey from 4 to 7 Years',
      description: "This period marks the critical transition from the free-form world of preschool to the more structured world of early elementary school. A four-year-old is an Enthusiastic Friend, whose social world is blossoming and whose play is imaginative and boisterous. As they approach age seven, they become a Rule-Follower, a child who finds deep satisfaction in understanding how things work, following established rules, and using logic to solve problems. Our goal is to support this shift from imaginative exploration to structured learning."
    },
    '5-8y': {
      title: 'The Journey from 5 to 8 Years',
      description: "The journey from age five to eight is one of the most remarkable transformations in childhood. A five-year-old lives in a world of pure imagination, where play is about inventing stories and asking 'What if...?' As they grow, a powerful new drive emerges: the desire to become a master of new skills. Play shifts towards figuring out 'How to...', whether it's building a complex LEGO set or winning a board game. Their thinking follows the same path, moving from fantasy to a need to understand how the real world works."
    },
    '6-9y': {
      title: 'The Journey from 6 to 9 Years',
      description: "This period is about building and problem-solving, both with things and with friends. A six-year-old is a Concrete Thinker, just beginning to understand the world through a more logical, rule-based lens. As they grow, their ability to plan, strategize, and see things from another's perspective deepens, and they emerge as a Strategic Problem-Solver. Play becomes less about simple creation and more about building complex systems, whether it's a LEGO creation or a friendship group."
    },
    '7-10y': {
      title: 'The Journey from 7 to 10 Years',
      description: "During these years, children solidify their place in the world outside the family. A seven-year-old is a Competent Peer, focused on mastering the academic and social rules of school and friendship. They are driven by a desire to 'do it right.' As they mature, they become an Independent Expert, a child who has developed deep knowledge and passion for their own unique interests. They are not just a member of the group; they are an individual with their own expertise and ideas."
    },
    '8-11y': {
      title: 'The Journey from 8 to 11 Years',
      description: "This stage is the bridge to adolescence, a time when social structures become paramount and a child's inner world grows more complex. An eight-year-old is a Team Player, thriving on collaboration, fairness, and mastering the rules of their social and academic worlds. As they approach the pre-teen years, they become a Budding Individual, using their skills not just to fit in, but to begin defining who they are. Their focus shifts from group success to personal achievement and self-discovery."
    },
    '9-12y': {
      title: 'The Journey from 9 to 12 Years',
      description: "This is the heart of the 'tween' years, a dynamic period of transition from childhood toward adolescence. A nine-year-old is a Rule Master, who has become adept at understanding and even using the rules of games, friendships, and school to their advantage. As they move toward twelve, they become an Abstract Thinker, capable of looking beyond the literal rules to question, hypothesize, and form their own complex opinions about the world. Play evolves from structured games to more abstract social interactions and personal projects."
    },
    '10-early-teens': {
      title: 'The Journey from 10 to Early Teens (13-15 Years)',
      description: "This stage marks the official entry into adolescence, a period of profound self-discovery. A ten-year-old is a Confident Peer, comfortable in their social groups and competent in their skills. As they enter their teens, the central task becomes figuring out who they are, and they transform into an Identity Seeker. Their world expands beyond the here-and-now to include complex questions about their future, their beliefs, and their place in the world."
    },
    'preteens-older-teens': {
      title: 'The Journey from Preteen to Older Teen (11-13 to 15-18 Years)',
      description: "This final stage of childhood is a powerful journey of consolidation and launch. The preteen (11-13) is an Emerging Individual, actively trying on different identities and figuring out where they fit in. As they move through their high school years, they become a Young Adult, a person who has begun to consolidate their identity, values, and goals, and is looking toward their future beyond the family home. Play transforms into the serious work of preparing for adulthood."
    }
  };

  const currentJourney = journeyDescriptions[effectiveAgeBand as keyof typeof journeyDescriptions];


  // Map age band to shop age bracket
  const getShopAgeBracket = (ageBand: string): string => {
    const mapping: Record<string, string> = {
      'newborn-18m': '6-12m',
      '18m-3y': '2-3y',
      '2-5y': '3-4y',
      '3-6y': '4-5y',
      '4-7y': '5-6y',
      '5-8y': '5-6y',
      '6-9y': '5-6y',
      '7-10y': '5-6y',
      '8-11y': '5-6y',
      '9-12y': '5-6y',
      '10-early-teens': '5-6y',
      'preteens-older-teens': '5-6y',
    };
    return mapping[ageBand] || '2-3y';
  };

  const childAgeBracket = getShopAgeBracket(effectiveAgeBand);

  return (
    <div className="relative">
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-br from-olive/20 via-ivory to-blush/20 py-12 -mt-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3" data-testid="text-playboard-title">
              {child.name}'s Play Board
            </h1>
            <p className="text-lg opacity-80 mb-4" data-testid="text-age-range">
              Age: {effectiveAgeBand.replace('-', ' - ')} years
            </p>
            {!answers.fullQuestionnaire && (
              <Link to={`/full-questionnaire/${child.id}`}>
                <button 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 hover:bg-white text-olive border-2 border-olive/30 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
                  data-testid="button-complete-assessment"
                >
                  <FileText className="w-5 h-5" />
                  Complete Full Development Assessment
                </button>
              </Link>
            )}
          </div>

          {(answers.milestones?.social_emotional?.answer || 
            answers.milestones?.cognitive?.answer || 
            answers.milestones?.language?.answer || 
            answers.milestones?.motor?.answer) && (
            <div className="bg-white/80 backdrop-blur-sm border-2 border-olive/20 rounded-2xl p-8 shadow-lg max-w-3xl mx-auto mb-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-ochre" />
                <h3 className="text-2xl font-semibold">Milestone Tracker</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {answers.milestones?.social_emotional?.answer && (
                  <div className="p-4 bg-gradient-to-br from-blush/20 to-ivory border-2 border-sand rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">😊</span>
                      <h4 className="font-semibold">Social-Emotional</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{answers.milestones.social_emotional.question}</p>
                    <p className="font-medium capitalize">{answers.milestones.social_emotional.answer.replace('_', ' ')}</p>
                  </div>
                )}
                {answers.milestones?.cognitive?.answer && (
                  <div className="p-4 bg-gradient-to-br from-blush/20 to-ivory border-2 border-sand rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🧠</span>
                      <h4 className="font-semibold">Cognitive</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{answers.milestones.cognitive.question}</p>
                    <p className="font-medium capitalize">{answers.milestones.cognitive.answer.replace('_', ' ')}</p>
                  </div>
                )}
                {answers.milestones?.language?.answer && (
                  <div className="p-4 bg-gradient-to-br from-blush/20 to-ivory border-2 border-sand rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">💬</span>
                      <h4 className="font-semibold">Language & Communication</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{answers.milestones.language.question}</p>
                    <p className="font-medium capitalize">{answers.milestones.language.answer.replace('_', ' ').replace('+', '+')}</p>
                  </div>
                )}
                {answers.milestones?.motor?.answer && (
                  <div className="p-4 bg-gradient-to-br from-blush/20 to-ivory border-2 border-sand rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🤸</span>
                      <h4 className="font-semibold">Motor Development</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{answers.milestones.motor.question}</p>
                    <p className="font-medium capitalize">{answers.milestones.motor.answer.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {insights.length > 0 && (
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
        {/* Developmental Journey Table */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Developmental Journey</h2>
            <p className="text-lg opacity-80">
              See how {child.name} is growing across all developmental domains
            </p>
          </div>

          {/* Journey Overview */}
          {currentJourney && (
            <div className="mb-8 bg-gradient-to-br from-olive/5 via-blush/5 to-ochre/5 border-2 border-olive/20 rounded-2xl p-8" data-testid="section-journey-overview">
              <h3 className="text-2xl font-bold mb-4 text-olive">{currentJourney.title}</h3>
              <p className="text-lg leading-relaxed text-espresso/90">
                {currentJourney.description}
              </p>
            </div>
          )}
          
          <div className="bg-white border-2 border-sand rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-developmental-journey">
                <thead>
                  <tr className="bg-gradient-to-r from-olive/10 to-blush/10">
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide border-b-2 border-sand">
                      Developmental Domain
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide border-b-2 border-sand text-olive">
                      Current Stage
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide border-b-2 border-sand text-ochre">
                      The Journey
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide border-b-2 border-sand text-burnt">
                      Looking Ahead
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map((domain, index) => {
                    const data = milestones[domain as keyof typeof milestones];
                    return (
                      <tr 
                        key={domain} 
                        className={index % 2 === 0 ? 'bg-white' : 'bg-sand/10'}
                        data-testid={`row-journey-${domain}`}
                      >
                        <td className="px-6 py-4 border-b border-sand/50">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{domainIcons[domain]}</span>
                            <span className="font-semibold">{domainLabels[domain]}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-sand/50">
                          <p className="text-sm leading-relaxed">{data.currentMilestone}</p>
                        </td>
                        <td className="px-6 py-4 border-b border-sand/50">
                          <p className="text-sm leading-relaxed">{data.shiftSummary}</p>
                        </td>
                        <td className="px-6 py-4 border-b border-sand/50">
                          <p className="text-sm leading-relaxed">{data.endMilestone}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
                  <div>
                    <p className="text-sm font-semibold text-ochre uppercase tracking-wide mb-1">Developmental Journey</p>
                    <p>{data.shiftSummary}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-burnt uppercase tracking-wide mb-1">Looking Ahead</p>
                    <p>{data.endMilestone}</p>
                  </div>
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

        {/* Shopping Section - Age-Filtered Products */}
        {recommendedProducts.length > 0 && (
          <div className="mt-12" data-testid="section-recommended-products">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-3">
                <ShoppingCart className="w-7 h-7 text-olive" />
                <h2 className="text-3xl font-bold">Shop for {child.name}</h2>
              </div>
              <p className="text-lg opacity-80 mb-2">
                Products curated for {effectiveAgeBand.replace('-', ' - ')} year olds, matched to {child.name}'s developmental needs
              </p>
              <p className="text-sm opacity-60">
                As we develop the market place, product links below may be affiliate links from platforms such as Amazon. As affiliates, we earn from qualifying purchases.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {recommendedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#EDE9DC] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
                  data-testid={`card-product-${product.id}`}
                >
                  <div className="aspect-square bg-ivory overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      data-testid={`img-product-${product.id}`}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-3 line-clamp-2 min-h-[3.5rem]" data-testid={`text-title-${product.id}`}>
                      {product.name}
                    </h3>

                    {product.categories && product.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {product.categories.slice(0, 2).map((category, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-sand text-espresso text-xs rounded"
                            data-testid={`tag-category-${idx}`}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mb-3">
                      Ages {product.ageMin}-{product.ageMax}
                    </p>

                    <button
                      onClick={() => handleProductClick(product.id, product.affiliateUrl || '#')}
                      className="w-full px-4 py-2 bg-olive text-ivory rounded-lg hover:bg-ochre transition font-medium text-sm"
                      data-testid={`button-view-${product.id}`}
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to={`/shop?age=${childAgeBracket}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-olive text-ivory rounded-xl hover:bg-ochre transition text-lg font-semibold shadow-lg hover:shadow-xl"
                data-testid="button-shop-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Shop for {child.name}
              </Link>
            </div>
          </div>
        )}

        {/* Personalized Recommendations CTA */}
        <div className="mt-12 bg-gradient-to-r from-olive/10 to-blush/10 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Looking for personalized recommendations?</h2>
          <p className="mb-6 opacity-80">
            View products specifically curated for {child.name}'s Play Board
          </p>
          <Link
            to="/recommendations"
            className="inline-block px-6 py-3 bg-olive text-ivory rounded-lg hover:bg-ochre transition font-medium"
            data-testid="button-view-recommendations"
          >
            View My Recommendations
          </Link>
        </div>
      </div>
    </div>
  );
}
