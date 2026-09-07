import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    let variantClasses = ""
    switch (variant) {
      case "default":
        variantClasses = "bg-gray-900 text-white hover:bg-gray-800 shadow-sm border border-transparent"
        break
      case "destructive":
        variantClasses = "bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent"
        break
      case "outline":
        variantClasses = "border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 shadow-sm"
        break
      case "secondary":
        variantClasses = "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-transparent"
        break
      case "ghost":
        variantClasses = "hover:bg-gray-100 hover:text-gray-900 text-gray-700 border border-transparent"
        break
      case "link":
        variantClasses = "text-blue-600 underline-offset-4 hover:underline border border-transparent"
        break
    }
    
    let sizeClasses = ""
    switch (size) {
      case "default":
        sizeClasses = "h-10 px-4 py-2"
        break
      case "sm":
        sizeClasses = "h-9 rounded-md px-3 text-xs"
        break
      case "lg":
        sizeClasses = "h-11 rounded-md px-8 text-base"
        break
      case "icon":
        sizeClasses = "h-10 w-10"
        break
    }
    
    const baseClasses = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    return (
      <button
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
