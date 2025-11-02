import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

export type StatusType = 'success' | 'error' | 'warning' | 'pending' | 'loading';

interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  description?: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    bgClass: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
    iconClass: 'text-green-600',
    textClass: 'text-green-800 dark:text-green-200'
  },
  error: {
    icon: XCircle,
    bgClass: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900', 
    iconClass: 'text-red-600',
    textClass: 'text-red-800 dark:text-red-200'
  },
  warning: {
    icon: AlertCircle,
    bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900',
    iconClass: 'text-amber-600',
    textClass: 'text-amber-800 dark:text-amber-200'
  },
  pending: {
    icon: Clock,
    bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
    iconClass: 'text-blue-600',
    textClass: 'text-blue-800 dark:text-blue-200'
  },
  loading: {
    icon: Loader2,
    bgClass: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900',
    iconClass: 'text-gray-600 animate-spin',
    textClass: 'text-gray-800 dark:text-gray-200'
  }
};

const sizeConfig = {
  sm: {
    container: 'p-3',
    icon: 'h-4 w-4',
    label: 'text-sm font-medium',
    description: 'text-xs'
  },
  md: {
    container: 'p-4',
    icon: 'h-6 w-6',
    label: 'text-base font-semibold',
    description: 'text-sm'
  },
  lg: {
    container: 'p-6',
    icon: 'h-8 w-8',
    label: 'text-lg font-semibold',
    description: 'text-base'
  }
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  description,
  className,
  showIcon = true,
  size = 'md'
}) => {
  const config = statusConfig[status];
  const sizing = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={cn(
      'border-0 shadow-md rounded-lg transition-all duration-200 hover-lift',
      config.bgClass,
      className
    )}>
      <div className={cn('flex items-center space-x-3', sizing.container)}>
        {showIcon && (
          <Icon className={cn(sizing.icon, config.iconClass)} />
        )}
        <div className="flex-1">
          <p className={cn(sizing.label, config.textClass)}>
            {label}
          </p>
          {description && (
            <p className={cn('text-muted-foreground mt-1', sizing.description)}>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};