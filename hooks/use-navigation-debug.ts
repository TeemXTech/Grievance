import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function useNavigationDebug() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log('Navigation change:', {
      pathname,
      query: Object.fromEntries(searchParams?.entries() || []),
      fullUrl: `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`
    })
  }, [pathname, searchParams])
}
