"use client";

import * as React from "react"
import { Menu, X } from "lucide-react"

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode
  navigation?: React.ReactNode
  actions?: React.ReactNode
  mobileMenuOpen?: boolean
  onMobileMenuToggle?: () => void
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, logo, navigation, actions, mobileMenuOpen, onMobileMenuToggle, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className
        )}
        {...props}
      >
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            {logo}
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {navigation}
            </nav>
            <div className="flex items-center space-x-2">
              {actions}
            </div>
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 md:hidden"
              onClick={onMobileMenuToggle}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </button>
          </div>
        </div>
      </header>
    )
  }
)
Header.displayName = "Header"