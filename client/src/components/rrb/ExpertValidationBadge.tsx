import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type ValidationLevel = 'verified' | 'expert-validated' | 'documented' | 'pending';

interface ExpertValidationBadgeProps {
  level: ValidationLevel;
  expert?: string;
  source?: string;
  date?: string;
  className?: string;
}

const validationConfig = {
  'verified': {
    icon: CheckCircle2,
    label: 'Verified',
    color: 'bg-green-100 text-green-800 border-green-300',
    description: 'Verified through public records and official documentation'
  },
  'expert-validated': {
    icon: CheckCircle2,
    label: 'Expert Validated',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Validated by recognized music historian and industry expert'
  },
  'documented': {
    icon: AlertCircle,
    label: 'Documented',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Supported by archival documentation and family records'
  },
  'pending': {
    icon: HelpCircle,
    label: 'Pending Verification',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Under review for expert validation'
  }
};

export default function ExpertValidationBadge({
  level,
  expert,
  source,
  date,
  className = ''
}: ExpertValidationBadgeProps) {
  const config = validationConfig[level];
  const Icon = config.icon;

  const tooltipContent = (
    <div className="space-y-2">
      <p className="font-semibold">{config.label}</p>
      <p className="text-sm">{config.description}</p>
      {expert && <p className="text-sm">Expert: {expert}</p>}
      {source && <p className="text-sm">Source: {source}</p>}
      {date && <p className="text-sm">Date: {date}</p>}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${config.color} border cursor-help flex items-center gap-1.5 ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Usage Examples:
 * 
 * <ExpertValidationBadge 
 *   level="expert-validated"
 *   expert="Spencer Leigh"
 *   source="Email Correspondence"
 *   date="June 23, 2025"
 * />
 * 
 * <ExpertValidationBadge 
 *   level="verified"
 *   source="Discogs, BMI, USCO"
 * />
 * 
 * <ExpertValidationBadge 
 *   level="documented"
 *   source="Family Records"
 * />
 * 
 * For expert quote attribution:
 * <ExpertValidationBadge 
 *   level="expert-validated"
 *   expert="Phil Silverman"
 *   source="AllMusic Review"
 * />
 */
