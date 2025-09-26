import { Link } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useEffect, useState } from 'react'

export default function Header() {
  const { theme } = useTheme()
  const [isDark, setIsDark] = useState(false)

  // 테마 변경 감지
  useEffect(() => {
    setIsDark(theme === 'dark')
  }, [theme])

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter] transition-colors duration-300"
      style={{
        borderColor: isDark ? '#374151' : '#e5e7eb',
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold transition-colors duration-300 hover:opacity-80"
            style={{ 
              color: isDark ? '#f9fafb' : '#111827'
            }}
          >
            <span>TEAM-TBC</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
