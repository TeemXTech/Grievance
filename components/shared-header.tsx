"use client"

interface SharedHeaderProps {
  title?: string
  subtitle?: string
  showDemo?: boolean
  onDemoClick?: () => void
  children?: React.ReactNode
}

export default function SharedHeader({ 
  title = "Government of Telangana", 
  subtitle = "Digital Governance Portal",
  showDemo = false,
  onDemoClick,
  children 
}: SharedHeaderProps) {
  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
              <img 
                src="https://images.news18.com/ibnlive/uploads/2023/12/d-sridhar-babu-2023-12-7f4b8b8c8b8c8b8c8b8c8b8c8b8c8b8c.jpg" 
                alt="Shri D. Sridhar Babu - IT Minister" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxwYXRoIGQ9Ik0zMiA0MEMzNi40MTgzIDQwIDQwIDM2LjQxODMgNDAgMzJDNDAgMjcuNTgxNyAzNi40MTgzIDI0IDMyIDI0QzI3LjU4MTcgMjQgMjQgMjcuNTgxNyAyNCAzMkMyNCAzNi40MTgzIDI3LjU4MTcgNDAgMzIgNDBaIiBmaWxsPSIjRkZGRkZGIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8L3N2Zz4K'
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="text-sm text-blue-200">{subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Emblem_of_Telangana.svg/200px-Emblem_of_Telangana.svg.png" 
                alt="Telangana Government Logo" 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDQ4QzM3LjI1NDggNDggNDggMzcuMjU0OCA0OCAyNEM0OCAxMC43NDUyIDM3LjI1NDggMCAyNCAwQzEwLjc0NTIgMCAwIDEwLjc0NTIgMCAyNEMwIDM3LjI1NDggMTAuNzQ1MiA0OCAyNCA0OFoiIGZpbGw9IiNGRjY5MDAiLz4KPHBhdGggZD0iTTI0IDM2QzMwLjYyNzQgMzYgMzYgMzAuNjI3NCAzNiAyNEMzNiAxNy4zNzI2IDMwLjYyNzQgMTIgMjQgMTJDMTcuMzcyNiAxMiAxMiAxNy4zNzI2IDEyIDI0QzEyIDMwLjYyNzQgMTcuMzcyNiAzNiAyNCAzNloiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+Cg=='
                }}
              />
            </div>
            {children}
          </div>
        </div>
      </div>
    </header>
  )
}