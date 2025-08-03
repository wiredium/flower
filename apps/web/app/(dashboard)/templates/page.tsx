"use client";

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@packages/ui/src/button"
import { Input } from "@packages/ui/src/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/src/card"
import { Badge } from "@packages/ui/src/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/src/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui/src/tabs"
import { trpc } from "@/lib/trpc"
import { formatNumber } from "@/lib/utils"
import {
  Search,
  Filter,
  Star,
  Download,
  Eye,
  TrendingUp,
  Sparkles,
  Zap,
  Code,
  Palette,
  Bot,
  BarChart,
  Mail,
  Image,
  FileText,
  Globe,
  Lock,
  Users,
  Clock,
  ArrowRight,
  Layers,
  Cpu,
  Rocket
} from "lucide-react"

const categories = [
  "All Categories",
  "AI & Machine Learning",
  "Content Generation",
  "Data Analysis",
  "Development Tools",
  "Image & Design",
  "Marketing Automation",
  "Customer Support",
  "Productivity"
]

// Mock template data with beautiful designs
const mockTemplates = [
  {
    id: '1',
    name: 'AI Customer Support Bot',
    description: 'Enterprise-grade chatbot with multi-language support, sentiment analysis, and intelligent routing',
    category: 'Customer Support',
    featured: true,
    icon: Bot,
    color: 'from-blue-500 to-cyan-500',
    previewImage: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop',
    usageCount: 15234,
    rating: 4.9,
    tags: ['chatbot', 'customer-service', 'ai', 'gpt-4', 'enterprise'],
    author: {
      name: 'Alice Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
    },
    stats: {
      models: 3,
      languages: 15,
      integrations: 4,
      responseTime: '<2s'
    },
    workflow: {
      nodes: 6,
      complexity: 'Advanced'
    }
  },
  {
    id: '2',
    name: 'Content Creation Pipeline',
    description: 'Automated content generation for blogs, social media, and newsletters with SEO optimization',
    category: 'Content Generation',
    featured: true,
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
    previewImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
    usageCount: 8921,
    rating: 4.8,
    tags: ['content', 'blog', 'seo', 'marketing', 'automation'],
    author: {
      name: 'Bob Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
    },
    stats: {
      contentTypes: 4,
      platforms: 5,
      tones: 4,
      seoScore: '92+'
    },
    workflow: {
      nodes: 5,
      complexity: 'Intermediate'
    }
  },
  {
    id: '3',
    name: 'Real-time Analytics Dashboard',
    description: 'Process and visualize data streams with ML-powered anomaly detection and predictive analytics',
    category: 'Data Analysis',
    featured: true,
    icon: BarChart,
    color: 'from-green-500 to-emerald-500',
    previewImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    usageCount: 12567,
    rating: 4.9,
    tags: ['analytics', 'real-time', 'dashboard', 'ml', 'visualization'],
    author: {
      name: 'Charlie Brown',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'
    },
    stats: {
      dataSources: 5,
      visualizations: 8,
      refreshRate: '1s',
      accuracy: '99.5%'
    },
    workflow: {
      nodes: 4,
      complexity: 'Advanced'
    }
  },
  {
    id: '4',
    name: 'AI Image Generator Studio',
    description: 'Create stunning visuals with DALL-E 3, Stable Diffusion, and Midjourney integration',
    category: 'Image & Design',
    featured: false,
    icon: Image,
    color: 'from-orange-500 to-red-500',
    previewImage: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop',
    usageCount: 23456,
    rating: 4.7,
    tags: ['image', 'ai-art', 'dall-e', 'stable-diffusion', 'creative'],
    author: {
      name: 'Diana Prince',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana'
    },
    stats: {
      models: 3,
      styles: 50,
      resolution: '4K',
      speed: '10s'
    },
    workflow: {
      nodes: 5,
      complexity: 'Intermediate'
    }
  },
  {
    id: '5',
    name: 'Smart Code Review Assistant',
    description: 'Automated code review with security scanning, performance analysis, and best practices',
    category: 'Development Tools',
    featured: false,
    icon: Code,
    color: 'from-indigo-500 to-purple-500',
    previewImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
    usageCount: 9876,
    rating: 4.8,
    tags: ['code-review', 'security', 'devops', 'ci-cd', 'quality'],
    author: {
      name: 'Eve Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eve'
    },
    stats: {
      languages: 10,
      checks: 5,
      integrations: 3,
      bugsCaught: '95%'
    },
    workflow: {
      nodes: 6,
      complexity: 'Advanced'
    }
  },
  {
    id: '6',
    name: 'Email Marketing Automation',
    description: 'Personalized email campaigns with A/B testing, segmentation, and performance tracking',
    category: 'Marketing Automation',
    featured: false,
    icon: Mail,
    color: 'from-yellow-500 to-orange-500',
    previewImage: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&h=600&fit=crop',
    usageCount: 6543,
    rating: 4.6,
    tags: ['email', 'marketing', 'automation', 'personalization', 'campaigns'],
    author: {
      name: 'Frank Miller',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frank'
    },
    stats: {
      providers: 4,
      templates: 12,
      openRate: '45%',
      conversion: '8%'
    },
    workflow: {
      nodes: 5,
      complexity: 'Intermediate'
    }
  },
  {
    id: '7',
    name: 'AI Language Translator',
    description: 'Real-time translation with context awareness and cultural adaptation for 100+ languages',
    category: 'AI & Machine Learning',
    featured: false,
    icon: Globe,
    color: 'from-teal-500 to-blue-500',
    previewImage: 'https://images.unsplash.com/photo-1526378787940-576a539ba69d?w=800&h=600&fit=crop',
    usageCount: 18234,
    rating: 4.9,
    tags: ['translation', 'languages', 'ai', 'real-time', 'localization'],
    author: {
      name: 'Grace Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=grace'
    },
    stats: {
      languages: 100,
      accuracy: '98%',
      speed: '<500ms',
      contexts: 15
    },
    workflow: {
      nodes: 4,
      complexity: 'Intermediate'
    }
  },
  {
    id: '8',
    name: 'Social Media Manager',
    description: 'Schedule, analyze, and optimize content across all major social platforms',
    category: 'Marketing Automation',
    featured: false,
    icon: Users,
    color: 'from-pink-500 to-rose-500',
    previewImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
    usageCount: 7890,
    rating: 4.7,
    tags: ['social-media', 'scheduling', 'analytics', 'engagement', 'automation'],
    author: {
      name: 'Henry Ford',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=henry'
    },
    stats: {
      platforms: 6,
      posts: '500+/mo',
      engagement: '+45%',
      timeSaved: '20h/wk'
    },
    workflow: {
      nodes: 7,
      complexity: 'Advanced'
    }
  }
]

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    'AI & Machine Learning': Cpu,
    'Content Generation': FileText,
    'Data Analysis': BarChart,
    'Development Tools': Code,
    'Image & Design': Palette,
    'Marketing Automation': Mail,
    'Customer Support': Bot,
    'Productivity': Zap
  }
  return icons[category] || Layers
}

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedTab, setSelectedTab] = useState("featured")
  const router = useRouter()
  
  // Filter templates based on search and category
  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "All Categories" || template.category === selectedCategory
    const matchesTab = selectedTab === "all" || 
                       (selectedTab === "featured" && template.featured) ||
                       (selectedTab === "popular" && template.usageCount > 10000) ||
                       (selectedTab === "recent" && !template.featured)
    
    return matchesSearch && matchesCategory && matchesTab
  })
  
  const handleUseTemplate = (templateId: string) => {
    // In a real app, this would create a new project from the template
    router.push(`/projects/new?template=${templateId}`)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-full">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                Production-Ready Templates
              </span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Workflow Templates
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with pre-built AI workflows designed by experts. 
              Customize and deploy in minutes, not weeks.
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center space-x-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm text-muted-foreground">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">100K+</div>
                <div className="text-sm text-muted-foreground">Deployments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.8</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex-1 relative w-full md:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg rounded-full border-2"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => {
                  const Icon = getCategoryIcon(cat)
                  return (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {cat}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="featured">
              <Star className="h-4 w-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="popular">
              <TrendingUp className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="all">All Templates</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map(template => {
            const Icon = template.icon
            return (
              <Card key={template.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
                {template.featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="warning" className="bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}
                
                {/* Template Preview Image */}
                <div className="relative h-48 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-90`} />
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="w-full h-full object-cover mix-blend-overlay"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-black/90 p-4 rounded-full">
                      <Icon className="h-12 w-12 text-gray-800 dark:text-gray-200" />
                    </div>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg hover:text-primary transition-colors">
                        {template.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.category}
                      </p>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {template.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Author */}
                  <div className="flex items-center space-x-2">
                    <img
                      src={template.author.avatar}
                      alt={template.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-muted-foreground">
                      by {template.author.name}
                    </span>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(template.stats).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="text-center p-2 bg-muted rounded">
                        <div className="text-sm font-semibold">{value}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Usage Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Download className="mr-1 h-3 w-3" />
                      {formatNumber(template.usageCount)} uses
                    </span>
                    <span className="flex items-center">
                      <Layers className="mr-1 h-3 w-3" />
                      {template.workflow.nodes} nodes
                    </span>
                  </div>
                  
                  {/* Complexity Badge */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={template.workflow.complexity === 'Advanced' ? 'destructive' : 
                               template.workflow.complexity === 'Intermediate' ? 'warning' : 'success'}
                      className="text-xs"
                    >
                      {template.workflow.complexity}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {template.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex items-center justify-between">
                  <Button
                    className="flex-1 mr-2"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
        
        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No templates found</h3>
              <p className="text-muted-foreground max-w-sm">
                Try adjusting your search or filters to find what you're looking for
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All Categories")
                setSelectedTab("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
        
        {/* Load More */}
        {filteredTemplates.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button size="lg" variant="outline">
              <ArrowRight className="h-4 w-4 mr-2" />
              Load More Templates
            </Button>
          </div>
        )}
        
        {/* CTA Section */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Can't find what you're looking for?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our AI can help you create a custom workflow tailored to your specific needs.
              Describe your requirements and we'll build it for you.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <Sparkles className="h-5 w-5 mr-2" />
              Create Custom Workflow
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}