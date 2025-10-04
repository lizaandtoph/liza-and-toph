import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { logEvent } from '../analytics';
import PaywallNotice from '../components/PaywallNotice';
import milestonesData from '../data/milestones.json';
import rulesData from '../data/rules.json';

export default function PlayBoard() {
  const { child, answers, subscribed } = useStore();

  useEffect(() => {
    logEvent('playboard_viewed', { ageBand: child.ageBand });
    if (!subscribed) {
      logEvent('paywall_viewed');
    }
  }, [child.ageBand, subscribed]);

  if (!child.ageBand) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">No Play Board Yet</h2>
        <p className="mb-4">Complete the onboarding first.</p>
        <Link to="/onboarding" className="text-olive underline">
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{child.name}'s Play Board</h1>
      <p className="text-lg mb-6">Age: {child.ageBand}</p>

      {!subscribed && <PaywallNotice />}

      {subscribed && insights.length > 0 && (
        <div className="bg-blush/20 border-2 border-blush rounded p-6 mb-6">
          <h3 className="text-xl font-semibold mb-3">Personalized Insights</h3>
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start">
                <span className="text-burnt mr-2">→</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {domains.map((domain) => {
          const data = milestones[domain as keyof typeof milestones];
          return (
            <div key={domain} className="bg-[#EDE9DC] p-6 rounded shadow-md">
              <h3 className="text-xl font-semibold mb-4">{domainLabels[domain]}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-espresso/70">Current</p>
                  <p>{data.currentMilestone}</p>
                </div>
                <div className={!subscribed ? 'blur-sm' : ''}>
                  <p className="text-sm font-medium text-espresso/70">Developmental Journey</p>
                  <p>{data.shiftSummary}</p>
                </div>
                <div className={!subscribed ? 'blur-sm' : ''}>
                  <p className="text-sm font-medium text-espresso/70">Looking Ahead</p>
                  <p>{data.endMilestone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-espresso/70">Play Support</p>
                  <p className="text-sm">{data.playSupport}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-espresso/70">Parent Support</p>
                  <p className="text-sm">{data.parentSupport}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/recommendations"
          className="inline-block px-8 py-3 bg-olive text-ivory rounded hover:bg-ochre transition text-lg font-medium"
        >
          See Tailored Picks
        </Link>
      </div>
    </div>
  );
}
