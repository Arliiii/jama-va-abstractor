import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Activity, 
  Target, 
  TrendingUp,
  Calendar,
  MapPin,
  Stethoscope,
  Heart,
  Brain,
  Pill,
  TestTube,
  Shield
} from 'lucide-react';

interface SummaryData {
  title: string;
  population: {
    size: string;
    demographics: string;
    criteria: string;
  };
  intervention: {
    treatment: string;
    duration: string;
    control: string;
  };
  setting: {
    location: string;
    type: string;
    duration: string;
  };
  outcomes: {
    primary: string;
    secondary: string[];
    measurements: string;
  };
  findings: {
    primary: string;
    secondary: string;
    significance: string;
    limitations: string;
  };
  medicalIcon: string;
}

interface SummaryDisplayProps {
  data: SummaryData;
  isVisible: boolean;
  className?: string;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ 
  data, 
  isVisible, 
  className = '' 
}) => {
  const getMedicalIcon = (iconType: string) => {
    const iconClass = "h-8 w-8 text-blue-600";
    switch (iconType.toLowerCase()) {
      case 'cardiology':
      case 'heart':
        return <Heart className={iconClass} />;
      case 'neurology':
      case 'brain':
        return <Brain className={iconClass} />;
      case 'pharmacy':
      case 'medication':
        return <Pill className={iconClass} />;
      case 'laboratory':
      case 'testing':
        return <TestTube className={iconClass} />;
      case 'preventive':
      case 'prevention':
        return <Shield className={iconClass} />;
      case 'general':
      default:
        return <Stethoscope className={iconClass} />;
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Title and Medical Icon */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm">
              {getMedicalIcon(data.medicalIcon)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                {data.title}
              </CardTitle>
              <div className="mt-2 flex items-center space-x-2">
                <Badge variant="outline" className="bg-white">
                  VA Clinical Summary
                </Badge>
                <Badge variant="secondary">
                  {data.medicalIcon}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Study Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Population */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              Population
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sample Size</p>
              <p className="text-lg font-semibold text-gray-900">{data.population.size}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Demographics</p>
              <p className="text-sm text-gray-700">{data.population.demographics}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Criteria</p>
              <p className="text-sm text-gray-700">{data.population.criteria}</p>
            </div>
          </CardContent>
        </Card>

        {/* Intervention */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-green-600" />
              Intervention
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Treatment</p>
              <p className="text-sm text-gray-700">{data.intervention.treatment}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</p>
              <p className="text-sm text-gray-700">{data.intervention.duration}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Control</p>
              <p className="text-sm text-gray-700">{data.intervention.control}</p>
            </div>
          </CardContent>
        </Card>

        {/* Setting */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-purple-600" />
              Setting
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</p>
              <p className="text-sm text-gray-700">{data.setting.location}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</p>
              <p className="text-sm text-gray-700">{data.setting.type}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</p>
              <p className="text-sm text-gray-700">{data.setting.duration}</p>
            </div>
          </CardContent>
        </Card>

        {/* Outcomes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
              <Target className="h-4 w-4 mr-2 text-orange-600" />
              Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary</p>
              <p className="text-sm text-gray-700">{data.outcomes.primary}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Secondary</p>
              <p className="text-sm text-gray-700">{data.outcomes.secondary.join(', ')}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Measurements</p>
              <p className="text-sm text-gray-700">{data.outcomes.measurements}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Findings - Two Box Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Findings */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-green-800 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Primary Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-green-700 mb-2">Key Results</p>
                <p className="text-sm text-green-800 leading-relaxed">
                  {data.findings.primary}
                </p>
              </div>
              
              <Separator className="bg-green-200" />
              
              <div>
                <p className="text-sm font-medium text-green-700 mb-2">Statistical Significance</p>
                <p className="text-sm text-green-800 leading-relaxed">
                  {data.findings.significance}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Findings */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-blue-800 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Secondary Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-2">Additional Results</p>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {data.findings.secondary}
                </p>
              </div>
              
              <Separator className="bg-blue-200" />
              
              <div>
                <p className="text-sm font-medium text-blue-700 mb-2">Limitations</p>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {data.findings.limitations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VA Footer */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">VA</span>
              </div>
              <span className="font-medium">Department of Veterans Affairs</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span>Clinical Evidence Summary</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Generated: {new Date().toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};