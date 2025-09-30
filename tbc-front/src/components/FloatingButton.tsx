'use client'

import { useState, useEffect } from 'react'

interface FloatingButtonProps {
  icon?: React.ReactNode
  label?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  showLabel?: boolean
  pulse?: boolean
  className?: string
}

export default function FloatingButton({
  icon,
  label = '플로팅 버튼',
  position = 'bottom-right',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  showLabel = false,
  pulse = false,
  className = ''
}: FloatingButtonProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed right-6'
      case 'bottom-left':
        return 'fixed bottom-6 left-6'
      case 'top-right':
        return 'fixed top-6 right-6'
      case 'top-left':
        return 'fixed top-6 left-6'
      default:
        return 'fixed right-6'
    }
  }

  const getVariantClasses = () => {
    // 채팅 버튼과 동일한 스타일 적용
    return 'bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:bg-gray-50'
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12'
      case 'lg':
        return 'w-16 h-16'
      default:
        return 'w-14 h-14'
    }
  }

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick()
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (!showLabel) {
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (!showLabel) {
      setShowTooltip(false)
    }
  }

  return (
    <>
      <button
        className={`${getPositionClasses()} ${getVariantClasses()} ${getSizeClasses()} rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 z-40 flex items-center justify-center ${className}`}
        onClick={handleClick}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={label}
        style={{ display: isVisible ? 'flex' : 'none' }}
      >
        <div className="flex items-center justify-center">
          {icon && <span className="flex items-center justify-center">{icon}</span>}
          {showLabel && <span className="ml-2 text-sm font-medium">{label}</span>}
        </div>
      </button>

      {/* 툴팁 */}
      {showTooltip && !showLabel && (
        <div className={`fixed ${position === 'bottom-right' ? 'bottom-20 right-6' : 'bottom-20 left-6'} bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50 pointer-events-none`}>
          {label}
        </div>
      )}
    </>
  )
}
