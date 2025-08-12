import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card"
import { cn } from "@/lib/utils"

interface GovernmentCardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  href: string
  className?: string
}

export function GovernmentCard({ title, description, icon, href, className }: GovernmentCardProps) {
  return (
    <Link href={href} className="block">
      <Card className={cn("transition-colors hover:border-blue-300", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent />
      </Card>
    </Link>
  )
}


