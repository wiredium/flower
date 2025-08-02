/**
 * Template-related type definitions
 */

import type { WorkflowData } from './workflow'

export interface Template {
  id: string
  name: string
  description: string
  category: TemplateCategory
  icon?: string | null
  tags: string[]
  workflowData: WorkflowData
  prefillData: any
  isOfficial: boolean
  isPublic: boolean
  usageCount: number
  authorId?: string | null
  createdAt: Date
  updatedAt: Date
}

export enum TemplateCategory {
  SAAS = 'SaaS',
  MOBILE = 'Mobile',
  WEB = 'Web',
  API = 'API',
  AUTOMATION = 'Automation',
  DATA = 'Data',
  AI_ML = 'AI/ML',
  DEVOPS = 'DevOps',
  OTHER = 'Other',
}

export interface CreateTemplateInput {
  name: string
  description: string
  category: TemplateCategory
  icon?: string
  tags?: string[]
  workflowData: WorkflowData
  prefillData?: any
  isPublic?: boolean
}

export interface UpdateTemplateInput {
  id: string
  name?: string
  description?: string
  category?: TemplateCategory
  icon?: string
  tags?: string[]
  workflowData?: WorkflowData
  prefillData?: any
  isPublic?: boolean
}

export interface TemplateSearchParams {
  query?: string
  category?: TemplateCategory
  tags?: string[]
  isOfficial?: boolean
  sortBy?: 'popular' | 'recent' | 'name'
  limit?: number
  offset?: number
}