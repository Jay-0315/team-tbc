'use client'

import { useState } from 'react'

interface TagButtonProps {
  label: string
  isActive?: boolean
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export default function TagButton({
  label,
  isActive = false,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}: TagButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return isActive 
          ? 'tag-primary-active' 
          : 'tag-primary'
      case 'secondary':
        return isActive 
          ? 'tag-secondary-active' 
          : 'tag-secondary'
      case 'outline':
        return isActive 
          ? 'tag-outline-active' 
          : 'tag-outline'
      default:
        return 'tag-primary'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'tag-sm'
      case 'lg':
        return 'tag-lg'
      default:
        return 'tag-md'
    }
  }

  return (
    <button
      className={`tag-button ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-pressed={isActive}
      aria-label={label}
    >
      <span className="tag-content">
        {label}
      </span>
      {isHovered && !disabled && (
        <div className="tag-ripple" />
      )}
    </button>
  )
}
