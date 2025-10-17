import { ReactNode } from "react";
import cn from "clsx";

export interface ProgressStage {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  isCompleted?: boolean;
  isActive?: boolean;
}

interface ProgressTrackerProps {
  stages: ProgressStage[];
  currentStage?: string;
  className?: string;
}

export function ProgressTracker({ stages, currentStage, className }: ProgressTrackerProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {stages.map((stage, index) => {
        const isCompleted = stage.isCompleted || (currentStage && stages.findIndex(s => s.id === currentStage) > index);
        const isActive = stage.isActive || stage.id === currentStage;
        
        return (
          <div key={stage.id} className="flex items-start gap-4">
            {/* Icon Container */}
            <div className="relative flex-shrink-0">
              {/* Connecting Line */}
              {index < stages.length - 1 && (
                <div className="absolute top-8 left-1/2 w-px h-8 bg-gray-300 transform -translate-x-1/2" />
              )}
              
              {/* Icon */}
              <div className={cn(
                "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
                isCompleted 
                  ? "border-green-500 bg-green-500 text-white" 
                  : isActive 
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-transparent text-gray-400"
              )}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stage.icon
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <h3 className={cn(
                "text-lg font-semibold mb-1 transition-colors duration-200",
                isCompleted 
                  ? "text-green-600" 
                  : isActive 
                    ? "text-blue-600"
                    : "text-gray-500"
              )}>
                {stage.title}
              </h3>
              <p className={cn(
                "text-sm transition-colors duration-200",
                isCompleted 
                  ? "text-green-500" 
                  : isActive 
                    ? "text-blue-500"
                    : "text-gray-400"
              )}>
                {stage.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Predefined icons for common onboarding stages
export const OnboardingIcons = {
  createAccount: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  confirmationCode: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  kyc: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  bankAccount: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  complete: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
};
