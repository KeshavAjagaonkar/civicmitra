import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus-visible:ring-blue-500",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus-visible:ring-red-500",
        success: "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus-visible:ring-green-500",
        warning: "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 focus-visible:ring-orange-500",
        outline:
          "border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 focus-visible:ring-gray-500",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 focus-visible:ring-gray-500",
        ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none hover:shadow-md focus-visible:ring-gray-500",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline shadow-none hover:text-blue-700 dark:hover:text-blue-300 focus-visible:ring-blue-500",
        'gradient-blue-green': "bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600",
        'gradient-orange-red': "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600",
      },
      size: {
        default: "h-10 px-6 py-2 rounded-full",
        sm: "h-8 px-4 rounded-full text-xs",
        lg: "h-12 px-8 rounded-full text-base",
        xl: "h-14 px-10 rounded-2xl text-lg",
        icon: "h-10 w-10 rounded-full",
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