import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React from "react";

interface Step {
  name: string;
  icon: React.ElementType;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export const Stepper = ({ steps, currentStep, onStepClick }: StepperProps) => {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-12">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.name}>
            <button
              type="button"
              className="flex flex-col items-center gap-2 text-center"
              onClick={() => onStepClick?.(index)}
              disabled={!isCompleted || !onStepClick}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground cursor-pointer hover:bg-primary/90"
                    : isActive
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <p
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  isCompleted
                    ? "text-primary"
                    : isActive
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {step.name}
              </p>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-1 mx-4 transition-colors duration-300",
                  isCompleted ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}; 