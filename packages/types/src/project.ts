/**
 * Project-related type definitions
 */

export interface Project {
  id: string
  name: string
  description: string
  workflowData: any // ReactFlow data
  status: ProjectStatus
  visibility: Visibility
  tags: string[]
  ownerId: string
  templateId?: string | null
  createdAt: Date
  updatedAt: Date
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  UNLISTED = 'UNLISTED',
}

export interface ProjectCollaborator {
  id: string
  projectId: string
  userId: string
  role: CollaboratorRole
  addedAt: Date
}

export type CollaboratorRole = 'owner' | 'editor' | 'viewer'

export interface CreateProjectInput {
  name: string
  description: string
  templateId?: string
  visibility?: Visibility
  tags?: string[]
}

export interface UpdateProjectInput {
  id: string
  name?: string
  description?: string
  status?: ProjectStatus
  visibility?: Visibility
  tags?: string[]
  workflowData?: any
}

export interface ProjectWithRelations extends Project {
  owner?: any
  collaborators?: ProjectCollaborator[]
  template?: any
  executions?: WorkflowExecution[]
  aiGenerations?: AIGeneration[]
}

export interface WorkflowExecution {
  id: string
  projectId: string
  status: WorkflowExecutionStatus
  startedAt: Date
  completedAt?: Date | null
  logs: any[]
  results?: any | null
  error?: string | null
}

export enum WorkflowExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface AIGeneration {
  id: string
  userId: string
  projectId: string
  model: string
  provider: string
  prompt: string
  response: string
  inputTokens: number
  outputTokens: number
  cost: number
  latency: number
  taskType: string
  quality?: number | null
  metadata?: any | null
  createdAt: Date
}