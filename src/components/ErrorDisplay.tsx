import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink,
  HelpCircle,
  Clock,
  Globe,
  Key,
  FileX,
  Wrench
} from 'lucide-react';

interface ErrorDetails {
  step: string;
  code: string;
  message: string;
  reason: string;
  timestamp: string;
  recoveryActions: string[];
  technicalDetails?: string;
  relatedLinks?: Array<{
    title: string;
    url: string;
  }>;
}

interface ErrorDisplayProps {
  error: ErrorDetails;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  onDismiss, 
  className = '' 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const getStepIcon = (step: string) => {
    switch (step.toLowerCase()) {
      case 'scraping':
      case 'scrape':
        return <Globe className="h-5 w-5 text-orange-500" />;
      case 'parsing':
      case 'parse':
        return <FileX className="h-5 w-5 text-blue-500" />;
      case 'summarizing':
      case 'summarize':
        return <Key className="h-5 w-5 text-purple-500" />;
      case 'generating':
      case 'generate':
        return <Wrench className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getErrorSeverity = (code: string) => {
    if (code.startsWith('CRITICAL')) return 'critical';
    if (code.startsWith('WARNING')) return 'warning';
    return 'error';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 text-red-900';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-900';
      default:
        return 'border-orange-500 bg-orange-50 text-orange-900';
    }
  };

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const severity = getErrorSeverity(error.code);

  return (
    <Card className={`border-2 ${getSeverityColor(severity)} ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getStepIcon(error.step)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <span>Processing Error</span>
                <Badge variant="destructive" className="text-xs">
                  {error.step}
                </Badge>
              </CardTitle>
              <div className="mt-1 flex items-center space-x-2 text-sm opacity-75">
                <Clock className="h-3 w-3" />
                <span>{new Date(error.timestamp).toLocaleString()}</span>
                <span>•</span>
                <code className="text-xs bg-black bg-opacity-10 px-1 rounded">
                  {error.code}
                </code>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                className="text-xs"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs"
            >
              {showDetails ? (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Show Details
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Main Error Message */}
        <Alert className="mb-4 border-0 p-4 bg-white bg-opacity-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {error.message}
          </AlertDescription>
        </Alert>

        {/* Error Reason */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            What went wrong?
          </h4>
          <p className="text-sm leading-relaxed bg-white bg-opacity-50 p-3 rounded">
            {error.reason}
          </p>
        </div>

        {/* Recovery Actions */}
        {error.recoveryActions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center">
              <Wrench className="h-4 w-4 mr-2" />
              How to fix this:
            </h4>
            <div className="space-y-2">
              {error.recoveryActions.map((action, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-5 h-5 bg-white bg-opacity-75 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Details */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t border-black border-opacity-20">
            {/* Technical Details */}
            {error.technicalDetails && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Technical Details</h4>
                <div className="bg-black bg-opacity-10 p-3 rounded text-xs font-mono whitespace-pre-wrap">
                  {error.technicalDetails}
                </div>
              </div>
            )}

            {/* Related Links */}
            {error.relatedLinks && error.relatedLinks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Helpful Resources</h4>
                <div className="space-y-2">
                  {error.relatedLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Information */}
            <div className="text-xs space-y-1 opacity-75">
              <div><span className="font-medium">Error ID:</span> {error.code}</div>
              <div><span className="font-medium">Step:</span> {error.step}</div>
              <div><span className="font-medium">Time:</span> {error.timestamp}</div>
              <div><span className="font-medium">Severity:</span> {severity.toUpperCase()}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-black border-opacity-20">
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('mailto:support@example.com?subject=JAMA Abstractor Error&body=' + encodeURIComponent(`Error: ${error.code}\nMessage: ${error.message}\nStep: ${error.step}\nTime: ${error.timestamp}`))}
          >
            Report Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};