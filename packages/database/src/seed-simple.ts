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

  // Create projects with workflow data
  console.log('Creating projects...')
  const aiAssistant = await prisma.project.create({
    data: {
      name: 'AI Customer Assistant',
      description: 'An intelligent chatbot that handles customer inquiries using GPT-4 and Claude models. Features multi-language support and sentiment analysis.',
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
            data: { label: 'Customer Input', type: 'text', description: 'Receive customer message' }
          },
          {
            id: '2',
            type: 'ai',
            position: { x: 300, y: 100 },
            data: { label: 'GPT-4 Analysis', model: 'gpt-4', prompt: 'Analyze customer intent and sentiment' }
          },
          {
            id: '3',
            type: 'condition',
            position: { x: 500, y: 100 },
            data: { label: 'Route by Intent', conditions: ['support', 'sales', 'general'] }
          },
          {
            id: '4',
            type: 'ai',
            position: { x: 700, y: 50 },
            data: { label: 'Support Response', model: 'claude-3', prompt: 'Generate helpful support response' }
          },
          {
            id: '5',
            type: 'ai',
            position: { x: 700, y: 150 },
            data: { label: 'Sales Response', model: 'gpt-4', prompt: 'Generate sales-focused response' }
          },
          {
            id: '6',
            type: 'output',
            position: { x: 900, y: 100 },
            data: { label: 'Send Response', type: 'email', format: 'html' }
          }
        ],
        edges: [
          { id: 'e1', source: '1', target: '2', animated: true },
          { id: 'e2', source: '2', target: '3' },
          { id: 'e3', source: '3', target: '4', label: 'support' },
          { id: 'e4', source: '3', target: '5', label: 'sales' },
          { id: 'e5', source: '4', target: '6' },
          { id: 'e6', source: '5', target: '6' }
        ]
      }
    }
  })

  const dataAnalytics = await prisma.project.create({
    data: {
      name: 'Sales Data Analytics Pipeline',
      description: 'Automated data processing pipeline for sales analytics with real-time dashboards and anomaly detection.',
      ownerId: alice.id,
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      tags: ['analytics', 'data-pipeline', 'automation', 'dashboard', 'real-time'],
      workflowData: {
        nodes: [
          {
            id: '1',
            type: 'database',
            position: { x: 100, y: 100 },
            data: { label: 'Fetch Sales Data', source: 'postgresql', query: 'SELECT * FROM sales' }
          },
          {
            id: '2',
            type: 'transform',
            position: { x: 300, y: 100 },
            data: { label: 'Clean & Transform', operations: ['dedup', 'normalize', 'aggregate'] }
          },
          {
            id: '3',
            type: 'ai',
            position: { x: 500, y: 100 },
            data: { label: 'Anomaly Detection', model: 'custom-ml', prompt: 'Detect unusual patterns' }
          },
          {
            id: '4',
            type: 'parallel',
            position: { x: 700, y: 100 },
            data: { label: 'Process Results' }
          },
          {
            id: '5',
            type: 'output',
            position: { x: 900, y: 50 },
            data: { label: 'Update Dashboard', type: 'api', endpoint: '/api/dashboard' }
          },
          {
            id: '6',
            type: 'output',
            position: { x: 900, y: 150 },
            data: { label: 'Send Alerts', type: 'email', recipients: 'team@company.com' }
          }
        ],
        edges: [
          { id: 'e1', source: '1', target: '2', animated: true },
          { id: 'e2', source: '2', target: '3' },
          { id: 'e3', source: '3', target: '4' },
          { id: 'e4', source: '4', target: '5' },
          { id: 'e5', source: '4', target: '6' }
        ]
      }
    }
  })

  const contentGenerator = await prisma.project.create({
    data: {
      name: 'Content Generation Suite',
      description: 'Multi-model content generation system for blog posts, social media, and marketing copy with SEO optimization.',
      ownerId: bob.id,
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      tags: ['content', 'marketing', 'ai-writing', 'social-media', 'seo'],
      workflowData: {
        nodes: [
          {
            id: '1',
            type: 'input',
            position: { x: 100, y: 100 },
            data: { label: 'Topic & Keywords', type: 'form', fields: ['topic', 'keywords', 'tone'] }
          },
          {
            id: '2',
            type: 'ai',
            position: { x: 300, y: 100 },
            data: { label: 'Research', model: 'perplexity', prompt: 'Research topic and gather information' }
          },
          {
            id: '3',
            type: 'ai',
            position: { x: 500, y: 100 },
            data: { label: 'Generate Outline', model: 'claude-3', prompt: 'Create detailed blog outline' }
          },
          {
            id: '4',
            type: 'ai',
            position: { x: 700, y: 100 },
            data: { label: 'Write Content', model: 'gpt-4', prompt: 'Write engaging blog post' }
          },
          {
            id: '5',
            type: 'ai',
            position: { x: 900, y: 100 },
            data: { label: 'SEO Optimization', model: 'custom', prompt: 'Optimize for search engines' }
          },
          {
            id: '6',
            type: 'output',
            position: { x: 1100, y: 100 },
            data: { label: 'Publish', type: 'wordpress', autoPublish: true }
          }
        ],
        edges: [
          { id: 'e1', source: '1', target: '2', animated: true },
          { id: 'e2', source: '2', target: '3' },
          { id: 'e3', source: '3', target: '4' },
          { id: 'e4', source: '4', target: '5' },
          { id: 'e5', source: '5', target: '6' }
        ]
      }
    }
  })

  const imageProcessor = await prisma.project.create({
    data: {
      name: 'Image Processing Workflow',
      description: 'Advanced image processing with DALL-E 3 and Stable Diffusion integration for creative projects.',
      ownerId: bob.id,
      visibility: 'PRIVATE',
      status: 'ACTIVE',
      tags: ['image', 'dall-e', 'stable-diffusion', 'computer-vision', 'creative'],
      workflowData: {
        nodes: [
          {
            id: '1',
            type: 'input',
            position: { x: 100, y: 100 },
            data: { label: 'Image Input', type: 'image', accept: 'image/*' }
          },
          {
            id: '2',
            type: 'ai',
            position: { x: 300, y: 100 },
            data: { label: 'Analyze Image', model: 'gpt-4-vision', prompt: 'Describe image content' }
          },
          {
            id: '3',
            type: 'ai',
            position: { x: 500, y: 50 },
            data: { label: 'Generate with DALL-E', model: 'dall-e-3', prompt: 'Create variations' }
          },
          {
            id: '4',
            type: 'ai',
            position: { x: 500, y: 150 },
            data: { label: 'Generate with SD', model: 'stable-diffusion', prompt: 'Create artistic version' }
          },
          {
            id: '5',
            type: 'output',
            position: { x: 700, y: 100 },
            data: { label: 'Save Results', type: 's3', bucket: 'images' }
          }
        ],
        edges: [
          { id: 'e1', source: '1', target: '2', animated: true },
          { id: 'e2', source: '2', target: '3' },
          { id: 'e3', source: '2', target: '4' },
          { id: 'e4', source: '3', target: '5' },
          { id: 'e5', source: '4', target: '5' }
        ]
      }
    }
  })

  const codeReviewer = await prisma.project.create({
    data: {
      name: 'AI Code Reviewer',
      description: 'Automated code review system with security analysis, best practices suggestions, and performance optimization tips.',
      ownerId: charlie.id,
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      tags: ['code-review', 'security', 'development', 'automation', 'devops'],
      workflowData: {
        nodes: [
          {
            id: '1',
            type: 'input',
            position: { x: 100, y: 100 },
            data: { label: 'Code Input', type: 'code', language: 'auto-detect' }
          },
          {
            id: '2',
            type: 'parallel',
            position: { x: 300, y: 100 },
            data: { label: 'Analyze Code' }
          },
          {
            id: '3',
            type: 'ai',
            position: { x: 500, y: 50 },
            data: { label: 'Security Scan', model: 'gpt-4', prompt: 'Find security vulnerabilities' }
          },
          {
            id: '4',
            type: 'ai',
            position: { x: 500, y: 150 },
            data: { label: 'Code Quality', model: 'claude-3', prompt: 'Review code quality and patterns' }
          },
          {
            id: '5',
            type: 'ai',
            position: { x: 500, y: 250 },
            data: { label: 'Performance', model: 'gpt-4', prompt: 'Suggest performance improvements' }
          },
          {
            id: '6',
            type: 'aggregate',
            position: { x: 700, y: 150 },
            data: { label: 'Combine Results' }
          },
          {
            id: '7',
            type: 'output',
            position: { x: 900, y: 150 },
            data: { label: 'Generate Report', type: 'markdown', template: 'code-review' }
          }
        ],
        edges: [
          { id: 'e1', source: '1', target: '2', animated: true },
          { id: 'e2', source: '2', target: '3' },
          { id: 'e3', source: '2', target: '4' },
          { id: 'e4', source: '2', target: '5' },
          { id: 'e5', source: '3', target: '6' },
          { id: 'e6', source: '4', target: '6' },
          { id: 'e7', source: '5', target: '6' },
          { id: 'e8', source: '6', target: '7' }
        ]
      }
    }
  })

  const emailAutomation = await prisma.project.create({
    data: {
      name: 'Email Marketing Automation',
      description: 'Intelligent email campaign manager with personalization and A/B testing capabilities.',
      ownerId: alice.id,
      visibility: 'PUBLIC',
      status: 'DRAFT',
      tags: ['email', 'marketing', 'automation', 'personalization'],
      workflowData: {
        nodes: [
          {
            id: '1',
            type: 'input',
            position: { x: 100, y: 100 },
            data: { label: 'Campaign Data', type: 'json' }
          },
          {
            id: '2',
            type: 'ai',
            position: { x: 300, y: 100 },
            data: { label: 'Personalize Content', model: 'gpt-4', prompt: 'Personalize for recipient' }
          },
          {
            id: '3',
            type: 'output',
            position: { x: 500, y: 100 },
            data: { label: 'Send Email', type: 'sendgrid' }
          }
        ],
        edges: [
          { id: 'e1', source: '1', target: '2' },
          { id: 'e2', source: '2', target: '3' }
        ]
      }
    }
  })

  // Skip other models for now
  console.log('Skipping additional data creation...')

  /*
  // Commented out - these can be added later with proper schema
  await prisma.workflowExecution.createMany({
    data: [
      {
        projectId: aiAssistant.id,
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        tokensUsed: 1250,
        cost: 0.0125,
        result: { satisfaction: 'high', resolved: true, responseTime: '2.3s' }
      },
      {
        projectId: aiAssistant.id,
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        completedAt: new Date(Date.now() - 0.9 * 60 * 60 * 1000),
        tokensUsed: 980,
        cost: 0.0098,
        result: { satisfaction: 'medium', resolved: true, responseTime: '1.8s' }
      },
      {
        projectId: dataAnalytics.id,
        status: 'RUNNING',
        startedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        tokensUsed: 450,
        cost: 0.0045
      },
      {
        projectId: contentGenerator.id,
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        completedAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000),
        tokensUsed: 3500,
        cost: 0.035,
        result: { wordCount: 1500, seoScore: 92, readingTime: '7min' }
      },
      {
        projectId: contentGenerator.id,
        status: 'FAILED',
        startedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        completedAt: new Date(Date.now() - 47.9 * 60 * 60 * 1000),
        error: 'API rate limit exceeded',
        tokensUsed: 500,
        cost: 0.005
      },
      {
        projectId: codeReviewer.id,
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        completedAt: new Date(Date.now() - 2.8 * 60 * 60 * 1000),
        tokensUsed: 2100,
        cost: 0.021,
        result: { issues: 5, critical: 1, suggestions: 12 }
      }
    ]
  })

  // Create AI generations
  console.log('Creating AI generations...')
  await prisma.aIGeneration.createMany({
    data: [
      {
        projectId: aiAssistant.id,
        model: 'gpt-4',
        prompt: 'Analyze customer sentiment: "I\'ve been waiting for 2 hours and no one has helped me!"',
        response: 'The customer is expressing frustration and anger. Sentiment: Negative. Urgency: High. Recommended action: Immediate escalation to senior support with apology.',
        tokensUsed: 150,
        cost: 0.0015
      },
      {
        projectId: contentGenerator.id,
        model: 'claude-3-opus',
        prompt: 'Write an introduction for a blog post about AI trends in 2024',
        response: 'As we navigate through 2024, artificial intelligence continues to reshape industries at an unprecedented pace. From multimodal AI systems that seamlessly blend text, image, and video understanding to autonomous agents capable of complex reasoning, the landscape of AI is evolving faster than ever before...',
        tokensUsed: 2000,
        cost: 0.02
      },
      {
        projectId: dataAnalytics.id,
        model: 'custom-ml',
        prompt: 'Detect anomalies in Q4 sales data',
        response: JSON.stringify({ 
          anomalies: 3, 
          confidence: 0.92,
          details: [
            { date: '2024-01-10', deviation: '+45%', category: 'electronics' },
            { date: '2024-01-15', deviation: '-30%', category: 'clothing' },
            { date: '2024-01-18', deviation: '+60%', category: 'books' }
          ]
        }),
        tokensUsed: 50,
        cost: 0.0005
      },
      {
        projectId: imageProcessor.id,
        model: 'dall-e-3',
        prompt: 'Create a futuristic cityscape with flying cars and neon lights',
        response: 'https://example.com/generated-image-1.png',
        tokensUsed: 0,
        cost: 0.04
      },
      {
        projectId: codeReviewer.id,
        model: 'gpt-4',
        prompt: 'Review this JavaScript function for security issues',
        response: 'Found 2 security vulnerabilities: 1) SQL injection risk in line 23 - use parameterized queries. 2) XSS vulnerability in line 45 - sanitize user input before rendering.',
        tokensUsed: 500,
        cost: 0.005
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
        role: 'EDITOR',
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        projectId: aiAssistant.id,
        userId: charlie.id,
        role: 'VIEWER',
        joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      {
        projectId: dataAnalytics.id,
        userId: bob.id,
        role: 'EDITOR',
        joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      },
      {
        projectId: contentGenerator.id,
        userId: alice.id,
        role: 'EDITOR',
        joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
      },
      {
        projectId: contentGenerator.id,
        userId: charlie.id,
        role: 'VIEWER',
        joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        projectId: codeReviewer.id,
        userId: alice.id,
        role: 'EDITOR',
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    ]
  })
  */

  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('📧 Test accounts created:')
  console.log('   Email: alice@example.com | Password: demo123456 | Role: Admin')
  console.log('   Email: bob@example.com   | Password: demo123456 | Role: User')
  console.log('   Email: charlie@example.com | Password: demo123456 | Role: User')
  console.log('')
  console.log('📊 Database populated with:')
  console.log(`   ✓ ${await prisma.user.count()} users`)
  console.log(`   ✓ ${await prisma.project.count()} projects with workflows`)
  console.log('')
  console.log('🚀 You can now login and explore the dashboard!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })