import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  step: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
  duration?: number;
}

interface LogViewerProps {
  logs: LogEntry[];
  isVisible: boolean;
  className?: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({ 
  logs, 
  isVisible, 
  className = '' 
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const exportLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.step.toUpperCase()} - ${log.level.toUpperCase()}: ${log.message}${
        log.details ? `\nDetails: ${log.details}` : ''
      }${log.duration ? `\nDuration: ${log.duration}ms` : ''}`
    ).join('\n\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jama-abstractor-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible || logs.length === 0) {
    return null;
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Processing Logs
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-xs"
            >
              {showTechnicalDetails ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show Details
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {logs.length} entries
          </span>
          <Badge variant="outline" className="text-xs">
            Live Updates
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-64 pr-4">
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`border-l-4 rounded-r-lg p-3 transition-all duration-200 ${getLevelColor(log.level)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {getLevelIcon(log.level)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs font-medium">
                            {log.step}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          {log.duration && (
                            <span className="text-xs text-gray-500">
                              ({log.duration}ms)
                            </span>
                          )}
                        </div>
                        
                        {(log.details || showTechnicalDetails) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLogExpansion(log.id)}
                            className="h-6 w-6 p-0"
                          >
                            {expandedLogs.has(log.id) ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {log.message}
                      </p>
                      
                      {expandedLogs.has(log.id) && (log.details || showTechnicalDetails) && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          {log.details && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-gray-600 mb-1">Details:</p>
                              <p className="text-xs text-gray-700 font-mono bg-white p-2 rounded border">
                                {log.details}
                              </p>
                            </div>
                          )}
                          
                          {showTechnicalDetails && (
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>ID: {log.id}</div>
                              <div>Level: {log.level.toUpperCase()}</div>
                              <div>Timestamp: {log.timestamp}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};