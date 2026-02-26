import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
        warning: "bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-500",
        outline:
          "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:ring-gray-400",
        secondary:
          "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus-visible:ring-gray-400",
        ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus-visible:ring-gray-400",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline hover:text-blue-700 dark:hover:text-blue-300 focus-visible:ring-blue-500",
        'gradient-blue-green': "bg-blue-600 text-white hover:bg-blue-700",
        'gradient-orange-red': "bg-orange-500 text-white hover:bg-orange-600",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-lg",
        sm: "h-8 px-3 rounded-md text-xs",
        lg: "h-11 px-8 rounded-lg text-base",
        xl: "h-13 px-10 rounded-xl text-lg",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  asChild = false, 
  loading = false, 
  loadingText,
  children,
  disabled,
  ...props 
}, ref) => {
  const isDisabled = disabled || loading;
  
  // This 'if' block is the only change. 
  // It handles the special 'asChild' case to prevent the error.
  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {children}
      </Slot>
    )
  }
  
  // Your original logic for a normal button is preserved here.
  // The loading spinner and text will work perfectly.
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {loading ? (loadingText || "Loading...") : children}
    </button>
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }