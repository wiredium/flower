'use client'

import Link from 'next/link'
import { Button } from '@packages/ui/src/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Flower
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/showcase" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Showcase
            </Link>
            <Link href="/templates" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Templates
            </Link>
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="gradient">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Transform Ideas Into Executable Workflows
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Flower is an AI-powered workflow builder that helps you transform abstract project ideas 
            into concrete, executable plans using visual flow-based editing and intelligent automation.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" variant="gradient" className="text-lg px-8">
                Start Building Free
              </Button>
            </Link>
            <Link href="/showcase">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Explore Workflows
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Assistance</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Leverage multiple AI models including Cerebras, OpenAI, and Anthropic for optimal results in your workflows.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Visual Workflow Design</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Intuitive drag-and-drop interface with React Flow for creating complex workflows visually.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">One-Click Integrations</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Direct export to GitHub, Jira, Trello, and other development tools for seamless workflow integration.
            </p>
          </div>
        </section>

        <section className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Ideas?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of developers and teams using Flower to accelerate their workflow creation.
          </p>
          <Link href="/register">
            <Button size="lg" variant="gradient" className="text-lg px-12">
              Get Started for Free
            </Button>
          </Link>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-gray-600 dark:text-gray-400">
            © 2024 Flower. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Terms
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}