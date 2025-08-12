"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/router"
import { cn } from "@/lib/utils"
import { 
  Home, 
  FileText, 
  MapPin, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Bell,
  User,
  LogOut
} from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/grievances", label: "Grievances", icon: FileText },
  { href: "/map", label: "Map View", icon: MapPin },
  { href: "/officers", label: "Officers", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

const navVariants = {
  hidden: {
    x: "-100%",
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
    x: "-100%",
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

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -20
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  })
}

export interface AnimatedNavigationProps {
  className?: string
}

export const AnimatedNavigation: React.FC<AnimatedNavigationProps> = ({
  className
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter()

  const handleNavClick = (href: string) => {
    setIsOpen(false)
    router.push(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <AnimatedButton
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="lg:hidden"
        icon={<Menu className="h-6 w-6" />}
      />

      {/* Desktop Navigation */}
      <nav className={cn("hidden lg:flex items-center space-x-1", className)}>
        {navItems.map((item, index) => {
          const isActive = router.pathname === item.href
          const Icon = item.icon

          return (
            <motion.div
              key={item.href}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link href={item.href}>
                <motion.div
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative",
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                  )}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: { duration: 0.1 }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-blue-100 dark:bg-blue-900 rounded-lg"
                      layoutId="activeTab"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Mobile Navigation Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl"
              variants={navVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <motion.h2
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Navigation
                </motion.h2>
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  icon={<X className="h-5 w-5" />}
                />
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                {navItems.map((item, index) => {
                  const isActive = router.pathname === item.href
                  const Icon = item.icon

                  return (
                    <motion.div
                      key={item.href}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.button
                        className={cn(
                          "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                          isActive
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                        )}
                        onClick={() => handleNavClick(item.href)}
                        whileHover={{
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{
                          scale: 0.98,
                          transition: { duration: 0.1 }
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </motion.button>
                    </motion.div>
                  )
                })}
              </div>

              {/* User Section */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                <motion.div
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      John Doe
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Minister
                    </p>
                  </div>
                  <LogOut className="h-4 w-4 text-gray-400" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
