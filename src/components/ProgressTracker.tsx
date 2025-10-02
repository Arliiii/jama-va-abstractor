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
    <div className={`glass-card border-0 shadow-xl p-8 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Processing Progress
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round(getProgressPercentage())}% Complete
            </span>
          </div>
        </div>
        
        {/* Enhanced Progress bar */}
        <div className="relative w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="progress-modern h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${getProgressPercentage()}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Enhanced Steps list */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`relative flex items-start space-x-4 p-5 rounded-xl border-0 transition-all duration-300 ${getStepColor(step.status)} shadow-sm hover:shadow-md`}
          >
            {/* Connection line */}
            {index < steps.length - 1 && (
              <div className="absolute left-8 top-14 w-0.5 h-8 bg-gradient-to-b from-current to-transparent opacity-30"></div>
            )}
            
            <div className="flex-shrink-0 relative">
              <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center">
                {getStepIcon(step.status)}
              </div>
              {step.status === 'processing' && (
                <div className="absolute inset-0 rounded-xl bg-blue-400 opacity-20 animate-ping"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-semibold">
                  {step.name}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/60 text-xs font-medium">
                    Step {index + 1}
                  </span>
                  {step.timestamp && (
                    <span className="text-xs opacity-75">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-sm leading-relaxed opacity-90 mb-3">
                {step.message}
              </p>
              
              {/* Progress indicator for current step */}
              {step.status === 'processing' && (
                <div className="w-full bg-white/40 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Overall status indicator */}
      {steps.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/30">
          {steps.every(step => step.status === 'completed') && (
            <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-green-800">All steps completed successfully! 🎉</span>
            </div>
          )}
          
          {steps.some(step => step.status === 'error') && (
            <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-red-100 to-rose-100 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-red-800">Processing encountered an error</span>
            </div>
          )}
          
          {steps.some(step => step.status === 'processing') && (
            <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
              <span className="text-sm font-semibold text-blue-800">Processing in progress...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};