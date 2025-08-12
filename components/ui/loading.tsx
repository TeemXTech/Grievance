import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  )
}

export function ButtonLoader() {
  return <Loader2 className="w-4 h-4 mr-2 animate-spin" />
}
