import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface GovernmentCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  official?: boolean
  urgent?: boolean
}

export function GovernmentCard({
  title,
  description,
  children,
  className,
  official = false,
  urgent = false,
}: GovernmentCardProps) {
  return (
    <Card
      className={cn(
        "professional-card",
        official && "official-document",
        urgent && "border-l-4 border-l-red-500",
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              {official && (
                <img src="/placeholder.svg?height=20&width=20&text=TS" alt="Official" className="w-5 h-5 govt-seal" />
              )}
              <span>{title}</span>
            </CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {urgent && (
            <Badge variant="destructive" className="status-urgent-govt">
              Urgent
            </Badge>
          )}
          {official && (
            <Badge variant="secondary" className="status-official">
              Official
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
