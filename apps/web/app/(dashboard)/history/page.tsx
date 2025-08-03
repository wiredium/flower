"use client";

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@packages/ui/src/button"
import { Input } from "@packages/ui/src/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/src/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/src/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui/src/tabs"
import { useProjectStore } from "@/stores/project.store"
import { trpc } from "@/lib/trpc"
import { formatDate } from "@/lib/utils"
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  Eye,
  Heart,
  GitFork,
  Play,
  Edit,
  Trash,
  Copy,
  Lock,
  Globe,
  FolderOpen
} from "lucide-react"

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const { projects, setProjects, deleteProject, setFilters, filters } = useProjectStore()
  
  // Apply filters inline to avoid selector issues
  const filteredProjects = React.useMemo(() => {
    let filtered = [...projects]
    
    if (filters.visibility && filters.visibility !== 'all') {
      filtered = filtered.filter((p) => p.visibility?.toLowerCase() === filters.visibility)
    }
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((p) => p.status?.toLowerCase() === filters.status)
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((p) =>
        filters.tags?.some((tag) => p.tags.includes(tag))
      )
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
      )
    }
    
    return filtered
  }, [projects, filters])
  
  const { data, isPending: isLoadingProjects } = trpc.project.list.useQuery({ limit: 50 })
  
  // Update store when data changes
  React.useEffect(() => {
    if (data?.projects) {
      // Normalize the data from API
      const normalizedProjects = data.projects.map((project: any) => ({
        ...project,
        visibility: project.visibility?.toLowerCase() as 'public' | 'private',
        status: project.status?.toLowerCase() as 'draft' | 'active' | 'archived',
        workflow: (project.workflowData || { nodes: [], edges: [] }) as any,
        owner: project.owner ? {
          ...project.owner,
          name: project.owner.name || undefined,
          username: project.owner.email?.split('@')[0] || 'user',
          createdAt: project.owner.createdAt || new Date(),
          updatedAt: project.owner.updatedAt || new Date()
        } as any : undefined,
        collaborators: project.collaborators?.map((c: any) => ({
          ...c,
          joinedAt: c.createdAt || new Date()
        })) || [],
        stats: {
          views: project._count?.executions || 0,
          likes: 0,
          forks: 0
        }
      }) as any)
      setProjects(normalizedProjects)
    }
  }, [data, setProjects])
  
  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: (data: unknown, variables: { id: string }) => {
      // Use the store's deleteProject method instead of manual filtering
      deleteProject(variables.id)
    }
  })
  
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilters({ search: query })
  }
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteMutation.mutateAsync({ id })
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project History</h1>
          <p className="text-muted-foreground">View and manage all your past AI workflow projects</p>
        </div>
        <Link href="/projects">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all" onValueChange={(value: string) => setFilters({ status: value as any })}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all" onValueChange={(value: string) => setFilters({ visibility: value as any })}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-1 border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="owned">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared with Me</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="rounded-full bg-muted p-6">
                <FolderOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No projects yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Create your first project to start building AI workflows
                </p>
              </div>
              <Link href="/projects">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Project
                </Button>
              </Link>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          <Link href={`/projects/${project.id}`} className="hover:underline">
                            {project.name}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          {project.visibility === "private" ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Globe className="h-3 w-3" />
                          )}
                          <span>{project.status}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          {project.stats?.views || 0}
                        </span>
                        <span className="flex items-center">
                          <Heart className="mr-1 h-3 w-3" />
                          {project.stats?.likes || 0}
                        </span>
                        <span className="flex items-center">
                          <GitFork className="mr-1 h-3 w-3" />
                          {project.stats?.forks || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(project.updatedAt)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
                        <div>
                          <CardTitle>
                            <Link href={`/projects/${project.id}`} className="hover:underline">
                              {project.name}
                            </Link>
                          </CardTitle>
                          <CardDescription>
                            {project.description || "No description"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="outline" size="sm">
                            Open
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}