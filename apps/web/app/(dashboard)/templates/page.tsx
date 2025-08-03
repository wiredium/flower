"use client";

import { useState } from "react"
import { Button } from "@packages/ui/src/button"
import { Input } from "@packages/ui/src/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/src/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/src/select"
import { trpc } from "@/lib/trpc"
import { formatNumber } from "@/lib/utils"
import {
  Search,
  Filter,
  Star,
  Download,
  Eye,
  TrendingUp,
  Sparkles
} from "lucide-react"

const categories = [
  "All Categories",
  "Content Generation",
  "Data Analysis",
  "Code Generation",
  "Image Processing",
  "Translation",
  "Summarization",
  "Q&A Systems",
  "Chatbots"
]

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  
  const { data: templates, isLoading } = trpc.template.list.useQuery({
    limit: 50,
    category: selectedCategory !== "All Categories" ? selectedCategory : undefined
  })
  
  const useMutation = trpc.template.use.useMutation({
    onSuccess: (data) => {
      // Redirect to new project
      window.location.href = `/projects/${data.projectId}`
    }
  })
  
  const handleUseTemplate = async (templateId: string) => {
    await useMutation.mutateAsync({ templateId })
  }
  
  const filteredTemplates = templates?.templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Templates</h1>
        <p className="text-muted-foreground">Start with pre-built workflow templates</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
      
      {/* Featured Templates */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">Featured Templates</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.filter(t => t.featured).slice(0, 3).map(template => (
            <Card key={template.id} className="border-2 border-yellow-200 dark:border-yellow-900">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{template.category}</p>
                  </div>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {template.rating?.toFixed(1) || "5.0"}
                    </span>
                  </div>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Download className="mr-1 h-3 w-3" />
                    {formatNumber(template.usageCount)}
                  </span>
                  <span className="flex items-center">
                    <Eye className="mr-1 h-3 w-3" />
                    {formatNumber(template.usageCount * 3)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-muted rounded-md text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleUseTemplate(template.id)}
                  disabled={useMutation.isLoading}
                >
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* All Templates */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Templates</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{template.category}</p>
                </CardHeader>
                <CardContent className="pb-3">
                  <CardDescription className="text-xs line-clamp-2">
                    {template.description}
                  </CardDescription>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Download className="mr-1 h-3 w-3" />
                      {formatNumber(template.usageCount)}
                    </span>
                    {template.rating && (
                      <span className="flex items-center">
                        <Star className="mr-1 h-3 w-3" />
                        {template.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button
                    size="sm"
                    className="w-full"
                    variant="outline"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    Use Template
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