import { Check } from "lucide-react";
import type { AssessmentStep } from "@/types/assessment";

interface ProgressIndicatorProps {
  currentStep: AssessmentStep;
  completedSteps: AssessmentStep[];
}

const STEPS = [
  { key: "demographics" as AssessmentStep, label: "Demographics" },
  { key: "phq9" as AssessmentStep, label: "PHQ-9 Assessment" },
  { key: "voice" as AssessmentStep, label: "Voice Analysis" },
  { key: "results" as AssessmentStep, label: "Results" },
];

export function ProgressIndicator({ currentStep, completedSteps }: ProgressIndicatorProps) {
  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4 mb-4">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key);
          const isCurrent = step.key === currentStep;
          const isActive = isCompleted || isCurrent;

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted 
                      ? "bg-accent text-accent-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  data-testid={`step-indicator-${step.key}`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span 
                  className={`ml-2 text-sm ${
                    isActive ? "font-medium text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div 
                  className={`w-12 h-1 ml-4 rounded ${
                    isCompleted ? "bg-accent" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progressPercentage}%` }}
          data-testid="progress-bar"
        />
      </div>
    </div>
  );
}
