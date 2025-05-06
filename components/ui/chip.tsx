import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chipVariants = cva(
    "inline-flex items-center cursor-pointer rounded-sm border px-2.5 py-1 text-xs font-semibold transition-colors duration-500 focus:outline-none ",
    {
      variants: {
        variant: {
          default:
            "border-transparent bg-primary text-primary-foreground shadow-sm hover:text-white hover:bg-neutral-light",
          active: "border-transparent bg-neutral-lightest",
          secondary:
            "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
          destructive:
            "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
          outline: "text-foreground",
        },
      },
      defaultVariants: {
        variant: "default",
      },
    }
  )

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {}
 
function Chip({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(chipVariants({ variant }), className)} {...props} />
  )
}

export { Chip, chipVariants }