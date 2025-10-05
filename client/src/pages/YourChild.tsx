import { Link } from 'wouter';
import { useStore } from '../store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Plus, FileText } from 'lucide-react';
import { calculateAgeFromBirthday, getAgeBandLabel } from '@shared/ageUtils';

const getStageNicknames = (ageBand: string): { current: string; shift: string } => {
  const stages: Record<string, { current: string; shift: string }> = {
    'newborn-18m': { 
      current: 'Sensory Being', 
      shift: 'Independent Explorer' 
    },
    '18m-3y': { 
      current: 'Physical Explorer', 
      shift: 'Budding Storyteller' 
    },
    '2-5y': { 
      current: 'Eager Imitator', 
      shift: 'Imaginative Creator' 
    },
    '3-6y': { 
      current: 'Magical Thinker', 
      shift: 'Early Planner' 
    },
    '4-7y': { 
      current: 'Enthusiastic Friend', 
      shift: 'Rule-Follower' 
    },
    '5-8y': { 
      current: 'Imaginative Player', 
      shift: 'Skill Master' 
    },
    '6-9y': { 
      current: 'Concrete Thinker', 
      shift: 'Strategic Problem-Solver' 
    },
    '7-10y': { 
      current: 'Competent Peer', 
      shift: 'Independent Expert' 
    },
    '8-11y': { 
      current: 'Team Player', 
      shift: 'Budding Individual' 
    },
    '9-12y': { 
      current: 'Rule Master', 
      shift: 'Abstract Thinker' 
    },
    '10-early-teens': { 
      current: 'Confident Peer', 
      shift: 'Identity Seeker' 
    },
    'preteens-older-teens': { 
      current: 'Emerging Individual', 
      shift: 'Young Adult' 
    },
  };
  return stages[ageBand] || { current: 'Explorer', shift: 'Learner' };
};

const getMilestoneTeaser = (ageBand: string): string => {
  const teasers: Record<string, string> = {
    'newborn-18m': 'Learning about the world through touch, sight, and sound.',
    '18m-3y': 'Testing limits, mastering movements, and declaring independence.',
    '2-5y': 'Watching and practicing through simple, parallel play.',
    '3-6y': 'Free-flowing exploration of imagination without rules of reality.',
    '4-7y': 'Social world blossoming with imaginative and boisterous play.',
    '5-8y': 'Living in a world of pure imagination, inventing stories.',
    '6-9y': 'Understanding the world through a logical, rule-based lens.',
    '7-10y': 'Mastering academic and social rules of school and friendship.',
    '8-11y': 'Thriving on collaboration, fairness, and mastering social rules.',
    '9-12y': 'Adept at understanding and using rules to their advantage.',
    '10-early-teens': 'Comfortable in social groups and competent in their skills.',
    'preteens-older-teens': 'Actively trying on different identities and finding their fit.',
  };
  return teasers[ageBand] || 'Exploring and growing every day.';
};

const getShiftTeaser = (ageBand: string): string => {
  const teasers: Record<string, string> = {
    'newborn-18m': 'Transforming into someone eager to move, interact, and assert their will.',
    '18m-3y': 'A creative world blossoms through language and pretend play.',
    '2-5y': 'Inventing elaborate worlds and negotiating roles with friends.',
    '3-6y': 'Organizing scenarios, assigning roles, and following simple rules.',
    '4-7y': 'Finding satisfaction in understanding how things work and using logic.',
    '5-8y': 'Desire to master skills and understand how the real world works.',
    '6-9y': 'Building complex systems in LEGO creations and friendship groups.',
    '7-10y': 'Developing deep knowledge and passion for unique interests.',
    '8-11y': 'Using skills to define who they are through personal achievement.',
    '9-12y': 'Questioning, hypothesizing, and forming complex opinions about the world.',
    '10-early-teens': 'Figuring out their identity, beliefs, and place in the world.',
    'preteens-older-teens': 'Consolidating identity, values, and goals for the future.',
  };
  return teasers[ageBand] || 'Growing into their next stage of development.';
};

export default function YourChild() {
  const { children, getAnswers } = useStore();

  if (children.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-ivory">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-white rounded-[1.3rem] shadow-md border-0">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-ochre/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-ochre" />
              </div>
              <h2 className="text-3xl font-bold text-espresso mb-4">
                No Children Yet
              </h2>
              <p className="text-lg text-espresso/70 mb-8">
                Add your first child to get started with personalized play recommendations and developmental insights.
              </p>
              <Link to="/onboarding">
                <Button 
                  className="bg-olive hover:bg-ochre text-ivory px-8 py-6 text-lg rounded-[1.3rem] transition-colors"
                  data-testid="button-add-first-child"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your Child
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-espresso mb-3" data-testid="text-your-child-title">
            Your Children
          </h1>
          <p className="text-lg text-espresso/70">
            View and manage your children's developmental journeys
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => {
            const stages = getStageNicknames(child.ageBand);
            const milestoneTeaser = getMilestoneTeaser(child.ageBand);
            const shiftTeaser = getShiftTeaser(child.ageBand);
            
            const ageDisplay = child.birthday 
              ? (() => {
                  const { years, months } = calculateAgeFromBirthday(child.birthday);
                  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
                  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
                  return `${years}y ${months}m`;
                })()
              : getAgeBandLabel(child.ageBand);

            return (
              <Card 
                key={child.id} 
                className="bg-white rounded-[1.3rem] shadow-md hover:shadow-lg transition-shadow border-0"
                data-testid={`card-child-${child.id}`}
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="w-16 h-16 bg-ochre/10">
                      <AvatarFallback className="bg-ochre/10">
                        <User className="w-8 h-8 text-ochre" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 
                        className="text-2xl font-bold text-espresso mb-1"
                        data-testid={`text-child-name-${child.id}`}
                      >
                        {child.name}
                      </h2>
                      <p 
                        className="text-espresso/60 mb-1"
                        data-testid={`text-child-age-${child.id}`}
                      >
                        {ageDisplay}
                      </p>
                      <p 
                        className="text-sm font-medium text-olive"
                        data-testid={`text-child-stage-${child.id}`}
                      >
                        {stages.current}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-espresso/80 mb-3 uppercase tracking-wide">
                      Developmental Journey
                    </h3>
                    <div className="space-y-2 text-espresso/70">
                      <p className="text-sm leading-relaxed" data-testid={`text-milestone-${child.id}`}>
                        <span className="font-medium text-espresso">Current:</span> {milestoneTeaser}
                      </p>
                      <p className="text-sm leading-relaxed" data-testid={`text-shift-${child.id}`}>
                        <span className="font-medium text-espresso">Next:</span> {shiftTeaser}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link to={`/playboard/${child.id}`}>
                      <Button 
                        className="w-full bg-olive hover:bg-ochre text-ivory py-6 text-base rounded-[1.3rem] transition-colors"
                        data-testid={`button-view-playboard-${child.id}`}
                      >
                        View Play Board
                      </Button>
                    </Link>
                    {!getAnswers(child.id)?.fullQuestionnaire ? (
                      <Link to={`/full-questionnaire/${child.id}`}>
                        <Button 
                          variant="outline"
                          className="w-full py-6 text-base rounded-[1.3rem] border-olive text-olive hover:bg-olive/5"
                          data-testid={`button-full-assessment-${child.id}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Complete Full Assessment
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/questionnaire-results/${child.id}`}>
                        <Button 
                          variant="outline"
                          className="w-full py-6 text-base rounded-[1.3rem] border-green-600 text-green-600 hover:bg-green-50"
                          data-testid={`button-view-results-${child.id}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Assessment Results
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card 
            className="bg-white rounded-[1.3rem] shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-espresso/20"
            data-testid="card-add-child"
          >
            <CardContent className="p-8 h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-ochre/10 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-ochre" />
              </div>
              <h3 className="text-xl font-bold text-espresso mb-3">
                Add Another Child
              </h3>
              <p className="text-espresso/60 mb-6 text-center">
                Create a new profile for another child
              </p>
              <Link to="/onboarding">
                <Button 
                  className="bg-olive hover:bg-ochre text-ivory px-8 py-6 text-base rounded-[1.3rem] transition-colors"
                  data-testid="button-add-child"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Child
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
