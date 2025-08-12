"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/router"
import { cn } from "@/lib/utils"

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

export interface AnimatedLayoutProps {
  children: React.ReactNode
  className?: string
  animateChildren?: boolean
  pageKey?: string
}

export const AnimatedLayout: React.FC<AnimatedLayoutProps> = ({
  children,
  className,
  animateChildren = true,
  pageKey
}) => {
  const router = useRouter()
  const currentKey = pageKey || router.asPath

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentKey}
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}
      >
        {animateChildren ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            {React.Children.map(children, (child, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                custom={index}
              >
                {child}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          children
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Animated section component for staggered animations
export const AnimatedSection: React.FC<{
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
}> = ({ children, className, delay = 0, direction = "up" }) => {
  const directionVariants = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 }
  }

  const directionExit = {
    up: { y: -20 },
    down: { y: 20 },
    left: { x: -20 },
    right: { x: 20 }
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...directionVariants[direction]
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0
      }}
      exit={{
        opacity: 0,
        ...directionExit[direction]
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {children}
    </motion.div>
  )
}

// Animated grid component for staggered grid animations
export const AnimatedGrid: React.FC<{
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}> = ({ children, className, staggerDelay = 0.1 }) => {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          transition={{
            delay: index * staggerDelay
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
