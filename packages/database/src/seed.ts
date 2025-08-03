import { prisma } from './client'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  console.log('Cleaning existing data...')
  await prisma.workflowExecution.deleteMany()
  await prisma.aIGeneration.deleteMany()
  await prisma.projectCollaborator.deleteMany()
  await prisma.project.deleteMany()
  await prisma.template.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  console.log('Creating users...')
  const hashedPassword = await bcrypt.hash('demo123456', 10)
  
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      hashedPassword,
      role: 'ADMIN',
      credits: 5000,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
    }
  })

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      hashedPassword,
      role: 'USER',
      credits: 1000,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
    }
  })

  const charlie = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      name: 'Charlie Brown',
      hashedPassword,
      role: 'USER',
      credits: 500,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'
    }
  })

  // Create projects
  console.log('Creating projects...')
  const aiAssistant = await prisma.project.create({
    data: {
      name: 'AI Customer Assistant',
      description: 'An intelligent chatbot that handles customer inquiries using GPT-4 and Claude models',
      ownerId: alice.id,
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      tags: ['ai', 'chatbot', 'customer-service', 'gpt-4', 'claude'],
      workflowData: {
        nodes: [
          {
            id: '1',
            type: 'input',
            position: { x: 100, y: 100 },
            data: { label: 'Customer Input', type: 'text' }
          },
          {
            id: '2',
            type: 'ai',
            position: { x: 300, y: 100 },
            data: { label: 'GPT-4 Analysis', model: 'gpt-4', prompt: 'Analyze customer intent' }
          },
          {
            id: '3',
            type: 'output',
            position: { x: 500, y: 100 },
            data: { label: 'Send Response', type: 'email' }
          }
        ],
        edges: [
          { id: 'e1', source: '1', target: '2' },
          { id: 'e2', source: '2', target: '3' }
        ]
      }
    }
  })

  const dataAnalytics = await prisma.project.create({
    data: {
      name: 'Sales Data Analytics Pipeline',
      description: 'Automated data processing pipeline for sales analytics with real-time dashboards',
      ownerId: alice.id,
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      tags: ['analytics', 'data-pipeline', 'automation', 'dashboard'],
      workflowData: {
        nodes: [
          {
            id: '1',
            type: 'database',
            position: { x: 100, y: 100 },
            data: { label: 'Fetch Sales Data', source: 'postgresql' }
          },
          {
            id: '2',
            type: 'transform',
            position: { x: 300, y: 100 },
            data: { label: 'Clean & Transform', operations: ['dedup', 'normalize'] }
          },
          {
            id: '3',
            type: 'output',
            position: { x: 500, y: 100 },
            data: { label: 'Update Dashboard', type: 'api' }
          }
        ],
        edges: [
          { id: 'e1', source: '1', target: '2' },
          { id: 'e2', source: '2', target: '3' }
        ]
      }
    }
  })

  const contentGenerator = await prisma.project.create({
    data: {
      name: 'Content Generation Suite',
      description: 'Multi-model content generation system for blog posts, social media, and marketing copy',
      ownerId: bob.id,
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      tags: ['content', 'marketing', 'ai-writing', 'social-media'],
      workflowData: {
        nodes: [
          {
            id: '1',
            type: 'input',
            position: { x: 100, y: 100 },
            data: { label: 'Topic Input', type: 'form' }
          },
          {
            id: '2',
            type: 'ai',
            position: { x: 300, y: 100 },
            data: { label: 'Generate Content', model: 'gpt-4', prompt: 'Write blog post' }
          },
          {
            id: '3',
            type: 'ai',
            position: { x: 500, y: 100 },
            data: { label: 'SEO Optimization', model: 'custom', prompt: 'Optimize for SEO' }
          },
          {
            id: '4',
            type: 'output',
            position: { x: 700, y: 100 },
            data: { label: 'Publish', type: 'wordpress' }
          }
        ],
        edges: [
          { id: 'e1', source: '1', target: '2' },
          { id: 'e2', source: '2', target: '3' },
          { id: 'e3', source: '3', target: '4' }
        ]
      }
    }
  })

  const imageProcessor = await prisma.project.create({
    data: {
      name: 'Image Processing Workflow',
      description: 'Advanced image processing with DALL-E 3 and Stable Diffusion integration',
      ownerId: bob.id,
      visibility: 'PRIVATE',
      status: 'ACTIVE',
      tags: ['image', 'dall-e', 'stable-diffusion', 'computer-vision'],
      workflowData: { nodes: [], edges: [] }
    }
  })

  const codeReviewer = await prisma.project.create({
    data: {
      name: 'AI Code Reviewer',
      description: 'Automated code review system with security analysis and best practices suggestions',
      ownerId: charlie.id,
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      tags: ['code-review', 'security', 'development', 'automation'],
      workflowData: { nodes: [], edges: [] }
    }
  })

  // Create templates
  console.log('Creating templates...')
  const chatbotTemplate = await prisma.template.create({
    data: {
      name: 'Customer Service Chatbot',
      description: 'Ready-to-use chatbot template with multi-language support',
      category: 'CHATBOT',
      authorId: alice.id,
      isPublic: true,
      tags: ['chatbot', 'customer-service', 'template'],
      workflowData: { nodes: [], edges: [] },
      prefillData: {
        models: ['gpt-4', 'claude-3'],
        languages: ['en', 'es', 'fr', 'de'],
        features: ['intent-detection', 'sentiment-analysis', 'auto-translation']
      },
      icon: 'https://via.placeholder.com/600x400/667eea/ffffff?text=Chatbot+Template'
    }
  })

  const dataTemplate = await prisma.template.create({
    data: {
      name: 'Data Analytics Dashboard',
      description: 'Complete data pipeline with visualization dashboard',
      category: 'DATA_PROCESSING',
      authorId: alice.id,
      isPublic: true,
      tags: ['analytics', 'dashboard', 'etl'],
      workflowData: { nodes: [], edges: [] },
      prefillData: {
        datasources: ['postgresql', 'mongodb', 'csv'],
        visualizations: ['charts', 'tables', 'heatmaps'],
        refreshRate: '5min'
      },
      icon: 'https://via.placeholder.com/600x400/f687b3/ffffff?text=Analytics+Template'
    }
  })

  const contentTemplate = await prisma.template.create({
    data: {
      name: 'Content Marketing Suite',
      description: 'Generate blog posts, social media content, and email campaigns',
      category: 'CONTENT_GENERATION',
      authorId: bob.id,
      isPublic: true,
      tags: ['content', 'marketing', 'automation'],
      workflowData: { nodes: [], edges: [] },
      prefillData: {
        contentTypes: ['blog', 'social', 'email', 'ad-copy'],
        platforms: ['wordpress', 'medium', 'linkedin', 'twitter'],
        seoTools: true
      },
      icon: 'https://via.placeholder.com/600x400/48bb78/ffffff?text=Content+Template'
    }
  })

  // Create workflow executions
  console.log('Creating workflow executions...')
  await prisma.workflowExecution.createMany({
    data: [
      {
        projectId: aiAssistant.id,
        status: 'COMPLETED',
        startedAt: new Date('2024-01-15T10:00:00Z'),
        completedAt: new Date('2024-01-15T10:02:30Z'),
        logs: [{ message: 'Workflow completed successfully' }],
        results: { satisfaction: 'high', resolved: true }
      },
      {
        projectId: aiAssistant.id,
        status: 'COMPLETED',
        startedAt: new Date('2024-01-15T11:00:00Z'),
        completedAt: new Date('2024-01-15T11:01:45Z'),
        logs: [{ message: 'Workflow completed successfully' }],
        results: { satisfaction: 'medium', resolved: true }
      },
      {
        projectId: dataAnalytics.id,
        status: 'RUNNING',
        startedAt: new Date('2024-01-15T12:00:00Z'),
        logs: [{ message: 'Workflow running' }]
      },
      {
        projectId: contentGenerator.id,
        status: 'COMPLETED',
        startedAt: new Date('2024-01-14T09:00:00Z'),
        completedAt: new Date('2024-01-14T09:15:00Z'),
        logs: [{ message: 'Workflow completed successfully' }],
        results: { wordCount: 1500, seoScore: 92 }
      },
      {
        projectId: contentGenerator.id,
        status: 'FAILED',
        startedAt: new Date('2024-01-13T14:00:00Z'),
        completedAt: new Date('2024-01-13T14:05:00Z'),
        error: 'API rate limit exceeded',
        logs: [{ message: 'API rate limit exceeded' }]
      }
    ]
  })

  // Create AI generations
  console.log('Creating AI generations...')
  await prisma.aIGeneration.createMany({
    data: [
      {
        userId: alice.id,
        projectId: aiAssistant.id,
        taskType: 'text_generation',
        model: 'gpt-4',
        provider: 'openrouter',
        prompt: 'Analyze customer sentiment',
        response: 'The customer appears frustrated but willing to find a solution...',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.0015,
        latency: 1500
      },
      {
        userId: alice.id,
        projectId: contentGenerator.id,
        taskType: 'text_generation',
        model: 'claude-3-opus',
        provider: 'openrouter',
        prompt: 'Write a blog post about AI trends',
        response: 'Artificial Intelligence continues to reshape industries...',
        inputTokens: 500,
        outputTokens: 1500,
        cost: 0.02,
        latency: 3000
      },
      {
        userId: bob.id,
        projectId: dataAnalytics.id,
        taskType: 'data_analysis',
        model: 'custom-ml',
        provider: 'openrouter',
        prompt: 'Detect anomalies in sales data',
        response: JSON.stringify({ anomalies: 3, confidence: 0.92 }),
        inputTokens: 30,
        outputTokens: 20,
        cost: 0.0005,
        latency: 500
      }
    ]
  })

  // Create collaborators
  console.log('Creating collaborators...')
  await prisma.projectCollaborator.createMany({
    data: [
      {
        projectId: aiAssistant.id,
        userId: bob.id,
        role: 'EDITOR'
      },
      {
        projectId: aiAssistant.id,
        userId: charlie.id,
        role: 'VIEWER'
      },
      {
        projectId: dataAnalytics.id,
        userId: bob.id,
        role: 'EDITOR'
      },
      {
        projectId: contentGenerator.id,
        userId: alice.id,
        role: 'EDITOR'
      },
      {
        projectId: contentGenerator.id,
        userId: charlie.id,
        role: 'VIEWER'
      }
    ]
  })

  console.log('✅ Seed completed successfully!')
  console.log('📧 Test accounts:')
  console.log('   - alice@example.com (Admin)')
  console.log('   - bob@example.com (User)')
  console.log('   - charlie@example.com (User)')
  console.log('   Password for all: demo123456')
  console.log('')
  console.log('📊 Created:')
  console.log(`   - ${await prisma.user.count()} users`)
  console.log(`   - ${await prisma.project.count()} projects`)
  console.log(`   - ${await prisma.template.count()} templates`)
  console.log(`   - ${await prisma.workflowExecution.count()} workflow executions`)
  console.log(`   - ${await prisma.aIGeneration.count()} AI generations`)
  console.log(`   - ${await prisma.projectCollaborator.count()} collaborators`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })