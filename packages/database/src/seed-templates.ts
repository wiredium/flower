import { prisma } from './client'

async function main() {
  console.log('🎨 Creating templates and showcase items...')

  // Get existing users
  const alice = await prisma.user.findUnique({ where: { email: 'alice@example.com' } })
  const bob = await prisma.user.findUnique({ where: { email: 'bob@example.com' } })
  const charlie = await prisma.user.findUnique({ where: { email: 'charlie@example.com' } })

  if (!alice || !bob || !charlie) {
    console.error('❌ Users not found. Run seed-simple.ts first!')
    return
  }

  // Create templates with beautiful designs
  console.log('📝 Creating templates...')
  
  const templates = await Promise.all([
    prisma.template.create({
      data: {
        name: 'AI Customer Support Bot',
        description: 'Enterprise-grade chatbot with multi-language support, sentiment analysis, and intelligent routing',
        category: 'CHATBOT',
        isPublic: true,
        tags: ['chatbot', 'customer-service', 'ai', 'gpt-4', 'enterprise'],
      prefillData: {
          models: ['gpt-4', 'claude-3-opus', 'gemini-pro'],
          languages: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
          features: [
            'intent-detection',
            'sentiment-analysis',
            'auto-translation',
            'conversation-history',
            'escalation-handling'
          ],
          integrations: ['slack', 'teams', 'zendesk', 'salesforce']
        },
        icon: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop',
        workflowData: {
          nodes: [
            { id: '1', type: 'input', position: { x: 100, y: 200 }, data: { label: 'Customer Message' } },
            { id: '2', type: 'ai', position: { x: 300, y: 200 }, data: { label: 'Analyze Intent', model: 'gpt-4' } },
            { id: '3', type: 'condition', position: { x: 500, y: 200 }, data: { label: 'Route Query' } },
            { id: '4', type: 'ai', position: { x: 700, y: 100 }, data: { label: 'Technical Support', model: 'claude-3' } },
            { id: '5', type: 'ai', position: { x: 700, y: 300 }, data: { label: 'Sales Inquiry', model: 'gpt-4' } },
            { id: '6', type: 'output', position: { x: 900, y: 200 }, data: { label: 'Send Response' } }
          ],
          edges: [
            { id: 'e1', source: '1', target: '2', animated: true },
            { id: 'e2', source: '2', target: '3' },
            { id: 'e3', source: '3', target: '4', label: 'technical' },
            { id: 'e4', source: '3', target: '5', label: 'sales' },
            { id: 'e5', source: '4', target: '6' },
            { id: 'e6', source: '5', target: '6' }
          ]
        }
      }
    }),
    
    prisma.template.create({
      data: {
        name: 'Content Creation Pipeline',
        description: 'Automated content generation for blogs, social media, and newsletters with SEO optimization',
        category: 'CONTENT_GENERATION',
        isPublic: true,
        tags: ['content', 'blog', 'seo', 'marketing', 'automation'],
      prefillData: {
          contentTypes: ['blog-post', 'social-media', 'newsletter', 'product-description'],
          platforms: ['wordpress', 'medium', 'linkedin', 'twitter', 'facebook'],
          seoFeatures: ['keyword-optimization', 'meta-tags', 'readability-score'],
          tones: ['professional', 'casual', 'humorous', 'technical']
        },
        icon: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
        workflowData: {
          nodes: [
            { id: '1', type: 'input', position: { x: 100, y: 200 }, data: { label: 'Topic & Keywords' } },
            { id: '2', type: 'ai', position: { x: 300, y: 200 }, data: { label: 'Research', model: 'perplexity' } },
            { id: '3', type: 'ai', position: { x: 500, y: 200 }, data: { label: 'Generate Content', model: 'gpt-4' } },
            { id: '4', type: 'ai', position: { x: 700, y: 200 }, data: { label: 'SEO Optimize', model: 'custom' } },
            { id: '5', type: 'output', position: { x: 900, y: 200 }, data: { label: 'Publish' } }
          ],
          edges: [
            { id: 'e1', source: '1', target: '2', animated: true },
            { id: 'e2', source: '2', target: '3' },
            { id: 'e3', source: '3', target: '4' },
            { id: 'e4', source: '4', target: '5' }
          ]
        }
      }
    }),

    prisma.template.create({
      data: {
        name: 'Real-time Data Analytics',
        description: 'Process and visualize data streams with ML-powered anomaly detection and predictive analytics',
        category: 'DATA_PROCESSING',
        isPublic: true,
        tags: ['analytics', 'real-time', 'dashboard', 'ml', 'visualization'],
      prefillData: {
          dataSources: ['postgresql', 'mongodb', 'kafka', 'elasticsearch', 'api'],
          visualizations: ['line-chart', 'bar-chart', 'heatmap', 'scatter-plot', 'gauge'],
          mlModels: ['anomaly-detection', 'forecasting', 'clustering', 'classification'],
          refreshRate: '1s',
          alerts: true
        },
        icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        workflowData: {
          nodes: [
            { id: '1', type: 'database', position: { x: 100, y: 200 }, data: { label: 'Data Source' } },
            { id: '2', type: 'transform', position: { x: 300, y: 200 }, data: { label: 'Process Data' } },
            { id: '3', type: 'ai', position: { x: 500, y: 200 }, data: { label: 'ML Analysis', model: 'custom-ml' } },
            { id: '4', type: 'output', position: { x: 700, y: 200 }, data: { label: 'Dashboard Update' } }
          ],
          edges: [
            { id: 'e1', source: '1', target: '2', animated: true },
            { id: 'e2', source: '2', target: '3' },
            { id: 'e3', source: '3', target: '4' }
          ]
        }
      }
    }),

    prisma.template.create({
      data: {
        name: 'AI Image Generator Studio',
        description: 'Create stunning visuals with DALL-E 3, Stable Diffusion, and Midjourney integration',
        category: 'IMAGE_GENERATION',
        isPublic: true,
        tags: ['image', 'ai-art', 'dall-e', 'stable-diffusion', 'creative'],
      prefillData: {
          models: ['dall-e-3', 'stable-diffusion-xl', 'midjourney-v6'],
          styles: ['photorealistic', 'anime', 'oil-painting', 'watercolor', '3d-render'],
          resolutions: ['512x512', '1024x1024', '1920x1080', '4k'],
          features: ['upscaling', 'variation-generation', 'style-transfer', 'background-removal']
        },
        icon: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop',
        workflowData: {
          nodes: [
            { id: '1', type: 'input', position: { x: 100, y: 200 }, data: { label: 'Prompt Input' } },
            { id: '2', type: 'ai', position: { x: 300, y: 100 }, data: { label: 'DALL-E 3', model: 'dall-e-3' } },
            { id: '3', type: 'ai', position: { x: 300, y: 300 }, data: { label: 'Stable Diffusion', model: 'sd-xl' } },
            { id: '4', type: 'aggregate', position: { x: 500, y: 200 }, data: { label: 'Combine Results' } },
            { id: '5', type: 'output', position: { x: 700, y: 200 }, data: { label: 'Gallery' } }
          ],
          edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '1', target: '3' },
            { id: 'e3', source: '2', target: '4' },
            { id: 'e4', source: '3', target: '4' },
            { id: 'e5', source: '4', target: '5' }
          ]
        }
      }
    }),

    prisma.template.create({
      data: {
        name: 'Smart Code Review Assistant',
        description: 'Automated code review with security scanning, performance analysis, and best practices',
        category: 'DEVELOPMENT',
        isPublic: true,
        tags: ['code-review', 'security', 'devops', 'ci-cd', 'quality'],
      prefillData: {
          languages: ['javascript', 'typescript', 'python', 'java', 'go', 'rust'],
          checks: ['security-vulnerabilities', 'code-smells', 'performance', 'complexity', 'style'],
          integrations: ['github', 'gitlab', 'bitbucket', 'jenkins'],
          reports: ['markdown', 'html', 'json', 'sarif']
        },
        icon: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
        workflowData: {
          nodes: [
            { id: '1', type: 'input', position: { x: 100, y: 200 }, data: { label: 'Code Input' } },
            { id: '2', type: 'parallel', position: { x: 300, y: 200 }, data: { label: 'Analyze' } },
            { id: '3', type: 'ai', position: { x: 500, y: 100 }, data: { label: 'Security Scan', model: 'gpt-4' } },
            { id: '4', type: 'ai', position: { x: 500, y: 300 }, data: { label: 'Code Quality', model: 'claude-3' } },
            { id: '5', type: 'aggregate', position: { x: 700, y: 200 }, data: { label: 'Generate Report' } },
            { id: '6', type: 'output', position: { x: 900, y: 200 }, data: { label: 'Review Complete' } }
          ],
          edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '2', target: '3' },
            { id: 'e3', source: '2', target: '4' },
            { id: 'e4', source: '3', target: '5' },
            { id: 'e5', source: '4', target: '5' },
            { id: 'e6', source: '5', target: '6' }
          ]
        }
      }
    }),

    prisma.template.create({
      data: {
        name: 'Email Marketing Automation',
        description: 'Personalized email campaigns with A/B testing, segmentation, and performance tracking',
        category: 'AUTOMATION',
        isPublic: true,
        tags: ['email', 'marketing', 'automation', 'personalization', 'campaigns'],
      prefillData: {
          providers: ['sendgrid', 'mailchimp', 'ses', 'mailgun'],
          features: ['personalization', 'ab-testing', 'segmentation', 'drip-campaigns'],
          templates: ['newsletter', 'promotional', 'transactional', 'welcome-series'],
          analytics: ['open-rate', 'click-rate', 'conversion', 'unsubscribe']
        },
        icon: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&h=600&fit=crop',
        workflowData: {
          nodes: [
            { id: '1', type: 'input', position: { x: 100, y: 200 }, data: { label: 'Audience Data' } },
            { id: '2', type: 'ai', position: { x: 300, y: 200 }, data: { label: 'Personalize', model: 'gpt-4' } },
            { id: '3', type: 'condition', position: { x: 500, y: 200 }, data: { label: 'A/B Test' } },
            { id: '4', type: 'output', position: { x: 700, y: 150 }, data: { label: 'Send Version A' } },
            { id: '5', type: 'output', position: { x: 700, y: 250 }, data: { label: 'Send Version B' } }
          ],
          edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '2', target: '3' },
            { id: 'e3', source: '3', target: '4', label: 'A' },
            { id: 'e4', source: '3', target: '5', label: 'B' }
          ]
        }
      }
    })
  ])

  console.log(`✅ Created ${templates.length} templates`)

  // Get all projects for showcase
  const projects = await prisma.project.findMany()

  // Create showcase entries for projects
  console.log('🎭 Creating showcase entries...')
  
  const showcaseEntries = projects.length >= 3 ? await Promise.all([
    prisma.showcaseEntry.create({
      data: {
        projectId: projects[0]!.id,
        title: 'Enterprise AI Assistant - 10K+ Daily Users',
        description: 'Production-ready chatbot handling customer support for Fortune 500 companies with 99.9% uptime',
        tags: ['enterprise', 'production', 'ai', 'customer-success'],
        sanitizedWorkflow: {
          nodes: [],
          edges: []
        },
        authorName: 'Alice'
      }
    }),
    
    prisma.showcaseEntry.create({
      data: {
        projectId: projects[1]!.id,
        title: 'Real-time Analytics Dashboard for E-commerce',
        description: 'Processing 1M+ events per day with live dashboards and predictive analytics',
        tags: ['analytics', 'e-commerce', 'real-time', 'scale'],
        sanitizedWorkflow: {
          nodes: [],
          edges: []
        },
        authorName: 'Bob'
      }
    }),
    
    prisma.showcaseEntry.create({
      data: {
        projectId: projects[2]!.id,
        title: 'AI Content Generator - 500+ Blog Posts Monthly',
        description: 'Automated content creation system generating SEO-optimized articles that rank on Google',
        tags: ['content', 'seo', 'automation', 'marketing'],
        sanitizedWorkflow: {
          nodes: [],
          edges: []
        },
        authorName: 'Charlie'
      }
    })
  ]) : []

  // Create showcase items with beautiful visuals
  console.log('🌟 Creating showcase items...')
  
  const showcases = projects.length >= 6 ? await Promise.all([
    prisma.showcase.create({
      data: {
        projectId: projects[0]!.id,
        title: 'Multi-Language Customer Support Platform',
        description: 'Built for a global SaaS company, this AI-powered support system handles inquiries in 15+ languages with context-aware responses and sentiment analysis.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop',
        tags: ['ai', 'chatbot', 'support', 'multilingual'],
        authorId: alice.id,
        featured: true
      }
    }),
    
    prisma.showcase.create({
      data: {
        projectId: projects[1]!.id,
        title: 'Real-time Sales Analytics Dashboard',
        description: 'Enterprise analytics solution processing millions of transactions daily with ML-powered forecasting and anomaly detection.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop',
        tags: ['analytics', 'dashboard', 'realtime', 'ml'],
        authorId: bob.id,
        featured: false
      }
    }),
    
    prisma.showcase.create({
      data: {
        projectId: projects[2]!.id,
        title: 'AI Content Creation Suite',
        description: 'Comprehensive content generation platform that creates blog posts, social media content, and email campaigns with built-in SEO optimization.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=800&fit=crop',
        tags: ['content', 'ai', 'seo', 'marketing'],
        authorId: charlie.id,
        featured: false
      }
    }),
    
    prisma.showcase.create({
      data: {
        projectId: projects[3]?.id || projects[0]!.id,
        title: 'AI-Powered Image Generation Studio',
        description: 'Professional image creation tool combining DALL-E 3, Stable Diffusion, and Midjourney for stunning visual content.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&h=800&fit=crop',
        tags: ['image', 'ai', 'creative', 'design'],
        authorId: alice.id,
        featured: true
      }
    }),
    
    prisma.showcase.create({
      data: {
        projectId: projects[4]?.id || projects[1]!.id,
        title: 'Intelligent Code Review System',
        description: 'Automated code review platform that catches bugs, security vulnerabilities, and suggests performance improvements.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=800&fit=crop',
        tags: ['code-review', 'developer-tools', 'ai', 'security'],
        authorId: bob.id,
        featured: false
      }
    }),
    
    prisma.showcase.create({
      data: {
        projectId: projects[5]?.id || projects[2]!.id,
        title: 'Email Marketing Automation Platform',
        description: 'Smart email campaign manager with AI-powered personalization, A/B testing, and advanced analytics.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200&h=800&fit=crop',
        tags: ['email', 'marketing', 'automation', 'analytics'],
        authorId: charlie.id,
        featured: false
      }
    })
  ]) : []

  console.log(`✅ Created ${showcaseEntries.length} showcase entries`)
  console.log(`✅ Created ${showcases.length} showcase items`)
  
  console.log('\n🎉 Templates and showcase data created successfully!')
  console.log('📊 Summary:')
  console.log(`   ✓ ${templates.length} beautiful templates`)
  console.log(`   ✓ ${showcaseEntries.length} showcase entries`)
  console.log(`   ✓ ${showcases.length} showcase items with stats`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })