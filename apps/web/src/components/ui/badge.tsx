import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
        warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
        destructive: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
        info: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
        neutral: "bg-gray-100 text-gray-700 ring-1 ring-gray-600/20",
        outline: "text-foreground ring-1 ring-border",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
