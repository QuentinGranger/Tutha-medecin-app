import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "./badge.module.css"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantClass = {
    default: styles.primary,
    secondary: styles.secondary,
    destructive: styles.destructive,
    outline: styles.outline,
  }[variant]

  return (
    <div
      className={cn(styles.badge, variantClass, className)}
      {...props}
    />
  )
}

export { Badge }
