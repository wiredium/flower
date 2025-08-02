/**
 * Workflow and ReactFlow-related type definitions
 */

export interface WorkflowNode {
  id: string
  type: NodeType
  position: {
    x: number
    y: number
  }
  data: NodeData
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type?: EdgeType
  data?: EdgeData
}

export interface WorkflowData {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  viewport?: {
    x: number
    y: number
    zoom: number
  }
}

export type NodeType = 
  | 'start'
  | 'end'
  | 'task'
  | 'decision'
  | 'integration'
  | 'ai'
  | 'loop'
  | 'parallel'
  | 'custom'

export enum EdgeType {
  DEFAULT = 'default',
  CONDITIONAL = 'conditional',
  PARALLEL = 'parallel',
}

export interface NodeData {
  label: string
  description?: string
  type?: string
  config?: any
  inputs?: Record<string, any>
  outputs?: Record<string, any>
  status?: NodeExecutionStatus
  error?: string
}

export interface EdgeData {
  condition?: string
  label?: string
  priority?: number
}

export enum NodeExecutionStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export interface WorkflowExecutionContext {
  projectId: string
  userId: string
  variables: Record<string, any>
  results: Record<string, any>
  currentNodeId?: string
  executionPath: string[]
}