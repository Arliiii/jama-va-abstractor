import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
  timestamp?: string;
}

interface ProgressTrackerProps {
  steps: ProcessingStep[];
  className?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ steps, className = '' }) => {
  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStepColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getProgressPercentage = () => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Processing Progress</h3>
          <span className="text-sm text-gray-500">
            {Math.round(getProgressPercentage())}% Complete
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${getStepColor(step.status)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStepIcon(step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  {step.name}
                </h4>
                {step.timestamp && (
                  <span className="text-xs text-gray-500">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <p className="text-sm mt-1 opacity-90">
                {step.message}
              </p>
              
              {/* Step number indicator */}
              <div className="flex items-center mt-2">
                <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded-full">
                  Step {index + 1} of {steps.length}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall status indicator */}
      {steps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {steps.every(step => step.status === 'completed') && (
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">All steps completed successfully!</span>
            </div>
          )}
          
          {steps.some(step => step.status === 'error') && (
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Processing encountered an error</span>
            </div>
          )}
          
          {steps.some(step => step.status === 'processing') && (
            <div className="flex items-center space-x-2 text-blue-700">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Processing in progress...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};