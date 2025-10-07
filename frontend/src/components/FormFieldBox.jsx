import React from 'react';
import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

const FormFieldBox = ({ 
  label, 
  htmlFor, 
  children, 
  error, 
  required = false, 
  helperText, 
  className,
  ...props 
}) => {
  return (
    <div className={cn(
      "bg-[#eaedff] dark:bg-[#3a3a5a] rounded-2xl p-4 shadow-sm border transition-all duration-200",
      error 
        ? "border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20" 
        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600",
      className
    )} {...props}>
      <Label 
        htmlFor={htmlFor} 
        className="text-blue-800 dark:text-blue-200 font-semibold mb-2 block"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {helperText && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
          <span className="text-red-500">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormFieldBox;
