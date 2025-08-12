"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const shimmerVariants = {
  initial: {
    x: "-100%"
  },
  animate: {
    x: "100%",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: "none" | "sm" | "md" | "lg" | "full"
  animated?: boolean
}

const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ 
    className, 
    width, 
    height, 
    rounded = "md",
    animated = true,
    ...props 
  }, ref) => {
    const roundedClasses = {
      none: "",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-gray-200 dark:bg-gray-700",
          roundedClasses[rounded],
          className
        )}
        style={{
          width: width,
          height: height
        }}
        {...props}
      >
        {animated && (
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
          />
        )}
      </div>
    )
  }
)
LoadingSkeleton.displayName = "LoadingSkeleton"

// Predefined skeleton components
export const SkeletonText = ({ lines = 1, className }: { lines?: number; className?: string }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <LoadingSkeleton
        key={i}
        height="1rem"
        width={i === lines - 1 ? "75%" : "100%"}
        className="mb-2"
      />
    ))}
  </div>
)

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("space-y-4", className)}>
    <LoadingSkeleton height="200px" className="w-full" />
    <SkeletonText lines={3} />
  </div>
)

export const SkeletonTable = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <LoadingSkeleton key={i} height="1.5rem" width="120px" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <LoadingSkeleton key={colIndex} height="1rem" width="100px" />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonAvatar = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  }
  
  return <LoadingSkeleton className={cn(sizeClasses[size], "rounded-full")} />
}

export { LoadingSkeleton }
