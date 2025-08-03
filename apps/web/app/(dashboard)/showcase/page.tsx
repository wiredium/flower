"use client";

import { useState } from "react"
import Link from "next/link"
import { Button } from "@packages/ui/src/button"
import { Input } from "@packages/ui/src/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/src/card"
import { trpc } from "@/lib/trpc"
import { formatNumber, formatDate } from "@/lib/utils"
import {
  Search,
  Heart,
  GitFork,
  Eye,
  ExternalLink,
  Github,
  TrendingUp,
  Award
} from "lucide-react"

export default function ShowcasePage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const { data: showcaseItems, isLoading } = trpc.showcase.list.useQuery({
    limit: 50
  })
  
  const likeMutation = trpc.showcase.like.useMutation()
  const forkMutation = trpc.showcase.fork.useMutation()
  
  const handleLike = async (id: string) => {
    await likeMutation.mutateAsync({ id })
  }
  
  const handleFork = async (id: string) => {
    const result = await forkMutation.mutateAsync({ id })
    // Redirect to new project
    window.location.href = `/projects/${result.projectId}`
  }
  
  const filteredItems = showcaseItems?.items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []
  
  const featuredItems = filteredItems.filter(item => item.featured)
  const regularItems = filteredItems.filter(item => !item.featured)
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Showcase</h1>
        <p className="text-muted-foreground">Discover amazing workflows built by the community</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search showcase..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/showcase/submit">
          <Button>Submit Your Project</Button>
        </Link>
      </div>
      
      {/* Featured Projects */}
      {featuredItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Featured Projects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredItems.map(item => (
              <Card key={item.id} className="border-2 border-yellow-200 dark:border-yellow-900">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          by {item.author?.name || item.author?.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Award className="h-5 w-5 text-yellow-500" />
                  </div>
                  <CardDescription className="mt-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <button
                      className="flex items-center hover:text-red-500 transition-colors"
                      onClick={() => handleLike(item.id)}
                    >
                      <Heart className="mr-1 h-4 w-4" />
                      {formatNumber(item.likes)}
                    </button>
                    <span className="flex items-center">
                      <GitFork className="mr-1 h-4 w-4" />
                      {formatNumber(item.forks)}
                    </span>
                    <span className="flex items-center">
                      <Eye className="mr-1 h-4 w-4" />
                      {formatNumber(item.views)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-muted rounded-md text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-2">
                    {item.demoUrl && (
                      <Link href={item.demoUrl} target="_blank">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Demo
                        </Button>
                      </Link>
                    )}
                    {item.githubUrl && (
                      <Link href={item.githubUrl} target="_blank">
                        <Button variant="outline" size="sm">
                          <Github className="h-4 w-4 mr-1" />
                          Code
                        </Button>
                      </Link>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleFork(item.id)}
                    disabled={forkMutation.isLoading}
                  >
                    <GitFork className="h-4 w-4 mr-1" />
                    Fork
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* All Projects */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h2 className="text-xl font-semibold">Trending Projects</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">Loading showcase...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularItems.map(item => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      by {item.author?.name || item.author?.username}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <button
                      className="flex items-center hover:text-red-500 transition-colors"
                      onClick={() => handleLike(item.id)}
                    >
                      <Heart className="mr-1 h-3 w-3" />
                      {formatNumber(item.likes)}
                    </button>
                    <span className="flex items-center">
                      <GitFork className="mr-1 h-3 w-3" />
                      {formatNumber(item.forks)}
                    </span>
                    <span className="flex items-center">
                      <Eye className="mr-1 h-3 w-3" />
                      {formatNumber(item.views)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFork(item.id)}
                  >
                    <GitFork className="h-4 w-4 mr-1" />
                    Fork Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}