import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 컴포넌트가 마운트된 후에만 렌더링하여 hydration mismatch 방지
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white h-10 w-10"
        aria-label="테마 토글"
      >
        <Sun className="h-4 w-4" />
      </button>
    )
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    
    // 수동으로 HTML 클래스 추가/제거
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // 디버깅을 위한 콘솔 로그
    console.log('Theme changed to:', newTheme)
    console.log('HTML class after manual change:', document.documentElement.className)
    
    // 접근성을 위한 안내 메시지
    const announcement = newTheme === 'dark' ? '다크 모드로 전환됨' : '라이트 모드로 전환됨'
    const announcementElement = document.createElement('div')
    announcementElement.setAttribute('aria-live', 'polite')
    announcementElement.setAttribute('aria-atomic', 'true')
    announcementElement.className = 'sr-only'
    announcementElement.textContent = announcement
    document.body.appendChild(announcementElement)
    
    setTimeout(() => {
      if (document.body.contains(announcementElement)) {
        document.body.removeChild(announcementElement)
      }
    }, 1000)
  }

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-10 w-10 hover:scale-105"
      style={{
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#111827'
      }}
      aria-label="테마 토글"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}
