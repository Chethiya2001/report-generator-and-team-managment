import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let variantClasses = ""
  switch (variant) {
    case "default":
      variantClasses = "border-transparent bg-blue-600 text-white shadow hover:bg-blue-700"
      break
    case "secondary":
      variantClasses = "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200"
      break
    case "destructive":
      variantClasses = "border-transparent bg-red-500 text-white shadow hover:bg-red-600"
      break
    case "success":
      variantClasses = "border-transparent bg-green-500 text-white shadow hover:bg-green-600"
      break
    case "warning":
      variantClasses = "border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-600"
      break
    case "outline":
      variantClasses = "text-gray-950 border-gray-300"
      break
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variantClasses,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
