import { aiOrchestrator } from './ai-orchestrator.service.js'
import type { AITaskType } from '@repo/types'

interface ChainStep {
  id: string
  type: 'generate' | 'transform' | 'validate' | 'refine'
  taskType: AITaskType | string
  promptTemplate: string
  variables?: Record<string, any>
  dependsOn?: string[]
  retryOnFailure?: boolean
  maxRetries?: number
}

interface ChainContext {
  userId?: string
  projectId?: string
  variables: Record<string, any>
  results: Record<string, any>
  errors: Array<{ step: string; error: string }>
}

interface ChainResult {
  success: boolean
  finalOutput: string
  stepResults: Record<string, any>
  totalCost: number
  totalLatency: number
  errors?: Array<{ step: string; error: string }>
}

export class PromptEngineeringService {
  // Prompt templates for different tasks
  private promptTemplates = {
    // Code generation templates
    'code-function': `Generate a {{language}} function that {{description}}.
Requirements:
{{requirements}}

Function signature: {{signature}}

Include proper error handling and comments.`,

    'code-class': `Create a {{language}} class for {{purpose}}.
Properties: {{properties}}
Methods: {{methods}}
Follow SOLID principles and include documentation.`,

    'code-refactor': `Refactor the following code to improve {{aspect}}:
\`\`\`{{language}}
{{code}}
\`\`\`
Focus on: {{focus}}`,

    // Documentation templates
    'doc-api': `Generate API documentation for:
{{apiDescription}}

Include:
- Endpoint descriptions
- Request/response examples
- Error codes
- Authentication requirements`,

    'doc-readme': `Create a comprehensive README for {{projectName}}.
Description: {{description}}
Features: {{features}}
Tech stack: {{techStack}}

Include installation, usage, and contribution guidelines.`,

    // Analysis templates
    'analyze-code': `Analyze the following code for {{aspect}}:
\`\`\`{{language}}
{{code}}
\`\`\`

Provide:
1. Current issues
2. Improvement suggestions
3. Best practices violations
4. Security concerns`,

    'analyze-performance': `Analyze performance bottlenecks in:
{{description}}

Consider:
- Time complexity
- Space complexity
- Database queries
- Network calls
Output specific optimization recommendations.`,

    // Creative templates
    'creative-name': `Generate {{count}} creative names for {{type}} that {{description}}.
Style: {{style}}
Keywords: {{keywords}}`,

    'creative-description': `Write a compelling {{type}} for {{subject}}.
Tone: {{tone}}
Length: {{length}} words
Key points: {{keyPoints}}`,
  }

  // Pre-defined generation chains
  private chains: Record<string, ChainStep[]> = {
    'full-feature': [
      {
        id: 'requirements',
        type: 'generate' as const,
        taskType: 'analysis',
        promptTemplate: 'Analyze the feature request and create detailed technical requirements: {{feature}}',
      },
      {
        id: 'architecture',
        type: 'generate' as const,
        taskType: 'analysis',
        promptTemplate: 'Design the architecture for: {{requirements}}',
        dependsOn: ['requirements'],
      },
      {
        id: 'implementation',
        type: 'generate' as const,
        taskType: 'code-generation',
        promptTemplate: 'Implement the feature based on architecture: {{architecture}}',
        dependsOn: ['architecture'],
      },
      {
        id: 'tests',
        type: 'generate' as const,
        taskType: 'code-generation',
        promptTemplate: 'Generate comprehensive tests for: {{implementation}}',
        dependsOn: ['implementation'],
      },
      {
        id: 'documentation',
        type: 'generate' as const,
        taskType: 'documentation',
        promptTemplate: 'Document the implemented feature: {{implementation}}',
        dependsOn: ['implementation'],
      },
    ],

    'code-review': [
      {
        id: 'analysis',
        type: 'generate' as const,
        taskType: 'analysis',
        promptTemplate: 'Perform initial code analysis: {{code}}',
      },
      {
        id: 'security',
        type: 'generate' as const,
        taskType: 'analysis',
        promptTemplate: 'Security audit for: {{code}}',
      },
      {
        id: 'performance',
        type: 'generate' as const,
        taskType: 'analysis',
        promptTemplate: 'Performance analysis: {{code}}',
      },
      {
        id: 'suggestions',
        type: 'generate' as const,
        taskType: 'analysis',
        promptTemplate: 'Consolidate findings and provide improvement suggestions based on: {{analysis}}, {{security}}, {{performance}}',
        dependsOn: ['analysis', 'security', 'performance'],
      },
    ],

    'api-design': [
      {
        id: 'endpoints',
        type: 'generate' as const,
        taskType: 'analysis',
        promptTemplate: 'Design REST API endpoints for: {{requirements}}',
      },
      {
        id: 'schemas',
        type: 'generate' as const,
        taskType: 'code-generation',
        promptTemplate: 'Generate request/response schemas: {{endpoints}}',
        dependsOn: ['endpoints'],
      },
      {
        id: 'implementation',
        type: 'generate' as const,
        taskType: 'code-generation',
        promptTemplate: 'Implement API handlers: {{endpoints}} with schemas: {{schemas}}',
        dependsOn: ['endpoints', 'schemas'],
      },
      {
        id: 'documentation',
        type: 'generate' as const,
        taskType: 'documentation',
        promptTemplate: 'Generate OpenAPI documentation: {{endpoints}} {{schemas}}',
        dependsOn: ['endpoints', 'schemas'],
      },
    ],
  }

  /**
   * Generate content using a template
   */
  async generateFromTemplate(
    templateName: string,
    variables: Record<string, any>,
    options?: {
      userId?: string
      projectId?: string
      quality?: 'low' | 'medium' | 'high'
    }
  ): Promise<any> {
    const template = this.promptTemplates[templateName as keyof typeof this.promptTemplates]
    
    if (!template) {
      throw new Error(`Template ${templateName} not found`)
    }

    // Replace variables in template
    const prompt = this.replaceVariables(template, variables)

    // Determine task type from template name
    const taskType = this.getTaskTypeFromTemplate(templateName)

    // Execute generation
    const result = await aiOrchestrator.routeTask({
      type: taskType,
      prompt,
      quality: options?.quality,
      userId: options?.userId,
      projectId: options?.projectId,
    })

    return result
  }

  /**
   * Execute a multi-step generation chain
   */
  async executeChain(
    chainName: string,
    initialVariables: Record<string, any>,
    options?: {
      userId?: string
      projectId?: string
      quality?: 'low' | 'medium' | 'high'
    }
  ): Promise<ChainResult> {
    const chain = this.chains[chainName as keyof typeof this.chains]
    
    if (!chain) {
      throw new Error(`Chain ${chainName} not found`)
    }

    const context: ChainContext = {
      userId: options?.userId,
      projectId: options?.projectId,
      variables: initialVariables,
      results: {},
      errors: [],
    }

    let totalCost = 0
    let totalLatency = 0
    let finalOutput = ''

    // Execute chain steps
    for (const step of chain) {
      try {
        // Check dependencies
        if (step.dependsOn) {
          for (const dep of step.dependsOn) {
            if (!context.results[dep]) {
              throw new Error(`Dependency ${dep} not satisfied`)
            }
          }
        }

        // Prepare prompt with variables and previous results
        const stepVariables = {
          ...context.variables,
          ...context.results,
          ...step.variables,
        }

        const prompt = this.replaceVariables(step.promptTemplate, stepVariables)

        // Execute step
        const result = await this.executeChainStep(step, prompt, context)

        // Store result
        context.results[step.id] = result.response
        totalCost += result.cost
        totalLatency += result.latency

        // Set final output
        const lastStep = chain[chain.length - 1]
        if (lastStep && step.id === lastStep.id) {
          finalOutput = result.response
        }
      } catch (error) {
        context.errors.push({
          step: step.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        // Retry if configured
        if (step.retryOnFailure && (step.maxRetries || 1) > 0) {
          // Implement retry logic
          continue
        }

        // Fail the chain if step is critical
        if (!step.dependsOn || step.dependsOn.length === 0) {
          return {
            success: false,
            finalOutput: '',
            stepResults: context.results,
            totalCost,
            totalLatency,
            errors: context.errors,
          }
        }
      }
    }

    return {
      success: context.errors.length === 0,
      finalOutput,
      stepResults: context.results,
      totalCost,
      totalLatency,
      errors: context.errors.length > 0 ? context.errors : undefined,
    }
  }

  /**
   * Execute a single chain step
   */
  private async executeChainStep(
    step: ChainStep,
    prompt: string,
    context: ChainContext
  ) {
    return aiOrchestrator.routeTask({
      type: step.taskType,
      prompt,
      userId: context.userId,
      projectId: context.projectId,
    })
  }

  /**
   * Replace variables in a template string
   */
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(value))
    }
    
    return result
  }

  /**
   * Determine task type from template name
   */
  private getTaskTypeFromTemplate(templateName: string): AITaskType | string {
    if (templateName.startsWith('code-')) return 'code-generation'
    if (templateName.startsWith('doc-')) return 'documentation'
    if (templateName.startsWith('analyze-')) return 'analysis'
    if (templateName.startsWith('creative-')) return 'creative'
    return 'simple-tasks'
  }

  /**
   * Create a custom chain
   */
  createCustomChain(steps: ChainStep[]): string {
    const chainId = `custom-${Date.now()}`
    this.chains[chainId as keyof typeof this.chains] = steps as any
    return chainId
  }

  /**
   * Optimize prompt for better results
   */
  optimizePrompt(prompt: string, taskType: string): string {
    const optimizations: Record<string, string[]> = {
      'code-generation': [
        'Include error handling',
        'Add appropriate comments',
        'Follow best practices',
        'Use TypeScript types',
      ],
      'documentation': [
        'Be clear and concise',
        'Include examples',
        'Use proper formatting',
        'Add table of contents for long docs',
      ],
      'analysis': [
        'Be thorough and systematic',
        'Provide specific examples',
        'Include metrics where applicable',
        'Suggest actionable improvements',
      ],
    }

    const additions = optimizations[taskType] || []
    
    if (additions.length > 0) {
      return `${prompt}\n\nAdditional requirements:\n${additions.map(a => `- ${a}`).join('\n')}`
    }

    return prompt
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return Object.keys(this.promptTemplates).map(key => {
      const template = this.promptTemplates[key as keyof typeof this.promptTemplates]
      const category = key.split('-')[0]
      return {
        name: key,
        category: category || 'general',
        variables: this.extractVariables(template),
      }
    })
  }

  /**
   * Get available chains
   */
  getAvailableChains() {
    return Object.keys(this.chains).map(key => {
      const chain = this.chains[key]
      return {
        name: key,
        steps: chain ? chain.length : 0,
        description: this.getChainDescription(key),
      }
    })
  }

  /**
   * Extract variables from a template
   */
  private extractVariables(template: string | undefined): string[] {
    if (!template) return []
    const regex = /{{(\w+)}}/g
    const variables: string[] = []
    let match
    
    while ((match = regex.exec(template)) !== null) {
      const varName = match[1]
      if (varName && !variables.includes(varName)) {
        variables.push(varName)
      }
    }
    
    return variables
  }

  /**
   * Get chain description
   */
  private getChainDescription(chainName: string | undefined): string {
    if (!chainName) return 'Custom chain'
    const descriptions: Record<string, string> = {
      'full-feature': 'Complete feature implementation from requirements to documentation',
      'code-review': 'Comprehensive code review with security and performance analysis',
      'api-design': 'Design and implement REST API with documentation',
    }
    
    return descriptions[chainName] || 'Custom chain'
  }
}

export const promptEngineeringService = new PromptEngineeringService()