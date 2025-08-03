"use client";

import * as React from "react"
import { ChevronLeft } from "lucide-react"

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, children, collapsed = false, onCollapse, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          "relative flex h-screen flex-col border-r bg-background transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          className
        )}
        {...props}
      >
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        {onCollapse && (
          <button
            onClick={() => onCollapse(!collapsed)}
            className="absolute -right-3 top-8 z-40 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </button>
        )}
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"

export interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  active?: boolean
  collapsed?: boolean
}

export const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  ({ className, icon, active, collapsed, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
          active && "bg-accent text-accent-foreground",
          collapsed && "justify-center",
          className
        )}
        {...props}
      >
        {icon && <span className="h-5 w-5">{icon}</span>}
        {!collapsed && children}
      </div>
    )
  }
)
SidebarItem.displayName = "SidebarItem"

export const SidebarSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-3 py-2", className)}
    {...props}
  />
))
SidebarSection.displayName = "SidebarSection"

export const SidebarSectionTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn(
      "mb-1 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground",
      className
    )}
    {...props}
  />
))
SidebarSectionTitle.displayName = "SidebarSectionTitle"