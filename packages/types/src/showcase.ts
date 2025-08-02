/**
 * Showcase and community-related type definitions
 */

export interface ShowcaseEntry {
  id: string
  title: string
  description: string
  tags: string[]
  sanitizedWorkflow: any
  sanitizedInstructions?: string | null
  upvotes: number
  views: number
  projectId?: string | null
  authorName?: string | null
  status: ShowcaseStatus
  publishedAt: Date
}

export enum ShowcaseStatus {
  PUBLISHED = 'published',
  PENDING_REVIEW = 'pending_review',
  REJECTED = 'rejected',
}

export interface ShowcaseVote {
  id: string
  showcaseId: string
  userId: string
  value: 1 | -1
  createdAt: Date
}

export interface ShowcaseComment {
  id: string
  content: string
  showcaseId: string
  userId: string
  user?: {
    id: string
    name?: string | null
    avatarUrl?: string | null
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreateShowcaseInput {
  projectId: string
  title: string
  description: string
  tags?: string[]
  anonymous?: boolean
}

export interface ShowcaseSearchParams {
  query?: string
  tags?: string[]
  sortBy?: 'popular' | 'recent' | 'trending'
  limit?: number
  offset?: number
}

export interface ShowcaseWithRelations extends ShowcaseEntry {
  votes?: ShowcaseVote[]
  comments?: ShowcaseComment[]
  project?: {
    id: string
    name: string
    owner?: {
      id: string
      name?: string | null
    }
  }
}