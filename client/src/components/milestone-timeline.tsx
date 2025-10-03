import { Check, Clock, Lightbulb, Book, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Milestone } from "@shared/schema";

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export default function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cognitive': return 'bg-primary/10 text-primary';
      case 'motor': return 'bg-secondary/10 text-secondary';
      case 'language': return 'bg-accent/10 text-accent';
      case 'social-emotional': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cognitive': return Check;
      case 'motor': return AlertCircle;
      case 'language': return Book;
      case 'social-emotional': return Clock;
      default: return Clock;
    }
  };

  const getStatusIcon = (index: number) => {
    // Simulate different milestone statuses for demo
    if (index === 0) return { icon: Check, color: 'bg-secondary', status: 'Achieved' };
    if (index === 1) return { icon: AlertCircle, color: 'bg-primary', status: 'In Progress' };
    return { icon: Clock, color: 'bg-muted', status: 'Upcoming' };
  };

  return (
    <Card className="bg-background border border-border">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-heading font-bold text-foreground">
            Developmental Milestones
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-secondary rounded-full mr-2"></div>
              <span className="text-muted-foreground">Achieved</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
              <span className="text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-muted rounded-full mr-2"></div>
              <span className="text-muted-foreground">Upcoming</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {milestones.map((milestone, index) => {
            const statusInfo = getStatusIcon(index);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={milestone.id} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 ${statusInfo.color} rounded-full flex items-center justify-center mt-1`}>
                  <StatusIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 pb-6 border-l-2 border-border pl-6 ml-5 last:border-l-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getCategoryColor(milestone.category)}>
                      {milestone.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{statusInfo.status}</span>
                  </div>
                  <h4 className="text-lg font-heading font-semibold text-foreground mb-2">
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {milestone.description}
                  </p>
                  
                  {/* Show progress for "In Progress" milestones */}
                  {index === 1 && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-foreground">Progress</span>
                        <span className="text-xs text-muted-foreground">65%</span>
                      </div>
                      <Progress value={65} className="w-full" />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    {milestone.activityIdeas && milestone.activityIdeas.length > 0 && (
                      <Button variant="link" className="p-0 h-auto text-xs text-primary" data-testid={`button-activities-${milestone.id}`}>
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Activity Ideas
                      </Button>
                    )}
                    <Button variant="link" className="p-0 h-auto text-xs text-primary" data-testid={`button-learn-more-${milestone.id}`}>
                      <Book className="w-3 h-3 mr-1" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
