import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const NotificationBanner = ({ 
  type = 'info', 
  message, 
  onDismiss,
  persistent = false,
  className,
  children 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const getConfig = (type) => {
    const configs = {
      success: {
        icon: CheckCircle,
        className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        iconColor: 'text-green-600 dark:text-green-400'
      },
      warning: {
        icon: AlertTriangle,
        className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
        iconColor: 'text-yellow-600 dark:text-yellow-400'
      },
      error: {
        icon: AlertCircle,
        className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
        iconColor: 'text-red-600 dark:text-red-400'
      },
      info: {
        icon: Info,
        className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
        iconColor: 'text-blue-600 dark:text-blue-400'
      }
    };

    return configs[type] || configs.info;
  };

  const config = getConfig(type);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative flex items-start p-4 rounded-lg border shadow-sm backdrop-blur-sm',
        'animate-in slide-in-from-top-2 fade-in duration-300',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 mr-3 flex-shrink-0', config.iconColor)} />
      
      <div className="flex-1 min-w-0">
        {message && (
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        )}
        {children && (
          <div className="mt-2">{children}</div>
        )}
      </div>
      
      {!persistent && (
        <button
          onClick={handleDismiss}
          className="ml-3 flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
        >
          <X className="h-4 w-4 opacity-60 hover:opacity-100 transition-opacity duration-200" />
        </button>
      )}
    </div>
  );
};

export { NotificationBanner };