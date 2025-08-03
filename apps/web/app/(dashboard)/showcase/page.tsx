"use client";

import { useState } from "react"
import Link from "next/link"
import { Button } from "@packages/ui/src/button"
import { Input } from "@packages/ui/src/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/src/card"
import { Badge } from "@packages/ui/src/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui/src/tabs"
import {
  Search,
  Filter,
  Heart,
  Eye,
  GitFork,
  Star,
  TrendingUp,
  Award,
  Zap,
  Code,
  MessageSquare,
  ExternalLink,
  Github,
  Play
} from "lucide-react"

// Mock data for showcase
const showcaseProjects = [
  {
    id: '1',
    title: 'AI Customer Support Platform',
    description: 'Enterprise-grade chatbot handling 10K+ daily conversations across 15 languages with 99.9% uptime',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
    author: {
      name: 'Alice Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      role: 'Senior AI Engineer'
    },
    stats: {
      views: 45320,
      likes: 2341,
      forks: 567,
      stars: 1890
    },
    tags: ['AI', 'Chatbot', 'Enterprise', 'Production'],
    featured: true,
    demoUrl: 'https://demo.example.com/ai-support',
    githubUrl: 'https://github.com/example/ai-support',
    category: 'AI & Machine Learning',
    metrics: {
      users: '10,000+',
      responseTime: '<2s',
      satisfaction: '4.8/5',
      languages: '15+'
    }
  },
  {
    id: '2',
    title: 'Real-time Analytics Dashboard',
    description: 'Processing 1M+ events daily with ML-powered forecasting and anomaly detection for e-commerce',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    author: {
      name: 'Bob Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      role: 'Data Engineer'
    },
    stats: {
      views: 34567,
      likes: 1890,
      forks: 345,
      stars: 1234
    },
    tags: ['Analytics', 'Real-time', 'ML', 'Dashboard'],
    featured: true,
    demoUrl: 'https://demo.example.com/analytics',
    category: 'Data & Analytics',
    metrics: {
      events: '1M+ daily',
      latency: '<100ms',
      accuracy: '99.5%',
      savings: '60%'
    }
  },
  {
    id: '3',
    title: 'Content Generation Suite',
    description: 'AI-powered content creation generating 500+ SEO-optimized articles monthly that rank on Google',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
    author: {
      name: 'Charlie Brown',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
      role: 'Content Strategist'
    },
    stats: {
      views: 23456,
      likes: 987,
      forks: 234,
      stars: 678
    },
    tags: ['Content', 'SEO', 'Marketing', 'Automation'],
    featured: false,
    demoUrl: 'https://demo.example.com/content',
    githubUrl: 'https://github.com/example/content-suite',
    category: 'Content & Marketing',
    metrics: {
      articles: '500+/month',
      seoScore: '92/100',
      timeToPublish: '15 min',
      traffic: '+300%'
    }
  },
  {
    id: '4',
    title: 'AI Image Generation Studio',
    description: 'Professional image creation combining DALL-E 3, Stable Diffusion, and Midjourney',
    imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop',
    author: {
      name: 'Diana Prince',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
      role: 'Creative Director'
    },
    stats: {
      views: 56789,
      likes: 3456,
      forks: 789,
      stars: 2345
    },
    tags: ['Image', 'AI Art', 'DALL-E', 'Creative'],
    featured: true,
    demoUrl: 'https://demo.example.com/image-studio',
    category: 'Creative & Design',
    metrics: {
      images: '10K+ created',
      styles: '50+',
      quality: '4K',
      speed: '10s'
    }
  },
  {
    id: '5',
    title: 'Code Review Automation',
    description: 'Intelligent code review system catching bugs and security vulnerabilities before production',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
    author: {
      name: 'Eve Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eve',
      role: 'DevOps Lead'
    },
    stats: {
      views: 19876,
      likes: 1234,
      forks: 456,
      stars: 890
    },
    tags: ['DevOps', 'Security', 'Code Quality', 'CI/CD'],
    featured: false,
    demoUrl: 'https://demo.example.com/code-review',
    githubUrl: 'https://github.com/example/code-reviewer',
    category: 'Developer Tools',
    metrics: {
      bugs: '95% caught',
      reviews: '1000+/day',
      languages: '10+',
      integrations: '5+'
    }
  },
  {
    id: '6',
    title: 'Email Marketing Platform',
    description: 'Smart email campaigns with AI personalization achieving 45% open rates',
    imageUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&h=600&fit=crop',
    author: {
      name: 'Frank Miller',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frank',
      role: 'Marketing Manager'
    },
    stats: {
      views: 12345,
      likes: 678,
      forks: 123,
      stars: 456
    },
    tags: ['Email', 'Marketing', 'Automation', 'Personalization'],
    featured: false,
    demoUrl: 'https://demo.example.com/email',
    category: 'Marketing Automation',
    metrics: {
      openRate: '45%',
      clickRate: '12%',
      conversion: '8%',
      emails: '1M+/month'
    }
  }
]

const categories = [
  'All',
  'AI & Machine Learning',
  'Data & Analytics',
  'Content & Marketing',
  'Creative & Design',
  'Developer Tools',
  'Marketing Automation'
]

export default function ShowcasePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTab, setSelectedTab] = useState("featured")
  
  const filteredProjects = showcaseProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory
    const matchesTab = selectedTab === "all" || 
                       (selectedTab === "featured" && project.featured) ||
                       (selectedTab === "recent" && !project.featured)
    
    return matchesSearch && matchesCategory && matchesTab
  })
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Community Showcase
              </span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Discover Amazing AI Workflows
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore production-ready AI solutions built by our community. 
              Get inspired and learn from real-world implementations.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-full border-2"
                />
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-center space-x-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold">1,234</div>
                <div className="text-sm text-muted-foreground">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">5,678</div>
                <div className="text-sm text-muted-foreground">Developers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">10M+</div>
                <div className="text-sm text-muted-foreground">API Calls</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="featured">
                <Star className="h-4 w-4 mr-2" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="recent">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="all">All Projects</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Card key={project.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {project.featured && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white px-2 py-1 rounded text-xs">
                  {project.category}
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </div>
                </div>
                
                {/* Author */}
                <div className="flex items-center space-x-3 mt-4">
                  <img
                    src={project.author.avatar}
                    alt={project.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{project.author.name}</p>
                    <p className="text-xs text-muted-foreground">{project.author.role}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {Object.entries(project.metrics).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="text-center p-2 bg-muted rounded">
                      <div className="text-sm font-semibold">{value}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {(project.stats.views / 1000).toFixed(1)}k
                  </span>
                  <span className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {(project.stats.likes / 1000).toFixed(1)}k
                  </span>
                  <span className="flex items-center">
                    <GitFork className="h-4 w-4 mr-1" />
                    {project.stats.forks}
                  </span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {(project.stats.stars / 1000).toFixed(1)}k
                  </span>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-4">
                  {project.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="default">
                        <Play className="h-4 w-4 mr-1" />
                        Demo
                      </Button>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <Github className="h-4 w-4 mr-1" />
                        Code
                      </Button>
                    </a>
                  )}
                </div>
                <Button size="sm" variant="ghost">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Load More */}
        <div className="flex justify-center mt-12">
          <Button size="lg" variant="outline">
            Load More Projects
          </Button>
        </div>
      </div>
    </div>
  )
}