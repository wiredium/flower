/**
 * tRPC input/output type schemas and validation
 */

import { z } from 'zod'
import { 
  ProjectStatus, 
  Visibility, 
  WorkflowExecutionStatus,
  AITaskType,
  TemplateCategory,
  ShowcaseStatus,
  NodeType,
  EdgeType,
  NodeExecutionStatus,
} from './index'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
})

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  templateId: z.string().optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  tags: z.array(z.string()).optional(),
})

export const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  tags: z.array(z.string()).optional(),
  workflowData: z.any().optional(),
})

export const addCollaboratorSchema = z.object({
  projectId: z.string(),
  email: z.string().email(),
  role: z.enum(['editor', 'viewer']),
})

// AI schemas
export const generateSchema = z.object({
  taskType: z.nativeEnum(AITaskType),
  prompt: z.string().min(1).max(10000),
  context: z.any().optional(),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).max(4000).optional(),
      topP: z.number().min(0).max(1).optional(),
      stream: z.boolean().optional(),
      projectId: z.string().optional(),
    })
    .optional(),
})

export const estimateCostSchema = z.object({
  taskType: z.nativeEnum(AITaskType),
  prompt: z.string().min(1).max(10000),
  maxTokens: z.number().min(1).max(4000).optional(),
})

export const rateGenerationSchema = z.object({
  generationId: z.string(),
  quality: z.number().min(1).max(5),
})

export const generateWorkflowSchema = z.object({
  projectId: z.string(),
  description: z.string().min(10).max(5000),
  complexity: z.enum(['simple', 'moderate', 'complex']).default('moderate'),
})

// Workflow schemas
export const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(NodeType),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    label: z.string(),
    description: z.string().optional(),
    type: z.string().optional(),
    config: z.any().optional(),
    inputs: z.record(z.any()).optional(),
    outputs: z.record(z.any()).optional(),
    status: z.nativeEnum(NodeExecutionStatus).optional(),
    error: z.string().optional(),
  }),
})

export const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.nativeEnum(EdgeType).optional(),
  data: z
    .object({
      condition: z.string().optional(),
      label: z.string().optional(),
      priority: z.number().optional(),
    })
    .optional(),
})

export const workflowDataSchema = z.object({
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
  viewport: z
    .object({
      x: z.number(),
      y: z.number(),
      zoom: z.number(),
    })
    .optional(),
})

// Template schemas
export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  category: z.nativeEnum(TemplateCategory),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  workflowData: workflowDataSchema,
  prefillData: z.any().optional(),
  isPublic: z.boolean().optional(),
})

export const updateTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.nativeEnum(TemplateCategory).optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  workflowData: workflowDataSchema.optional(),
  prefillData: z.any().optional(),
  isPublic: z.boolean().optional(),
})

export const templateSearchSchema = z.object({
  query: z.string().optional(),
  category: z.nativeEnum(TemplateCategory).optional(),
  tags: z.array(z.string()).optional(),
  isOfficial: z.boolean().optional(),
  sortBy: z.enum(['popular', 'recent', 'name']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

// Showcase schemas
export const createShowcaseSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  tags: z.array(z.string()).optional(),
  anonymous: z.boolean().optional(),
})

export const showcaseSearchSchema = z.object({
  query: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['popular', 'recent', 'trending']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export const voteShowcaseSchema = z.object({
  showcaseId: z.string(),
  value: z.literal(1).or(z.literal(-1)),
})

export const commentShowcaseSchema = z.object({
  showcaseId: z.string(),
  content: z.string().min(1).max(1000),
})

// Workflow execution schemas
export const executeWorkflowSchema = z.object({
  projectId: z.string(),
  variables: z.record(z.any()).optional(),
})

export const cancelExecutionSchema = z.object({
  executionId: z.string(),
})

// Pagination schemas
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

// Export type inference helpers
export type GenerateInput = z.infer<typeof generateSchema>
export type EstimateCostInput = z.infer<typeof estimateCostSchema>
export type RateGenerationInput = z.infer<typeof rateGenerationSchema>
export type GenerateWorkflowInput = z.infer<typeof generateWorkflowSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type VoteShowcaseInput = z.infer<typeof voteShowcaseSchema>
export type CommentShowcaseInput = z.infer<typeof commentShowcaseSchema>
export type ExecuteWorkflowInput = z.infer<typeof executeWorkflowSchema>
export type CancelExecutionInput = z.infer<typeof cancelExecutionSchema>