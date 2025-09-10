"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { GovernmentHeader } from "@/components/ui/government-header"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  Bell,
  Download,
  Menu,
  X,
  FolderOpen,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  ClipboardList,
  Shield,
  LogOut
} from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics"
  },
  {
    title: "Grievance Management",
    href: "/dashboard/grievances",
    icon: FileText,
    description: "Manage and assign grievances"
  },
  {
    title: "Project Management", 
    href: "/dashboard/projects",
    icon: Users,
    description: "Manage and assign projects"
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: FolderOpen,
    description: "Category & sub-category management"
  },
  // {
  //   title: "Analytics",
  //   href: "/dashboard/analytics",
  //   icon: BarChart3,
  //   description: "Performance metrics and insights"
  // },
  {
    title: "Tracking",
    href: "/dashboard/tracking",
    icon: TrendingUp,
    description: "Status updates and progress tracking"
  },
  {
    title: "AI Assistant",
    href: "/dashboard/ai-assistant",
    icon: MessageSquare,
    description: "ChatGPT-like query system"
  },
  // {
  //   title: "User Management",
  //   href: "/dashboard/users",
  //   icon: UserCheck,
  //   description: "Role-based access control"
  // },
  // {
  //   title: "Notifications",
  //   href: "/dashboard/notifications",
  //   icon: Bell,
  //   description: "Alerts and notifications"
  // },
  // {
  //   title: "Reports",
  //   href: "/dashboard/reports",
  //   icon: Download,
  //   description: "Data export and reports"
  // },
  // {
  //   title: "Settings",
  //   href: "/dashboard/settings",
  //   icon: Settings,
  //   description: "System configuration"
  // }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <GovernmentHeader />
      
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 px-4 py-6">
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-80 border-r bg-white">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-6 border-b">
              <h2 className="text-lg font-semibold">Dashboard</h2>
            </div>
            <ScrollArea className="flex-1 px-4 py-6">
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </ScrollArea>
            <div className="border-t p-4">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* <div className="flex h-16 items-center gap-4 border-b bg-white px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
            </Sheet>
            {/* <div className="flex-1">
              <h1 className="text-xl font-semibold">
                {sidebarItems.find(item => item.href === pathname)?.title || "Dashboard"}
              </h1>
              <p className="text-sm text-gray-500">
                {sidebarItems.find(item => item.href === pathname)?.description || "Overview and analytics"}
              </p>
            </div>
          </div> */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
