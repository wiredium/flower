import { TRPCError } from '@trpc/server'
import { prisma } from '@repo/database'
import type {
  WorkflowData,
  WorkflowNode,
  WorkflowEdge,
  WorkflowExecutionContext,
  NodeExecutionStatus,
  NodeType,
  NodeHandler,
  WorkflowEvent,
  WorkflowEventType,
} from '@repo/types'
import { OpenRouterService } from './openrouter.service.js'
import { realtimeService } from './realtime.service.js'
import { notificationService } from './notification.service.js'
import { EventEmitter } from 'events'

export class WorkflowService extends EventEmitter {
  private nodeHandlers: Map<NodeType, NodeHandler>
  private openRouterService: OpenRouterService

  constructor() {
    super()
    this.openRouterService = new OpenRouterService()
    this.nodeHandlers = new Map()
    this.registerNodeHandlers()
  }

  /**
   * Register all node type handlers
   */
  private registerNodeHandlers() {
    // Start node handler
    this.nodeHandlers.set('start', {
      execute: async (node, context) => {
        this.emit('nodeStart', { nodeId: node.id, context })
        return { started: true, timestamp: new Date() }
      },
    })

    // End node handler
    this.nodeHandlers.set('end', {
      execute: async (node, context) => {
        this.emit('nodeComplete', { nodeId: node.id, context })
        return { completed: true, timestamp: new Date() }
      },
    })

    // Task node handler
    this.nodeHandlers.set('task', {
      execute: async (node, context) => {
        this.emit('nodeStart', { nodeId: node.id, context })
        
        // Simulate task execution
        const result = await this.executeTask(node, context)
        
        this.emit('nodeComplete', { nodeId: node.id, result, context })
        return result
      },
      validate: (node) => {
        return !!node.data.label && !!node.data.config
      },
    })

    // Decision node handler
    this.nodeHandlers.set('decision', {
      execute: async (node, context) => {
        this.emit('nodeStart', { nodeId: node.id, context })
        
        const condition = node.data.config?.condition
        if (!condition) {
          throw new Error(`Decision node ${node.id} missing condition`)
        }

        const result = await this.evaluateCondition(condition, context)
        
        this.emit('nodeComplete', { nodeId: node.id, result, context })
        return result
      },
      validate: (node) => {
        return !!node.data.config?.condition
      },
    })

    // AI node handler
    this.nodeHandlers.set('ai', {
      execute: async (node, context) => {
        this.emit('nodeStart', { nodeId: node.id, context })
        
        const prompt = node.data.config?.prompt || node.data.description
        if (!prompt) {
          throw new Error(`AI node ${node.id} missing prompt`)
        }

        const result = await this.executeAITask(prompt, node, context)
        
        this.emit('nodeComplete', { nodeId: node.id, result, context })
        return result
      },
      validate: (node) => {
        return !!node.data.config?.prompt || !!node.data.description
      },
    })

    // Loop node handler
    this.nodeHandlers.set('loop', {
      execute: async (node, context) => {
        this.emit('nodeStart', { nodeId: node.id, context })
        
        const iterations = node.data.config?.iterations || 1
        const results = []

        for (let i = 0; i < iterations; i++) {
          const iterationContext = {
            ...context,
            variables: { ...context.variables, loopIndex: i },
          }
          const result = await this.executeTask(node, iterationContext)
          results.push(result)
        }
        
        this.emit('nodeComplete', { nodeId: node.id, results, context })
        return results
      },
      validate: (node) => {
        return typeof node.data.config?.iterations === 'number'
      },
    })

    // Parallel node handler
    this.nodeHandlers.set('parallel', {
      execute: async (node, context) => {
        this.emit('nodeStart', { nodeId: node.id, context })
        
        const tasks = node.data.config?.tasks || []
        const results = await Promise.all(
          tasks.map((task: any) => this.executeTask({ ...node, data: { ...node.data, config: task } }, context))
        )
        
        this.emit('nodeComplete', { nodeId: node.id, results, context })
        return results
      },
      validate: (node) => {
        return Array.isArray(node.data.config?.tasks)
      },
    })

    // Integration node handler
    this.nodeHandlers.set('integration', {
      execute: async (node, context) => {
        this.emit('nodeStart', { nodeId: node.id, context })
        
        const integrationType = node.data.config?.type
        const result = await this.executeIntegration(integrationType, node, context)
        
        this.emit('nodeComplete', { nodeId: node.id, result, context })
        return result
      },
      validate: (node) => {
        return !!node.data.config?.type
      },
    })

    // Custom node handler
    this.nodeHandlers.set('custom', {
      execute: async (node, context) => {
        this.emit('nodeStart', { nodeId: node.id, context })
        
        const customCode = node.data.config?.code
        if (!customCode) {
          throw new Error(`Custom node ${node.id} missing code`)
        }

        const result = await this.executeCustomCode(customCode, context)
        
        this.emit('nodeComplete', { nodeId: node.id, result, context })
        return result
      },
      validate: (node) => {
        return !!node.data.config?.code
      },
    })
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowData: WorkflowData,
    context: WorkflowExecutionContext
  ): Promise<any> {
    // Validate workflow
    this.validateWorkflow(workflowData)

    // Create execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        projectId: context.projectId,
        status: 'RUNNING',
        startedAt: new Date(),
        logs: [],
      },
    })

    try {
      // Find start node
      const startNode = workflowData.nodes.find(node => node.type === 'start')
      if (!startNode) {
        throw new Error('Workflow missing start node')
      }

      // Execute workflow from start node
      const result = await this.executeNode(startNode, workflowData, context)

      // Update execution record
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          results: result,
        },
      })

      return result
    } catch (error) {
      // Update execution record with error
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: WorkflowNode,
    workflowData: WorkflowData,
    context: WorkflowExecutionContext
  ): Promise<any> {
    // Get handler for node type
    const handler = this.nodeHandlers.get(node.type)
    if (!handler) {
      throw new Error(`No handler for node type: ${node.type}`)
    }

    // Validate node if validator exists
    if (handler.validate && !handler.validate(node)) {
      throw new Error(`Invalid configuration for node ${node.id}`)
    }

    // Update context with current node
    const updatedContext = {
      ...context,
      currentNodeId: node.id,
      executionPath: [...context.executionPath, node.id],
    }

    // Execute node
    const result = await handler.execute(node, updatedContext)

    // Store result in context
    updatedContext.results[node.id] = result

    // If this is an end node, return accumulated results
    if (node.type === 'end') {
      return updatedContext.results
    }

    // Find next nodes
    const outgoingEdges = workflowData.edges.filter(edge => edge.source === node.id)
    
    // If decision node, choose path based on result
    if (node.type === 'decision') {
      const selectedEdge = outgoingEdges.find(edge => 
        edge.data?.condition === result || edge.data?.label === result
      )
      
      if (selectedEdge) {
        const nextNode = workflowData.nodes.find(n => n.id === selectedEdge.target)
        if (nextNode) {
          return this.executeNode(nextNode, workflowData, updatedContext)
        }
      }
      
      throw new Error(`No matching path for decision result: ${result}`)
    }

    // For parallel execution
    if (node.type === 'parallel' && outgoingEdges.length > 1) {
      const parallelResults = await Promise.all(
        outgoingEdges.map(async edge => {
          const nextNode = workflowData.nodes.find(n => n.id === edge.target)
          if (nextNode) {
            return this.executeNode(nextNode, workflowData, updatedContext)
          }
          return null
        })
      )
      return parallelResults.filter(r => r !== null)
    }

    // Execute next node(s) sequentially
    for (const edge of outgoingEdges) {
      const nextNode = workflowData.nodes.find(n => n.id === edge.target)
      if (nextNode) {
        return this.executeNode(nextNode, workflowData, updatedContext)
      }
    }

    return result
  }

  /**
   * Validate workflow structure
   */
  private validateWorkflow(workflowData: WorkflowData) {
    // Check for start node
    const startNodes = workflowData.nodes.filter(n => n.type === 'start')
    if (startNodes.length === 0) {
      throw new Error('Workflow must have at least one start node')
    }
    if (startNodes.length > 1) {
      throw new Error('Workflow can only have one start node')
    }

    // Check for end node
    const endNodes = workflowData.nodes.filter(n => n.type === 'end')
    if (endNodes.length === 0) {
      throw new Error('Workflow must have at least one end node')
    }

    // Validate all nodes have required data
    for (const node of workflowData.nodes) {
      if (!node.id || !node.type || !node.data) {
        throw new Error(`Invalid node configuration: ${JSON.stringify(node)}`)
      }
    }

    // Validate edges
    for (const edge of workflowData.edges) {
      if (!edge.source || !edge.target) {
        throw new Error(`Invalid edge configuration: ${JSON.stringify(edge)}`)
      }

      // Check that source and target nodes exist
      const sourceExists = workflowData.nodes.some(n => n.id === edge.source)
      const targetExists = workflowData.nodes.some(n => n.id === edge.target)
      
      if (!sourceExists || !targetExists) {
        throw new Error(`Edge references non-existent node: ${JSON.stringify(edge)}`)
      }
    }

    // Check for cycles (simple detection)
    this.detectCycles(workflowData)
  }

  /**
   * Detect cycles in workflow
   */
  private detectCycles(workflowData: WorkflowData) {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)

      const outgoingEdges = workflowData.edges.filter(e => e.source === nodeId)
      
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          if (hasCycle(edge.target)) {
            return true
          }
        } else if (recursionStack.has(edge.target)) {
          return true
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    const startNode = workflowData.nodes.find(n => n.type === 'start')
    if (startNode && hasCycle(startNode.id)) {
      throw new Error('Workflow contains a cycle')
    }
  }

  /**
   * Execute a task node
   */
  private async executeTask(node: WorkflowNode, context: WorkflowExecutionContext): Promise<any> {
    // Simulate task execution based on config
    const taskType = node.data.config?.type || 'default'
    const taskData = node.data.config?.data || {}

    // Log task execution
    this.emit('taskExecute', { nodeId: node.id, taskType, taskData, context })

    // Simulate async task
    await new Promise(resolve => setTimeout(resolve, 100))

    return {
      taskType,
      result: 'success',
      data: taskData,
      timestamp: new Date(),
    }
  }

  /**
   * Execute an AI task
   */
  private async executeAITask(
    prompt: string,
    node: WorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<any> {
    const taskType = node.data.config?.taskType || 'simple-tasks'
    
    try {
      const response = await this.openRouterService.generate(
        taskType,
        prompt,
        {
          temperature: node.data.config?.temperature || 0.7,
          maxTokens: node.data.config?.maxTokens || 1000,
          userId: context.userId,
          projectId: context.projectId,
        }
      )

      return {
        success: true,
        response,
        timestamp: new Date(),
      }
    } catch (error) {
      this.emit('aiError', { nodeId: node.id, error, context })
      throw error
    }
  }

  /**
   * Evaluate a condition
   */
  private async evaluateCondition(
    condition: string,
    context: WorkflowExecutionContext
  ): Promise<boolean | string> {
    // Simple condition evaluation
    // In production, use a safe expression evaluator
    try {
      // Check for simple comparisons
      if (condition.includes('>')) {
        const [left, right] = condition.split('>').map(s => s.trim())
        if (!left || !right) return false
        const leftValue = this.resolveVariable(left, context)
        const rightValue = this.resolveVariable(right, context)
        return Number(leftValue) > Number(rightValue)
      }

      if (condition.includes('<')) {
        const [left, right] = condition.split('<').map(s => s.trim())
        if (!left || !right) return false
        const leftValue = this.resolveVariable(left, context)
        const rightValue = this.resolveVariable(right, context)
        return Number(leftValue) < Number(rightValue)
      }

      if (condition.includes('===')) {
        const [left, right] = condition.split('===').map(s => s.trim())
        if (!left || !right) return false
        const leftValue = this.resolveVariable(left, context)
        const rightValue = this.resolveVariable(right, context)
        return leftValue === rightValue
      }

      // Return condition as-is for path selection
      return condition
    } catch (error) {
      this.emit('conditionError', { condition, error, context })
      return false
    }
  }

  /**
   * Resolve a variable from context
   */
  private resolveVariable(name: string, context: WorkflowExecutionContext): any {
    // Remove quotes if present
    const cleanName = name.replace(/['"]/g, '')
    
    // Check if it's a number
    if (!isNaN(Number(cleanName))) {
      return Number(cleanName)
    }

    // Check context variables
    if (cleanName.startsWith('$')) {
      const varName = cleanName.substring(1)
      return context.variables[varName]
    }

    // Check results
    if (cleanName.startsWith('@')) {
      const resultPath = cleanName.substring(1)
      const [nodeId, ...path] = resultPath.split('.')
      if (!nodeId) return undefined
      
      let value = context.results[nodeId]
      
      for (const key of path) {
        value = value?.[key]
      }
      
      return value
    }

    // Return as string literal
    return cleanName
  }

  /**
   * Execute an integration
   */
  private async executeIntegration(
    type: string,
    node: WorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<any> {
    // Integration implementations would go here
    // For now, simulate integration execution
    this.emit('integrationExecute', { nodeId: node.id, type, context })

    switch (type) {
      case 'github':
        return { type: 'github', status: 'connected', timestamp: new Date() }
      case 'jira':
        return { type: 'jira', status: 'connected', timestamp: new Date() }
      case 'trello':
        return { type: 'trello', status: 'connected', timestamp: new Date() }
      case 'slack':
        return { type: 'slack', status: 'connected', timestamp: new Date() }
      default:
        throw new Error(`Unknown integration type: ${type}`)
    }
  }

  /**
   * Execute custom code (sandboxed)
   */
  private async executeCustomCode(
    code: string,
    context: WorkflowExecutionContext
  ): Promise<any> {
    // In production, use a proper sandboxed environment (VM2, isolated-vm, etc.)
    // For now, just return a placeholder
    this.emit('customCodeExecute', { code, context })

    return {
      type: 'custom',
      message: 'Custom code execution not yet implemented',
      timestamp: new Date(),
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string) {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!execution) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Execution not found',
      })
    }

    return execution
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string) {
    const execution = await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    })

    this.emit('executionCancelled', { executionId })

    return execution
  }
}

export const workflowService = new WorkflowService()