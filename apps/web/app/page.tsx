'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@packages/ui/src/button'
import { Card, CardContent } from '@packages/ui/src/card'
import { ColorfulFlowerLogo } from '@/components/colorful-flower-logo'
import { 
  Sparkles, 
  Zap, 
  GitBranch, 
  Users, 
  ChevronRight,
  Star,
  TrendingUp,
  Shield,
  Globe,
  Rocket,
  ArrowRight,
  CheckCircle,
  Layers,
  Code,
  Database,
  Cloud,
  Brain,
  FileText,
  Terminal,
  ListChecks,
  LayoutDashboard
} from 'lucide-react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'

// Dynamically import React Flow to avoid SSR issues
const LandingFlowDemo = dynamic(() => import('@/components/landing-flow-demo'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse text-purple-600 dark:text-purple-400">
        <Layers className="w-8 h-8 mb-2 mx-auto" />
        <p className="text-sm">Loading workflow builder...</p>
      </div>
    </div>
  ),
})

const WorkflowExamples = dynamic(() => import('@/components/workflow-examples'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse text-purple-600 dark:text-purple-400">
        <Layers className="w-6 h-6" />
      </div>
    </div>
  ),
})

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({})
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated } = useAuth()
  
  // Refs for scroll animations
  const statsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  
  // Generate stable random values for particles
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${(i * 5) % 100}%`,
      top: `${(i * 7) % 100}%`,
      delay: `${(i * 0.5) % 10}s`,
      duration: `${15 + (i * 0.7) % 10}s`
    })), []
  )


  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    // Observe sections
    const sections = [statsRef.current, featuresRef.current, testimonialsRef.current, ctaRef.current]
    sections.forEach((section) => {
      if (section) observer.observe(section)
    })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      sections.forEach((section) => {
        if (section) observer.unobserve(section)
      })
    }
  }, [])

  const stats = [
    { label: 'BRDs Generated', value: '50K+', icon: FileText },
    { label: 'Ideas Processed', value: '100K+', icon: Brain },
    { label: 'Code Projects', value: '25K+', icon: Code },
    { label: 'Active Developers', value: '10K+', icon: Users }
  ]

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Planning',
      description: 'Transform your ideas into comprehensive project plans with intelligent LLM analysis',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: ListChecks,
      title: 'Smart Todo Generation',
      description: 'Get detailed task lists and implementation steps tailored to your project needs',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FileText,
      title: 'Professional BRD Export',
      description: 'Generate complete Business Requirements Documents ready for stakeholders',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Terminal,
      title: 'Cerebras x Cline Ready',
      description: 'Export directly to your local code editor and execute with Cerebras x Cline',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      content: 'From idea to detailed BRD in minutes. The AI understands context perfectly and generates actionable plans.',
      avatar: '👩‍💻'
    },
    {
      name: 'Alex Rivera',
      role: 'Full Stack Developer',
      content: 'The Cerebras x Cline integration is seamless. I can go from concept to working code in my local environment instantly.',
      avatar: '🔬'
    },
    {
      name: 'Jordan Kim',
      role: 'Startup Founder',
      content: 'This tool replaced our entire planning phase. We now move from ideas to implementation 10x faster.',
      avatar: '🚀'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        
        {/* Mouse-following gradient */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-300/20 to-pink-300/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl transition-all duration-700 ease-out"
          style={{
            left: `${mousePosition.x * 0.05}px`,
            top: `${mousePosition.y * 0.05}px`,
            transform: `translate(-50%, -50%)`,
          }}
        />
        
        {/* Animated particles */}
        {mounted && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-purple-400 dark:bg-purple-300 rounded-full animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration
            }}
          />
        ))}
      </div>

      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent dark:bg-gray-900/80 backdrop-blur-md ">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 rounded-2xl px-6 py-4 shadow-lg">
            <ColorfulFlowerLogo size="md" showText={true} />
            <div className="hidden md:flex items-center space-x-8">
              {/* Navigation removed as requested */}
            </div>
            <div className="flex items-center space-x-4">
              {mounted ? (
                isAuthenticated ? (
                  <>
                    <Link href="/projects">
                      <Button variant="outline" className="hidden sm:flex hover:scale-105 transition-transform">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/projects">
                      <Button variant="gradient" className="shadow-lg hover:shadow-xl transition-all hover:scale-105">
                        View Projects
                        <ArrowRight className="ml-2 h-4 w-4 animate-bounce-horizontal" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" className="hidden sm:flex hover:scale-105 transition-transform">Sign In</Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="gradient" className="shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-pulse-slow">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4 animate-bounce-horizontal" />
                      </Button>
                    </Link>
                  </>
                )
              ) : (
                // Show loading state or default buttons during hydration
                <>
                  <div className="hidden sm:flex">
                    <Button variant="outline" className="hover:scale-105 transition-transform opacity-50">
                      Loading...
                    </Button>
                  </div>
                  <div>
                    <Button variant="gradient" className="shadow-lg hover:shadow-xl transition-all hover:scale-105 opacity-50">
                      Loading...
                    </Button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hackathon Partners Banner */}
      <section className="relative z-10 py-6 mt-32 bg-gradient-to-r from-purple-900/10 via-pink-900/10 to-blue-900/10 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 backdrop-blur-sm border-b border-purple-200/20 dark:border-purple-800/20 ">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Hackathon Project</span>
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative bg-white dark:bg-gray-900 rounded-lg p-2 border border-orange-200 dark:border-orange-800 group-hover:scale-110 transition-transform">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtElDOuz-lgfgqX7jSsQ-AGcOws05w2cYgYg&s" 
                      alt="Cerebras" 
                      className="h-8 w-auto"
                    />
                  </div>
                </div>
                <span className="text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Cerebras</span>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 animate-pulse">×</div>
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 rounded-lg blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2 border border-purple-200 dark:border-purple-800 group-hover:scale-110 transition-transform">
                    <img 
                      src="https://registry.npmmirror.com/@lobehub/icons-static-png/1.59.0/files/dark/cline.png" 
                      alt="Cline" 
                      className="h-8 w-auto brightness-0 invert"
                    />
                  </div>
                </div>
                <span className="text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">Cline</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section with React Flow */}
      <main className="relative z-10 container mx-auto px-4">
        <section className="py-12 relative">
          {/* Split Layout - Text on Left, Flow on Right */}
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Side - Content */}
            <div className="text-left">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 via-purple-100 to-pink-100 dark:from-orange-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-full mb-6 animate-fadeIn hover:scale-105 transition-transform border border-purple-200/50 dark:border-purple-700/50"
                style={{ 
                  transform: `translateY(${scrollY * 0.1}px)`
                }}
              >
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span className="text-sm font-medium bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Create your project fast and easy!
                </span>
                <Zap className="w-4 h-4 text-orange-500 dark:text-orange-400 animate-pulse" />
              </div>
              
              <h1 
                className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 animate-slideUp"
                style={{ 
                  transform: `translateY(${scrollY * 0.05}px)`
                }}
              >
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-300% hover:animate-gradient-fast">
                  Turn Ideas Into
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  Working Code
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 mb-6 leading-relaxed animate-slideUp animation-delay-200">
                Share your idea, get a comprehensive plan, generate BRD docs, and execute locally with 
                <span className="font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"> Cerebras</span> × 
                <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Cline</span>. 
                From concept to code in minutes.
              </p>
              
              {/* Powered By Section */}
              <div className="flex items-center gap-4 mb-8 p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/30 dark:border-purple-700/30 animate-slideUp animation-delay-300">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Powered by</span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 group">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtElDOuz-lgfgqX7jSsQ-AGcOws05w2cYgYg&s" 
                      alt="Cerebras" 
                      className="h-6 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Cerebras AI</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="flex items-center gap-2 group">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded">
                      <img 
                        src="https://registry.npmmirror.com/@lobehub/icons-static-png/1.59.0/files/dark/cline.png" 
                        alt="Cline" 
                        className="h-4 w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Cline Agent</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slideUp animation-delay-400">
                <Link href="/register">
                  <Button size="lg" variant="gradient" className="text-lg px-8 py-5 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 group">
                    Start Creating BRD
                    <FileText className="ml-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  </Button>
                </Link>
                <Link href="/showcase">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-5 hover:bg-gray-50 dark:hover:bg-gray-800 group hover:scale-105 transition-all">
                    See How It Works
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-300 animate-fadeIn animation-delay-600">
                <span className="flex items-center gap-2 hover:scale-110 transition-transform">
                  <CheckCircle className="w-4 h-4 text-green-500 animate-bounce-slow" />
                  AI-powered planning
                </span>
                <span className="flex items-center gap-2 hover:scale-110 transition-transform">
                  <CheckCircle className="w-4 h-4 text-green-500 animate-bounce-slow animation-delay-200" />
                  BRD generation
                </span>
                <span className="flex items-center gap-2 hover:scale-110 transition-transform">
                  <CheckCircle className="w-4 h-4 text-green-500 animate-bounce-slow animation-delay-400" />
                  Cerebras x Cline ready
                </span>
              </div>
            </div>
            
            {/* Right Side - React Flow Demo */}
            <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl animate-slideUp animation-delay-200">
              <LandingFlowDemo />
            </div>
          </div>
        </section>
        
        {/* Workflow Builder Features Strip */}
        <section className="py-12 mt-12 border-t border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Analysis</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <ListChecks className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Todo Lists</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">BRD Export</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cline Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} id="stats" className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div 
                  key={stat.label}
                  className={`text-center group ${isVisible.stats ? 'animate-slideUp' : 'opacity-0'}`}
                  style={{ 
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:animate-bounce" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:scale-110 transition-transform">
                    <span className="inline-block animate-count">{stat.value}</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Workflow Examples Showcase */}
        <section className="py-20 bg-gradient-to-b from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Examples */}
              <div className="relative h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
                <WorkflowExamples />
              </div>
              
              {/* Right - Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mb-6">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    BRD Generation Workflow
                  </span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  <span className="text-gray-900 dark:text-white">Transform Ideas Into </span>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Executable Plans
                  </span>
                </h2>
                
                <p className="text-lg text-gray-700 dark:text-gray-200 mb-8 leading-relaxed">
                  Share your project idea and watch as AI generates comprehensive plans, todo lists, and BRD documents. 
                  Export and execute with <span className="font-semibold">Cerebras x Cline</span> in your local development environment.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Intelligent Analysis</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">AI understands your idea and creates comprehensive project plans</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Customizable Todo Lists</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Select and refine the tasks that match your project needs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Local Execution</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Export to your code editor and build with Cerebras x Cline</p>
                    </div>
                  </div>
                </div>
                
                <Link href="/projects">
                  <Button size="lg" variant="gradient" className="shadow-lg hover:shadow-xl transition-all hover:scale-105 group">
                    Start Your Project
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section ref={featuresRef} id="features" className="py-20">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isVisible.features ? 'animate-slideUp' : 'opacity-0'}`}>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Complete BRD Pipeline
              </span>
              <span className="text-gray-900 dark:text-white"> Features</span>
            </h2>
            <p className={`text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto ${isVisible.features ? 'animate-slideUp animation-delay-200' : 'opacity-0'}`}>
              Everything you need to transform ideas into executable project plans
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={feature.title}
                  className={`group relative py-4 overflow-hidden border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    isVisible.features ? 'animate-slideUp' : 'opacity-0'
                  }`}
                  style={{ 
                    animationDelay: `${index * 150}ms`
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <CardContent className="p-8 relative z-10">
                    <div className="mb-6 mt-2">
                      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <Icon className="w-6 h-6 text-white group-hover:animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Interactive Workflow Builder CTA */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20" />
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
                <GitBranch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Visual Workflow Design
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-gray-900 dark:text-white">See Your </span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Workflows Come to Life
                </span>
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto mb-8">
                Watch data flow through your automation in real-time. Debug, optimize, and perfect your workflows with visual feedback.
              </p>
            </div>
            
            {/* Workflow Builder Preview */}
            <div className="relative max-w-5xl mx-auto">
              <div className="aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
                      <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      AI-Powered BRD Generator
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Transform your ideas into comprehensive project documentation with AI
                    </p>
                    <Link href="/register">
                      <Button variant="gradient" size="lg" className="shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
                        Generate Your First BRD
                        <FileText className="ml-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Floating workflow elements */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl opacity-20 blur-2xl animate-pulse" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl opacity-20 blur-2xl animate-pulse animation-delay-2000" />
            </div>
            
            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-3">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Connect Everything</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Integrate with 100+ tools and services
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mb-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Processing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Execute workflows instantly with live monitoring
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Enterprise Security</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  SOC2 compliant with end-to-end encryption
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section ref={testimonialsRef} id="testimonials" className="py-20">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isVisible.testimonials ? 'animate-slideUp' : 'opacity-0'}`}>
              <span className="text-gray-900 dark:text-white">Loved by </span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Developers
              </span>
            </h2>
            <p className={`text-xl text-gray-700 dark:text-gray-200 ${isVisible.testimonials ? 'animate-slideUp animation-delay-200' : 'opacity-0'}`}>
              See what our users are saying about Flower
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.name}
                className={`relative hover:shadow-xl transition-all hover:-translate-y-2 py-4 h-full ${
                  isVisible.testimonials ? 'animate-slideUp' : 'opacity-0'
                }`}
                style={{ 
                  animationDelay: `${index * 150}ms`
                }}
              >
                <CardContent className="p-6 h-full flex flex-col overflow-hidden group">
                  <div className="mb-4 mt-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={`star-${testimonial.name}-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0 group-hover:animate-bounce-slow" style={{ animationDelay: `${i * 100}ms` }} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 mb-6 italic flex-grow">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-3xl flex items-center justify-center w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full group-hover:scale-110 transition-transform">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} id="cta" className="py-20 text-center">
          <div className={`relative max-w-3xl mx-auto ${isVisible.cta ? 'animate-slideUp' : 'opacity-0'}`}>
            <div className="relative w-full h-80 bg-white rounded-2xl overflow-hidden shadow-xl">
              {/* Purple Glow Top */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: "#ffffff",
                  backgroundImage: `
                    radial-gradient(
                      circle at top center,
                      rgba(173, 109, 244, 0.5),
                      transparent 70%
                    )
                  `,
                  filter: "blur(80px)",
                  backgroundRepeat: "no-repeat",
                }}
              />
              
              {/* Content Container */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center px-8 py-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100/50 backdrop-blur-sm rounded-full mb-4">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">No-Code Workflow Builder</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 animate-fadeIn">
                  Start Building Your Workflow in Minutes
                </h2>
                <p className="text-sm mb-6 text-gray-600 max-w-md mx-auto animate-fadeIn animation-delay-200">
                  Drag, drop, connect. Create powerful automations with our visual workflow builder powered by AI.
                </p>
                <div className="animate-fadeIn animation-delay-400">
                  <Link href="/register">
                    <Button size="sm" variant="gradient" className="px-6 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1 group">
                      Get Started for Free
                      <Rocket className="ml-2 h-4 w-4 group-hover:animate-bounce" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-12 mt-20 border-t border-gray-200 dark:border-gray-800">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="animate-fadeIn">
            <div className="mb-4">
              <ColorfulFlowerLogo size="sm" showText={true} />
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              AI-powered BRD generator built for Cerebras × Cline Hackathon
            </p>
            
            {/* Hackathon Partners */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Hackathon Partners</p>
              <div className="flex items-center gap-4">
                <div className="group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-400 rounded blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtElDOuz-lgfgqX7jSsQ-AGcOws05w2cYgYg&s" 
                      alt="Cerebras" 
                      className="relative h-6 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
                <span className="text-purple-600 dark:text-purple-400 font-bold">×</span>
                <div className="group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-400 rounded blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded">
                      <img 
                        src="https://registry.npmmirror.com/@lobehub/icons-static-png/1.59.0/files/dark/cline.png" 
                        alt="Cline" 
                        className="h-4 w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="animate-fadeIn animation-delay-200">
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><Link href="/features" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">Pricing</Link></li>
              <li><Link href="/showcase" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">Showcase</Link></li>
              <li><Link href="/templates" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">Templates</Link></li>
            </ul>
          </div>
          <div className="animate-fadeIn animation-delay-400">
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><Link href="/about" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">About</Link></li>
              <li><Link href="/blog" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">Contact</Link></li>
            </ul>
          </div>
          <div className="animate-fadeIn animation-delay-600">
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><Link href="/docs" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">Documentation</Link></li>
              <li><Link href="/api" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">API Reference</Link></li>
              <li><Link href="/support" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">Support</Link></li>
              <li><Link href="/status" className="hover:text-purple-600 transition-colors hover:translate-x-1 inline-block">Status</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="text-gray-700 dark:text-gray-300 mb-4 md:mb-0">
            © 2025 Flower - Cerebras × Cline Hackathon Project
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors hover:scale-110">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors hover:scale-110">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors hover:scale-110">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes gradient-fast {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-30px) translateX(20px);
          }
          66% {
            transform: translateY(20px) translateX(-20px);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes bounce-horizontal {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(5px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes count {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slideUp {
          opacity: 0;
          animation: slideUp 0.8s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.6s ease-out forwards;
        }
        
        .animate-gradient {
          animation: gradient 6s ease infinite;
        }
        
        .animate-gradient-fast {
          animation: gradient-fast 3s ease infinite;
        }
        
        .animate-blob {
          animation: blob 8s infinite;
        }
        
        .animate-float {
          animation: float 20s infinite ease-in-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        
        .animate-bounce-horizontal {
          animation: bounce-horizontal 1.5s infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
        
        .animate-count {
          animation: count 1s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .bg-300\% {
          background-size: 300% 300%;
        }
      `}</style>
    </div>
  )
}