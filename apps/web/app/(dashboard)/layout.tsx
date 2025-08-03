"use client";

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Header } from "@packages/ui/src/header"
import { Sidebar, SidebarItem, SidebarSection, SidebarSectionTitle } from "@packages/ui/src/sidebar"
import { Button } from "@packages/ui/src/button"
import { useAuth } from "@/hooks/use-auth"
import {
  FolderOpen,
  Layout,
  Sparkles,
  Settings,
  LogOut,
  Plus,
  Bell,
  User,
  Search,
  Menu,
  History,
  Zap
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const navigation = [
    { name: "Create Project", href: "/projects", icon: Zap },
    { name: "History", href: "/history", icon: History },
    { name: "Templates", href: "/templates", icon: Layout },
    { name: "Showcase", href: "/showcase", icon: Sparkles },
  ]
  
  const userNavigation = [
    { name: "Settings", href: "/settings", icon: Settings },
  ]
  
  return (
    <div className="min-h-screen bg-background">
      <Header
        logo={
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
            <span className="text-xl font-bold">Flower</span>
          </Link>
        }
        navigation={
          <div className="flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        }
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Link href="/projects">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Project
              </Button>
            </Link>
            <div className="ml-2 flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        }
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          className="hidden md:flex"
        >
          <div className="p-4">
            {!sidebarCollapsed && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{user?.name || user?.username}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            )}
            
            <SidebarSection>
              {!sidebarCollapsed && <SidebarSectionTitle>Navigation</SidebarSectionTitle>}
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.name} href={item.href}>
                    <SidebarItem
                      icon={<Icon className="h-5 w-5" />}
                      active={pathname === item.href}
                      collapsed={sidebarCollapsed}
                    >
                      {item.name}
                    </SidebarItem>
                  </Link>
                )
              })}
            </SidebarSection>
            
            <SidebarSection className="mt-auto">
              {!sidebarCollapsed && <SidebarSectionTitle>Account</SidebarSectionTitle>}
              {userNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.name} href={item.href}>
                    <SidebarItem
                      icon={<Icon className="h-5 w-5" />}
                      active={pathname === item.href}
                      collapsed={sidebarCollapsed}
                    >
                      {item.name}
                    </SidebarItem>
                  </Link>
                )
              })}
              <button onClick={logout} className="w-full">
                <SidebarItem
                  icon={<LogOut className="h-5 w-5" />}
                  collapsed={sidebarCollapsed}
                >
                  Logout
                </SidebarItem>
              </button>
            </SidebarSection>
          </div>
        </Sidebar>
        
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-background shadow-xl">
            <div className="p-6">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">{user?.name || user?.username}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium ${
                          pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}