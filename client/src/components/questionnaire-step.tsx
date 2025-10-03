import { ReactNode } from "react";

interface QuestionnaireStepProps {
  currentStep: number;
  children: ReactNode;
}

export default function QuestionnaireStep({ currentStep, children }: QuestionnaireStepProps) {
  return (
    <div className="space-y-6" data-testid={`step-${currentStep}`}>
      {children}
    </div>
  );
}
