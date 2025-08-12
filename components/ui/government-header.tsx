"use client"
import Image from "next/image"
import { Bell, User, LogOut, Menu } from "lucide-react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"

interface GovernmentHeaderProps {
  title?: string
  userRole?: string
  userName?: string
  onMenuClick?: () => void
  showMobileMenu?: boolean
}

export function GovernmentHeader({
  title = "Minister's Grievance System",
  userRole = "Minister",
  userName = "Hon. Minister",
  onMenuClick,
  showMobileMenu = false,
}: GovernmentHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {showMobileMenu && (
              <Button variant="ghost" size="sm" onClick={onMenuClick} className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Government Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10">
                <Image src="/telangana-logo.png" alt="Telangana Government" fill className="object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                <p className="text-xs text-gray-500">Government of Telangana</p>
              </div>
            </div>
          </div>

          {/* Center section - Title for mobile */}
          <div className="sm:hidden">
            <h1 className="text-sm font-semibold text-gray-900 truncate">Grievance System</h1>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userRole}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile title bar */}
      <div className="sm:hidden bg-gray-50 px-4 py-2 border-t">
        <p className="text-xs text-gray-600">Government of Telangana</p>
      </div>
    </header>
  )
}
