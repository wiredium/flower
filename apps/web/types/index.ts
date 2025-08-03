import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// User types
export interface User {
  id: string
  email: string
  username: string
  name?: string
  avatar?: string
  bio?: string
  website?: string
  github?: string
  twitter?: string
  createdAt: Date
  updatedAt: Date
}

// Auth types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  username: string
  name?: string
}

// Project types
export interface Project {
  id: string
  name: string
  description?: string
  workflow: Workflow
  ownerId: string
  owner?: User
  visibility: 'public' | 'private'
  status: 'draft' | 'active' | 'archived'
  tags: string[]
  createdAt: Date
  updatedAt: Date
  collaborators?: ProjectCollaborator[]
  stats?: ProjectStats
}

export interface ProjectStats {
  views: number
  likes: number
  forks: number
  executions: number
}

export interface ProjectCollaborator {
  id: string
  userId: string
  projectId: string
  role: 'viewer' | 'editor' | 'admin'
  user?: User
  joinedAt: Date
}

// Workflow types
export interface Workflow {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  variables: WorkflowVariable[]
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowNode {
  id: string
  type: 'input' | 'output' | 'cerebras' | 'openai' | 'anthropic' | 'transform' | 'condition' | 'loop'
  position: { x: number; y: number }
  data: {
    label: string
    model?: string
    prompt?: string
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
    condition?: string
    transform?: string
    [key: string]: any
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  label?: string
  type?: 'default' | 'conditional'
  animated?: boolean
}

export interface WorkflowVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  defaultValue?: any
  required?: boolean
  description?: string
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  projectId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input: Record<string, any>
  output?: Record<string, any>
  error?: string
  startedAt: Date
  completedAt?: Date
  duration?: number
  cost?: number
  steps: ExecutionStep[]
}

export interface ExecutionStep {
  nodeId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input?: any
  output?: any
  error?: string
  startedAt?: Date
  completedAt?: Date
  duration?: number
  cost?: number
}

// Template types
export interface Template {
  id: string
  name: string
  description?: string
  category: string
  workflow: Workflow
  thumbnail?: string
  tags: string[]
  author?: User
  authorId: string
  usageCount: number
  rating?: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

// Showcase types
export interface ShowcaseItem {
  id: string
  projectId: string
  project?: Project
  title: string
  description: string
  thumbnail?: string
  demoUrl?: string
  githubUrl?: string
  tags: string[]
  likes: number
  forks: number
  views: number
  featured: boolean
  authorId: string
  author?: User
  createdAt: Date
  updatedAt: Date
}

// Notification types
export interface Notification {
  id: string
  userId: string
  type: 'info' | 'success' | 'warning' | 'error' | 'collaboration' | 'workflow' | 'showcase'
  title: string
  message: string
  read: boolean
  data?: Record<string, any>
  createdAt: Date
}

// AI types
export interface AIModel {
  id: string
  provider: 'cerebras' | 'openai' | 'anthropic'
  name: string
  description?: string
  contextLength: number
  costPer1kTokens: number
  capabilities: string[]
}

export interface AIGenerateInput {
  prompt: string
  model: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  stream?: boolean
}

export interface AIGenerateOutput {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost?: number
}

// Collaboration types
export interface CollaborationInvite {
  id: string
  projectId: string
  project?: Project
  inviterId: string
  inviter?: User
  inviteeEmail: string
  inviteeId?: string
  invitee?: User
  role: 'viewer' | 'editor' | 'admin'
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  message?: string
  expiresAt: Date
  createdAt: Date
}

// SSE Event types
export interface SSEEvent {
  type: 'project:update' | 'workflow:execution' | 'collaboration:invite' | 'notification:new'
  data: any
  timestamp: Date
}

// Form types
export interface FormError {
  field?: string
  message: string
}

// Router type placeholder (will be imported from backend)
export type AppRouter = any // This will be replaced with actual router type from backend

// Inferred types from tRPC router
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>