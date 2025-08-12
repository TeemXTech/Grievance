"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedButton } from "./animated-button"

const sidebarVariants = {
  hidden: {
    x: "100%",
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.3
    }
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

const backdropVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
}

export interface AnimatedSidebarProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  position?: "left" | "right"
  width?: string
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  className?: string
}

export const AnimatedSidebar: React.FC<AnimatedSidebarProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  width = "400px",
  showCloseButton = true,
  closeOnBackdropClick = true,
  className
}) => {
  const sidebarVariantsWithPosition = {
    ...sidebarVariants,
    hidden: {
      ...sidebarVariants.hidden,
      x: position === "right" ? "100%" : "-100%"
    },
    exit: {
      ...sidebarVariants.exit,
      x: position === "right" ? "100%" : "-100%"
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />
          
          {/* Sidebar */}
          <motion.div
            className={cn(
              "relative bg-white dark:bg-gray-900 shadow-xl flex flex-col",
              position === "right" ? "ml-auto" : "mr-auto",
              className
            )}
            style={{ width }}
            variants={sidebarVariantsWithPosition}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                {title && (
                  <motion.h2
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {title}
                  </motion.h2>
                )}
                {showCloseButton && (
                  <AnimatedButton
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                    icon={<X className="h-4 w-4" />}
                  />
                )}
              </div>
            )}

            {/* Content */}
            <motion.div
              className="flex-1 overflow-y-auto p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
