import React from 'react';

export const Separator = ({ className = '', orientation = 'horizontal', ...props }) => {
  const baseClasses = 'shrink-0 bg-border';
  const orientationClasses = orientation === 'horizontal' 
    ? 'h-[1px] w-full' 
    : 'h-full w-[1px]';
  
  return (
    <div
      className={`${baseClasses} ${orientationClasses} ${className}`}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
};