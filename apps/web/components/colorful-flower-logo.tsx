'use client'

interface ColorfulFlowerLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function ColorfulFlowerLogo({ 
  size = 'md', 
  showText = true, 
  className = '' 
}: ColorfulFlowerLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }
  
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur animate-pulse" />
        <div className={`relative ${sizeClasses[size]} bg-white rounded-xl flex items-center justify-center transform transition-transform group-hover:rotate-12 p-2`}>
          <img 
            src="/flower.svg" 
            alt="Flower Logo" 
            className={iconSizeClasses[size]} 
          />
        </div>
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
          Flower
        </span>
      )}
    </div>
  )
} 