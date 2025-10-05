import { useRoute, useLocation } from 'wouter';
import { useStore } from '../store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Brain, 
  Heart, 
  Users, 
  Target,
  Home,
  MessageCircle
} from 'lucide-react';

export default function QuestionnaireResults() {
  const [, params] = useRoute('/questionnaire-results/:childId');
  const childId = params?.childId;
  const [, setLocation] = useLocation();
  const { children, getAnswers } = useStore();
  
  const child = children.find(c => c.id === childId);
  const answers = childId ? getAnswers(childId) : null;
  const fullQ = answers?.fullQuestionnaire;

  if (!child || !childId || !fullQ) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-lg mb-4">Assessment not found</p>
            <Button onClick={() => setLocation('/your-child')} data-testid="button-back-to-children">
              Back to Children
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateDevelopmentalInsights = () => {
    const insights = {
      strengths: [] as string[],
      emerging: [] as string[],
      concerns: [] as string[]
    };

    if (fullQ.developmental) {
      Object.entries(fullQ.developmental).forEach(([domain, responses]) => {
        if (responses && typeof responses === 'object') {
          const yesCount = Object.values(responses).filter(v => v === 'Yes').length;
          const sometimesCount = Object.values(responses).filter(v => v === 'Sometimes').length;
          const notYetCount = Object.values(responses).filter(v => v === 'Not Yet').length;
          const total = yesCount + sometimesCount + notYetCount;

          if (total > 0) {
            const yesPercent = (yesCount / total) * 100;
            const domainLabel = domain.replace(/([A-Z])/g, ' $1').trim();
            
            if (yesPercent >= 70) {
              insights.strengths.push(`Strong ${domainLabel} skills`);
            } else if (yesPercent >= 40) {
              insights.emerging.push(`Developing ${domainLabel} abilities`);
            } else {
              insights.emerging.push(`${domainLabel} skills emerging`);
            }
          }
        }
      });
    }

    if (fullQ.concerns) {
      Object.entries(fullQ.concerns).forEach(([key, value]) => {
        if (value && typeof value === 'object' && 'hasConcern' in value && value.hasConcern) {
          const concernLabel = key.replace(/([A-Z])/g, ' $1').trim();
          insights.concerns.push(`Parent concern: ${concernLabel}`);
        }
      });
    }

    return insights;
  };

  const getPlayStyleSummary = () => {
    if (!fullQ.playBehavior) return null;

    const summary = {
      preferredTypes: fullQ.playBehavior.playTypes || [],
      focusTime: fullQ.playBehavior.focusTime || 'Not specified',
      socialPreference: fullQ.playBehavior.playPreference || 'Not specified',
      activityStyle: fullQ.playBehavior.activityPreference || 'Not specified'
    };

    return summary;
  };

  const getTemperamentProfile = () => {
    if (!fullQ.temperament) return null;

    const traits = {
      high: [] as string[],
      typical: [] as string[],
      low: [] as string[]
    };

    Object.entries(fullQ.temperament).forEach(([key, value]) => {
      if (typeof value === 'number') {
        const label = key.replace(/([A-Z])/g, ' $1').trim();
        if (value >= 4) {
          traits.high.push(label);
        } else if (value >= 2) {
          traits.typical.push(label);
        } else {
          traits.low.push(label);
        }
      }
    });

    return traits;
  };

  const insights = calculateDevelopmentalInsights();
  const playStyle = getPlayStyleSummary();
  const temperament = getTemperamentProfile();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-results">
          Assessment Results for {child.name}
        </h1>
        <p className="text-muted-foreground">
          Completed on {fullQ.basicInfo?.completionDate ? new Date(fullQ.basicInfo.completionDate).toLocaleDateString() : 'Recently'}
        </p>
      </div>

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          This assessment provides insights into your child's development and play preferences. 
          It is not a diagnostic tool. Consult with healthcare providers for any specific concerns.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Strengths
            </CardTitle>
            <CardDescription>Areas where {child.name} is thriving</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.strengths.length > 0 ? (
              <ul className="space-y-2">
                {insights.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2" data-testid={`strength-${i}`}>
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Complete the developmental section to see strengths</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Emerging Skills
            </CardTitle>
            <CardDescription>Skills currently developing</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.emerging.length > 0 ? (
              <ul className="space-y-2">
                {insights.emerging.map((skill, i) => (
                  <li key={i} className="flex items-start gap-2" data-testid={`emerging-${i}`}>
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Skills are being assessed</p>
            )}
          </CardContent>
        </Card>
      </div>

      {insights.concerns.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-5 h-5" />
              Areas to Monitor
            </CardTitle>
            <CardDescription className="text-amber-700">
              You've noted some concerns - consider discussing these with your pediatrician
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.concerns.map((concern, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-900" data-testid={`concern-${i}`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {playStyle && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Play Style Profile
            </CardTitle>
            <CardDescription>How {child.name} engages with play</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Preferred Play Types</p>
              <div className="flex flex-wrap gap-2">
                {playStyle.preferredTypes.length > 0 ? (
                  playStyle.preferredTypes.map((type, i) => (
                    <Badge key={i} variant="secondary" data-testid={`play-type-${i}`}>
                      {type}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">Not specified</span>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Focus Duration</p>
                <p data-testid="text-focus-time">{playStyle.focusTime}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Social Preference</p>
                <p data-testid="text-social-preference">{playStyle.socialPreference}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {temperament && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Temperament Profile
            </CardTitle>
            <CardDescription>Understanding {child.name}'s unique temperament</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {temperament.high.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">High Intensity Traits</p>
                <div className="flex flex-wrap gap-2">
                  {temperament.high.map((trait, i) => (
                    <Badge key={i} variant="default" className="bg-purple-600" data-testid={`high-trait-${i}`}>
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {temperament.typical.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Typical Range</p>
                <div className="flex flex-wrap gap-2">
                  {temperament.typical.map((trait, i) => (
                    <Badge key={i} variant="outline" data-testid={`typical-trait-${i}`}>
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {fullQ.environment?.developmentGoals && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-olive" />
              Development Goals
            </CardTitle>
            <CardDescription>What you'd like to see develop</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap" data-testid="text-development-goals">
              {fullQ.environment.developmentGoals}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-teal-600" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>Based on this assessment, here are some recommended next steps:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span>Explore personalized play recommendations on {child.name}'s Play Board</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span>Browse age-appropriate products in our Shop that match {child.name}'s interests</span>
            </li>
            {insights.concerns.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Discuss any concerns with your pediatrician or a developmental specialist</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-4 mt-8">
        <Button onClick={() => setLocation(`/playboard/${childId}`)} data-testid="button-view-playboard">
          <Home className="w-4 h-4 mr-2" />
          View Play Board
        </Button>
        <Button variant="outline" onClick={() => setLocation('/your-child')} data-testid="button-back">
          Back to Children
        </Button>
      </div>
    </div>
  );
}
