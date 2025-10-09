import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useStore } from '../store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import questionnaireData from '../data/fullQuestionnaire.json';

interface QuestionResponse {
  [key: string]: string | number | string[] | boolean | { hasConcern: boolean; details?: string };
}

export default function FullQuestionnaire() {
  const [, params] = useRoute('/full-questionnaire/:childId');
  const childId = params?.childId;
  const [, setLocation] = useLocation();
  const { children, getAnswers, setAnswers } = useStore();
  const { toast } = useToast();
  
  const child = children.find(c => c.id === childId);
  const existingAnswers = childId ? getAnswers(childId) : null;

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse>({});
  
  const sections = questionnaireData.sections;
  const currentSection = sections[currentSectionIndex];
  const totalSections = sections.length;
  const progress = ((currentSectionIndex + 1) / totalSections) * 100;

  useEffect(() => {
    if (existingAnswers?.fullQuestionnaire) {
      const flatResponses: QuestionResponse = {};
      Object.entries(existingAnswers.fullQuestionnaire).forEach(([sectionKey, sectionData]) => {
        if (sectionData && typeof sectionData === 'object') {
          Object.entries(sectionData).forEach(([key, value]) => {
            flatResponses[key] = value as any;
          });
        }
      });
      setResponses(flatResponses);
    }
  }, [existingAnswers]);

  // Scroll to top whenever section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentSectionIndex]);

  if (!child || !childId) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-lg mb-4">Child not found</p>
            <Button onClick={() => setLocation('/your-child')} data-testid="button-back-to-children">
              Back to Children
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleYesNoDetails = (questionId: string, hasConcern: boolean, details?: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { hasConcern, details: details || '' }
    }));
  };

  const shouldShowQuestion = (question: any) => {
    if (!question.conditional) return true;
    const conditionValue = responses[question.conditional.field];
    return conditionValue === question.conditional.value;
  };

  const renderQuestion = (question: any, index: number) => {
    if (!shouldShowQuestion(question)) return null;

    const questionId = question.id;
    const value = responses[questionId];

    switch (question.type) {
      case 'text':
        return (
          <div key={index} className="space-y-2">
            <Label htmlFor={questionId}>{question.text}</Label>
            <Input
              id={questionId}
              value={(value as string) || ''}
              onChange={(e) => handleResponse(questionId, e.target.value)}
              data-testid={`input-${questionId}`}
            />
          </div>
        );

      case 'number':
        return (
          <div key={index} className="space-y-2">
            <Label htmlFor={questionId}>{question.text}</Label>
            <Input
              id={questionId}
              type="number"
              value={(value as number) || ''}
              onChange={(e) => handleResponse(questionId, parseInt(e.target.value) || 0)}
              data-testid={`input-${questionId}`}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={index} className="space-y-2">
            <Label htmlFor={questionId}>{question.text}</Label>
            <Textarea
              id={questionId}
              value={(value as string) || ''}
              onChange={(e) => handleResponse(questionId, e.target.value)}
              rows={4}
              data-testid={`textarea-${questionId}`}
            />
          </div>
        );

      case 'radio':
      case 'scale':
        return (
          <div key={index} className="space-y-3">
            <Label>{question.text}</Label>
            <RadioGroup
              value={(value as string) || ''}
              onValueChange={(val) => handleResponse(questionId, val)}
            >
              {question.options.map((option: string, i: number) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option} 
                    id={`${questionId}-${i}`}
                    data-testid={`radio-${questionId}-${i}`}
                  />
                  <Label htmlFor={`${questionId}-${i}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        return (
          <div key={index} className="space-y-3">
            <Label>{question.text}</Label>
            <div className="space-y-2">
              {question.options.map((option: string, i: number) => {
                const checked = Array.isArray(value) && value.includes(option);
                return (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${questionId}-${i}`}
                      checked={checked}
                      onCheckedChange={(checked) => {
                        const currentArray = (value as string[]) || [];
                        if (checked) {
                          handleResponse(questionId, [...currentArray, option]);
                        } else {
                          handleResponse(questionId, currentArray.filter(v => v !== option));
                        }
                      }}
                      data-testid={`checkbox-${questionId}-${i}`}
                    />
                    <Label htmlFor={`${questionId}-${i}`} className="font-normal cursor-pointer">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'rating':
        const ratingValue = (value as number) || 3;
        const getScaleLabel = (val: number, sectionId: string) => {
          if (sectionId === 'playBehavior') {
            const labels = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
            return labels[val - 1];
          } else if (sectionId === 'temperament') {
            const labels = ['Much less than typical', 'Less than typical', 'About typical', 'More than typical', 'Much more than typical'];
            return labels[val - 1];
          }
          return val.toString();
        };
        
        return (
          <div key={index} className="space-y-3">
            <div className="flex justify-between items-start">
              <Label className="flex-1">{question.text}</Label>
              <span className="text-sm font-semibold ml-4 min-w-[2rem] text-center" data-testid={`rating-value-${questionId}`}>
                {ratingValue}
              </span>
            </div>
            <div className="space-y-2">
              <Slider
                value={[ratingValue]}
                onValueChange={(vals) => handleResponse(questionId, vals[0])}
                min={1}
                max={question.scale || 5}
                step={1}
                className="w-full"
                data-testid={`slider-${questionId}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{getScaleLabel(1, currentSection.id)}</span>
                <span>{getScaleLabel(question.scale || 5, currentSection.id)}</span>
              </div>
            </div>
          </div>
        );

      case 'yesNoDetails':
        const concernData = value as { hasConcern: boolean; details?: string } || { hasConcern: false, details: '' };
        return (
          <div key={index} className="space-y-3">
            <Label>{question.text}</Label>
            <RadioGroup
              value={concernData.hasConcern ? 'Yes' : 'No'}
              onValueChange={(val) => handleYesNoDetails(questionId, val === 'Yes', concernData.details)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id={`${questionId}-no`} data-testid={`radio-${questionId}-no`} />
                <Label htmlFor={`${questionId}-no`} className="font-normal cursor-pointer">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id={`${questionId}-yes`} data-testid={`radio-${questionId}-yes`} />
                <Label htmlFor={`${questionId}-yes`} className="font-normal cursor-pointer">Yes</Label>
              </div>
            </RadioGroup>
            {concernData.hasConcern && (
              <div className="ml-6 mt-2">
                <Label htmlFor={`${questionId}-details`} className="text-sm">Please explain:</Label>
                <Textarea
                  id={`${questionId}-details`}
                  value={concernData.details || ''}
                  onChange={(e) => handleYesNoDetails(questionId, true, e.target.value)}
                  rows={3}
                  className="mt-1"
                  data-testid={`textarea-${questionId}-details`}
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderSubsections = () => {
    if (!currentSection.subsections) return null;
    
    return currentSection.subsections.map((subsection: any, index: number) => (
      <div key={index} className="space-y-6">
        <div className="border-l-4 border-olive pl-4">
          <h3 className="text-lg font-semibold text-olive">{subsection.title}</h3>
        </div>
        <div className="space-y-6 ml-4">
          {subsection.questions.map((q: any, i: number) => renderQuestion(q, i))}
        </div>
      </div>
    ));
  };

  const handleNext = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const formattedAnswers = {
      basicInfo: {},
      developmental: {
        communication: {},
        grossMotor: {},
        fineMotor: {},
        problemSolving: {},
        personalSocial: {}
      },
      playBehavior: {},
      temperament: {},
      environment: {},
      concerns: {}
    };

    const developmentalSectionIds = ['communication', 'grossMotor', 'fineMotor', 'problemSolving', 'personalSocial'];
    
    sections.forEach(section => {
      if (section.subsections) {
        section.subsections.forEach((subsection: any) => {
          subsection.questions.forEach((q: any) => {
            if (responses[q.id] !== undefined) {
              (formattedAnswers.developmental as any)[subsection.id][q.id] = responses[q.id];
            }
          });
        });
      } else if (developmentalSectionIds.includes(section.id)) {
        // Map developmental sections to the developmental object
        section.questions.forEach((q: any) => {
          if (responses[q.id] !== undefined) {
            (formattedAnswers.developmental as any)[section.id][q.id] = responses[q.id];
          }
        });
      } else {
        section.questions.forEach((q: any) => {
          if (responses[q.id] !== undefined) {
            (formattedAnswers as any)[section.id][q.id] = responses[q.id];
          }
        });
      }
    });

    formattedAnswers.basicInfo = {
      ...formattedAnswers.basicInfo,
      completionDate: new Date().toISOString()
    };

    const updatedAnswers = {
      schemas: existingAnswers?.schemas || [],
      barriers: existingAnswers?.barriers || [],
      interests: existingAnswers?.interests || [],
      ...existingAnswers,
      fullQuestionnaire: formattedAnswers,
      questionnaire_version: 3
    };

    setAnswers(childId, updatedAnswers);

    toast({
      title: 'Assessment Complete',
      description: 'Your responses have been saved successfully.'
    });

    setLocation(`/questionnaire-results/${childId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-questionnaire">
              Comprehensive Development Assessment
            </h1>
            <p className="text-muted-foreground mt-1">For {child.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Section {currentSectionIndex + 1} of {totalSections}</p>
            <p className="text-sm font-semibold">{Math.round(progress)}% Complete</p>
          </div>
        </div>
        <Progress value={progress} className="h-2" data-testid="progress-bar" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{currentSection.title}</CardTitle>
          <CardDescription>{currentSection.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {currentSection.subsections ? renderSubsections() : (
            <div className="space-y-6">
              {currentSection.questions.map((q: any, i: number) => renderQuestion(q, i))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSectionIndex === 0}
          data-testid="button-previous"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {currentSectionIndex < totalSections - 1 ? (
          <Button onClick={handleNext} data-testid="button-next">
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} data-testid="button-submit">
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Assessment
          </Button>
        )}
      </div>
    </div>
  );
}
