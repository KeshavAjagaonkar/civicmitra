import React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

const FloatingActionButton = ({ 
  children, 
  className, 
  onClick, 
  variant = "default",
  size = "default",
  tooltip,
  ...props 
}) => {
  return (
    <div className="relative group">
      <Button
        className={cn(
          "fab shadow-2xl hover:shadow-2xl",
          className
        )}
        variant={variant}
        size={size}
        onClick={onClick}
        {...props}
      >
        {children}
      </Button>
      
      {tooltip && (
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
            {tooltip}
            <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 dark:border-l-gray-100 border-y-4 border-y-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export { FloatingActionButton };