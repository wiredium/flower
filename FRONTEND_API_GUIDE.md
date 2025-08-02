# Flower Platform - Frontend API Integration Guide

This comprehensive guide documents all available API endpoints for the Flower platform frontend integration. The backend uses tRPC with type-safe APIs running on `http://localhost:3001/trpc`.

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Project Management](#project-management)
4. [Workflow Execution](#workflow-execution)
5. [AI Generation](#ai-generation)
6. [Templates](#templates)
7. [Showcase](#showcase)
8. [Collaboration](#collaboration)
9. [Notifications](#notifications)
10. [Real-time Updates (SSE)](#real-time-updates-sse)
11. [Marketplace](#marketplace-coming-soon)
12. [Analytics](#analytics-coming-soon)
13. [Scheduling](#scheduling-coming-soon)

## Base Configuration

### API Endpoint
```
Base URL: http://localhost:3001
tRPC Endpoint: http://localhost:3001/trpc
SSE Endpoint: http://localhost:3001/api/sse/events
```

### Authentication Headers
```typescript
{
  "Authorization": "Bearer <access_token>"
}
```

## 1. Authentication

### Register
```typescript
trpc.auth.register.mutate({
  email: string,
  password: string,
  name?: string
})
// Returns: { user, accessToken, refreshToken }
```

### Login
```typescript
trpc.auth.login.mutate({
  email: string,
  password: string
})
// Returns: { user, accessToken, refreshToken }
```

### Refresh Token
```typescript
trpc.auth.refreshToken.mutate({
  refreshToken: string
})
// Returns: { user, accessToken, refreshToken }
```

### Logout
```typescript
trpc.auth.logout.mutate()
// Returns: { success: boolean }
```

### Get Current User
```typescript
trpc.auth.me.query()
// Returns: User object
```

### Change Password
```typescript
trpc.auth.changePassword.mutate({
  currentPassword: string,
  newPassword: string
})
// Returns: { success: boolean }
```

## 2. User Management

### List Users
```typescript
trpc.user.list.query({
  limit?: number,  // default: 10
  offset?: number, // default: 0
  search?: string
})
// Returns: { users: User[], total: number }
```

### Get User by ID
```typescript
trpc.user.getById.query({ id: string })
// Returns: User object
```

### Update User
```typescript
trpc.user.update.mutate({
  id: string,
  name?: string,
  email?: string
})
// Returns: Updated User object
```

### Delete User
```typescript
trpc.user.delete.mutate({ id: string })
// Returns: { success: boolean }
```

## 3. Project Management

### Create Project
```typescript
trpc.project.create.mutate({
  name: string,
  description: string,
  templateId?: string,
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED',
  tags?: string[]
})
// Returns: Project object
```

### List Projects
```typescript
trpc.project.list.query({
  limit?: number,        // default: 10
  offset?: number,       // default: 0
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'ALL',
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED' | 'ALL',
  search?: string,
  tags?: string[]
})
// Returns: { projects: Project[], total: number, hasMore: boolean }
```

### Get Project
```typescript
trpc.project.get.query({ id: string })
// Returns: Project with full details
```

### Update Project
```typescript
trpc.project.update.mutate({
  id: string,
  name?: string,
  description?: string,
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED',
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED',
  tags?: string[],
  workflowData?: any  // ReactFlow nodes and edges
})
// Returns: Updated Project object
```

### Delete Project
```typescript
trpc.project.delete.mutate({ id: string })
// Returns: { success: boolean }
```

### Update Workflow
```typescript
trpc.project.updateWorkflow.mutate({
  projectId: string,
  workflowData: {
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    viewport?: { x: number, y: number, zoom: number }
  }
})
// Returns: { success: boolean, project: Project }
```

### Clone Project
```typescript
trpc.project.clone.mutate({
  projectId: string,
  name?: string
})
// Returns: New Project object
```

### Get Project Statistics
```typescript
trpc.project.getStats.query({ projectId: string })
// Returns: {
//   totalExecutions: number,
//   successfulExecutions: number,
//   failedExecutions: number,
//   totalAIGenerations: number,
//   totalCost: number,
//   collaboratorCount: number
// }
```

## 4. Workflow Execution

### Execute Workflow
```typescript
trpc.workflow.execute.mutate({
  projectId: string,
  variables?: Record<string, any>
})
// Returns: {
//   executionId: string,
//   status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED',
//   results?: any
// }
```

### Get Execution Status
```typescript
trpc.workflow.getExecutionStatus.query({
  executionId: string
})
// Returns: WorkflowExecution object
```

### List Executions
```typescript
trpc.workflow.listExecutions.query({
  projectId: string,
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'ALL',
  limit?: number,
  offset?: number
})
// Returns: { executions: WorkflowExecution[], total: number }
```

### Cancel Execution
```typescript
trpc.workflow.cancelExecution.mutate({
  executionId: string
})
// Returns: { success: boolean }
```

### Get Execution Logs
```typescript
trpc.workflow.getExecutionLogs.query({
  executionId: string
})
// Returns: { logs: LogEntry[] }
```

### Validate Workflow
```typescript
trpc.workflow.validate.mutate({
  workflowData: {
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  }
})
// Returns: {
//   valid: boolean,
//   errors?: string[],
//   warnings?: string[]
// }
```

### Get Workflow Statistics
```typescript
trpc.workflow.getStatistics.query({
  projectId: string
})
// Returns: {
//   totalExecutions: number,
//   successfulExecutions: number,
//   failedExecutions: number,
//   successRate: number,
//   averageDuration: number
// }
```

## 5. AI Generation

### Generate Content
```typescript
trpc.ai.generate.mutate({
  taskType: 'code-generation' | 'documentation' | 'simple-tasks' | 'analysis' | 'creative',
  prompt: string,
  projectId?: string,
  temperature?: number,  // 0-1
  maxTokens?: number
})
// Returns: {
//   response: string,
//   model: string,
//   cost: number,
//   tokens: { input: number, output: number }
// }
```

### Estimate Cost
```typescript
trpc.ai.estimateCost.query({
  taskType: string,
  estimatedTokens: number
})
// Returns: {
//   estimatedCost: number,
//   model: string,
//   inputTokens: number,
//   outputTokens: number
// }
```

### Get AI Usage Stats
```typescript
trpc.ai.getUsageStats.query()
// Returns: {
//   totalGenerations: number,
//   totalCost: number,
//   totalTokens: number,
//   averageLatency: number,
//   creditBalance: number,
//   mostUsedModels: Array<{
//     model: string,
//     count: number,
//     totalCost: number
//   }>
// }
```

### List AI Models
```typescript
trpc.ai.listModels.query()
// Returns: Array<{
//   model: string,
//   provider: string,
//   inputCostPer1M: number,
//   outputCostPer1M: number,
//   maxTokens: number
// }>
```

## 6. Templates

### Create Template
```typescript
trpc.template.create.mutate({
  name: string,
  description: string,
  category: string,
  workflowData: any,
  tags?: string[],
  icon?: string,
  isPublic?: boolean
})
// Returns: Template object
```

### List Templates
```typescript
trpc.template.list.query({
  category?: string,
  search?: string,
  isOfficial?: boolean,
  isPublic?: boolean,
  sortBy?: 'popular' | 'recent' | 'alphabetical',
  limit?: number,
  offset?: number
})
// Returns: { templates: Template[], total: number }
```

### Get Template
```typescript
trpc.template.get.query({ id: string })
// Returns: Template object
```

### Use Template
```typescript
trpc.template.use.mutate({ templateId: string })
// Returns: { projectId: string }
```

### Update Template
```typescript
trpc.template.update.mutate({
  id: string,
  name?: string,
  description?: string,
  category?: string,
  tags?: string[],
  isPublic?: boolean
})
// Returns: Updated Template object
```

### Delete Template
```typescript
trpc.template.delete.mutate({ id: string })
// Returns: { success: boolean }
```

### Get Popular Templates
```typescript
trpc.template.getPopular.query({ limit?: number })
// Returns: Template[]
```

## 7. Showcase

### Create Showcase
```typescript
trpc.showcase.create.mutate({
  projectId: string,
  title: string,
  description: string,
  tags?: string[],
  thumbnailUrl?: string
})
// Returns: Showcase object
```

### List Showcases
```typescript
trpc.showcase.list.query({
  search?: string,
  tags?: string[],
  featured?: boolean,
  authorId?: string,
  sortBy?: 'views' | 'likes' | 'createdAt' | 'trending',
  sortOrder?: 'asc' | 'desc',
  limit?: number,
  offset?: number
})
// Returns: {
//   showcases: Showcase[],
//   total: number,
//   hasMore: boolean
// }
```

### Get Showcase
```typescript
trpc.showcase.get.query({ showcaseId: string })
// Returns: Showcase with project details
// Note: Increments view count
```

### Update Showcase
```typescript
trpc.showcase.update.mutate({
  showcaseId: string,
  title?: string,
  description?: string,
  tags?: string[],
  thumbnailUrl?: string,
  featured?: boolean
})
// Returns: Updated Showcase object
```

### Delete Showcase
```typescript
trpc.showcase.delete.mutate({ showcaseId: string })
// Returns: { success: boolean }
```

### Toggle Like
```typescript
trpc.showcase.toggleLike.mutate({ showcaseId: string })
// Returns: { liked: boolean, likes: number }
```

### Fork Showcase
```typescript
trpc.showcase.fork.mutate({ showcaseId: string })
// Returns: {
//   forkedProjectId: string,
//   message: string
// }
```

### Get Showcase Statistics
```typescript
trpc.showcase.getStats.query({ showcaseId: string })
// Returns: {
//   views: number,
//   likes: number,
//   forks: number,
//   uniqueViewers: number,
//   totalComments: number,
//   engagementRate: string,
//   createdAt: Date,
//   updatedAt: Date
// }
```

## 8. Collaboration

### Send Invitation
```typescript
trpc.collaboration.invite.mutate({
  projectId: string,
  email: string,
  role?: 'viewer' | 'editor' | 'owner',
  expiresIn?: number  // milliseconds
})
// Returns: ProjectInvitation object
```

### Accept Invitation
```typescript
trpc.collaboration.acceptInvite.mutate({
  inviteCode: string
})
// Returns: {
//   collaborator: ProjectCollaborator,
//   project: Project
// }
```

### Get Collaborators
```typescript
trpc.collaboration.getCollaborators.query({
  projectId: string
})
// Returns: ProjectCollaborator[]
```

### Update Collaborator Role
```typescript
trpc.collaboration.updateRole.mutate({
  projectId: string,
  userId: string,
  role: 'viewer' | 'editor' | 'owner'
})
// Returns: Updated ProjectCollaborator
```

### Remove Collaborator
```typescript
trpc.collaboration.removeCollaborator.mutate({
  projectId: string,
  userId: string
})
// Returns: { success: boolean }
```

### Get Pending Invitations
```typescript
trpc.collaboration.getPendingInvitations.query({
  projectId: string
})
// Returns: ProjectInvitation[]
```

### Cancel Invitation
```typescript
trpc.collaboration.cancelInvitation.mutate({
  invitationId: string
})
// Returns: { success: boolean }
```

### Leave Project
```typescript
trpc.collaboration.leaveProject.mutate({
  projectId: string
})
// Returns: { success: boolean }
```

### Check Access
```typescript
trpc.collaboration.checkAccess.query({
  projectId: string,
  requiredRole?: 'viewer' | 'editor' | 'owner'
})
// Returns: { hasAccess: boolean }
```

## 9. Notifications

### Get Notifications
```typescript
trpc.notification.getNotifications.query({
  read?: boolean,
  type?: NotificationType,
  priority?: 'low' | 'normal' | 'high' | 'urgent',
  limit?: number,
  offset?: number
})
// Returns: {
//   notifications: Notification[],
//   total: number,
//   unreadCount: number,
//   hasMore: boolean
// }
```

### Mark as Read
```typescript
trpc.notification.markAsRead.mutate({
  notificationId: string
})
// Returns: { count: number }
```

### Mark All as Read
```typescript
trpc.notification.markAllAsRead.mutate()
// Returns: { count: number }
```

### Delete Notification
```typescript
trpc.notification.deleteNotification.mutate({
  notificationId: string
})
// Returns: { success: boolean }
```

### Get Unread Count
```typescript
trpc.notification.getUnreadCount.query()
// Returns: { count: number }
```

### Test Notification (Dev Only)
```typescript
trpc.notification.testNotification.mutate({
  type: NotificationType,
  title?: string,
  message?: string
})
// Returns: Notification object
```

## 10. Real-time Updates (SSE)

### Connect to SSE
```typescript
const eventSource = new EventSource(
  'http://localhost:3001/api/sse/events?projectId=<projectId>',
  {
    headers: {
      'Authorization': 'Bearer <access_token>'
    }
  }
)

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // Handle real-time events
}
```

### Event Types
```typescript
// Connection Events
{ type: 'connection', data: { status: 'connected', clientId: string } }
{ type: 'heartbeat', data: { timestamp: Date } }

// Workflow Events
{ type: 'workflow:start', data: { projectId, nodeId, context } }
{ type: 'workflow:complete', data: { projectId, result } }
{ type: 'workflow:error', data: { projectId, error } }
{ type: 'workflow:node:start', data: { projectId, nodeId } }
{ type: 'workflow:node:complete', data: { projectId, nodeId, result } }

// Collaboration Events
{ type: 'project:collaborator:added', data: { projectId, collaborator } }
{ type: 'project:collaborator:removed', data: { projectId, userId } }
{ type: 'project:updated', data: { projectId, changes } }

// Notification Events
{ type: 'notification:new', data: { notification } }
```

### Subscribe to Additional Projects
```http
POST /api/sse/subscribe
Authorization: Bearer <access_token>
{
  "clientId": "<client_id>",
  "projectId": "<project_id>"
}
```

### Unsubscribe from Project
```http
POST /api/sse/unsubscribe
Authorization: Bearer <access_token>
{
  "clientId": "<client_id>",
  "projectId": "<project_id>"
}
```

## 11. Marketplace

### List Marketplace Items
```typescript
trpc.marketplace.list.query({
  page?: number,
  limit?: number,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  sortBy?: 'rating' | 'price' | 'totalSales' | 'createdAt'
})
// Returns: { items: MarketplaceItem[], total: number }
```

### Get Marketplace Item
```typescript
trpc.marketplace.getItem.query({ itemId: string })
// Returns: MarketplaceItem with details
```

### Create Marketplace Listing
```typescript
trpc.marketplace.createListing.mutate({
  projectId: string,
  title: string,
  description: string,
  category: string,
  price: number,
  features: string[],
  requirements: string[]
})
// Returns: MarketplaceItem object
```

### Purchase Item
```typescript
trpc.marketplace.purchase.mutate({
  itemId: string
})
// Returns: { success: boolean, projectId: string }
```

### Leave Review
```typescript
trpc.marketplace.addReview.mutate({
  itemId: string,
  rating: number, // 1-5
  title: string,
  content: string
})
// Returns: MarketplaceReview object
```

## 12. Analytics

### Get Project Analytics
```typescript
trpc.analytics.getProjectAnalytics.query({
  projectId: string,
  period?: 'day' | 'week' | 'month' | 'year' | 'all'
})
// Returns: AnalyticsReport with metrics and trends
```

### Get User Analytics
```typescript
trpc.analytics.getUserAnalytics.query({
  period?: 'day' | 'week' | 'month'
})
// Returns: User analytics summary
```

### Get Dashboard Summary
```typescript
trpc.analytics.getDashboardSummary.query()
// Returns: {
//   totals: { projects, executions, successRate, totalCost, aiCalls },
//   recentActivity: WorkflowExecution[]
// }
```

### Get Trending Workflows
```typescript
trpc.analytics.getTrendingWorkflows.query({
  limit?: number
})
// Returns: Trending workflow list
```

## 13. Scheduling

### Create Schedule
```typescript
trpc.schedule.create.mutate({
  projectId: string,
  name: string,
  scheduleType: 'ONCE' | 'RECURRING' | 'CRON',
  scheduledAt?: Date, // For ONCE
  interval?: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY', // For RECURRING
  cronExpression?: string, // For CRON
  inputData?: any,
  startDate: Date,
  endDate?: Date
})
// Returns: ScheduledWorkflow object
```

### List Schedules
```typescript
trpc.schedule.list.query({
  projectId?: string,
  isActive?: boolean
})
// Returns: ScheduledWorkflow[]
```

### Update Schedule
```typescript
trpc.schedule.update.mutate({
  scheduleId: string,
  isActive?: boolean,
  isPaused?: boolean
})
// Returns: Updated ScheduledWorkflow
```

### Delete Schedule
```typescript
trpc.schedule.delete.mutate({
  scheduleId: string
})
// Returns: { success: boolean }
```

## 14. API Key Management

### Create API Key
```typescript
trpc.apiKey.create.mutate({
  name: string,
  scopes?: string[], // ['read', 'write', 'admin']
  expiresInDays?: number
})
// Returns: { key: string, keyId: string } // Key only shown once
```

### List API Keys
```typescript
trpc.apiKey.list.query()
// Returns: APIKey[] (without actual keys)
```

### Revoke API Key
```typescript
trpc.apiKey.revoke.mutate({
  keyId: string
})
// Returns: { success: boolean }
```

## 15. OAuth Authentication

### GitHub OAuth
```typescript
// Redirect to GitHub OAuth
window.location.href = 'http://localhost:3001/auth/github'

// Handle callback
const params = new URLSearchParams(window.location.search)
const accessToken = params.get('accessToken')
const refreshToken = params.get('refreshToken')
```

### Google OAuth
```typescript
// Redirect to Google OAuth
window.location.href = 'http://localhost:3001/auth/google'

// Handle callback (same as GitHub)
```

## 16. Advanced AI Features

### Generate from Template
```typescript
trpc.ai.generateFromTemplate.mutate({
  templateName: string, // e.g., 'code-function', 'doc-readme'
  variables: Record<string, any>,
  quality?: 'low' | 'medium' | 'high'
})
// Returns: AI generated content
```

### Execute AI Chain
```typescript
trpc.ai.executeChain.mutate({
  chainName: string, // e.g., 'full-feature', 'code-review'
  variables: Record<string, any>,
  quality?: 'low' | 'medium' | 'high'
})
// Returns: {
//   success: boolean,
//   finalOutput: string,
//   stepResults: Record<string, any>,
//   totalCost: number
// }
```

### Get Available Templates
```typescript
trpc.ai.getAvailableTemplates.query()
// Returns: Template list with variables
```

### Get Available Chains
```typescript
trpc.ai.getAvailableChains.query()
// Returns: Chain list with descriptions
```

## 17. Queue Management

### Get Queue Metrics
```typescript
trpc.queue.getMetrics.query()
// Returns: {
//   workflow: { waiting, active, completed, failed },
//   notification: { waiting, active },
//   analytics: { waiting, active }
// }
```

## 18. Workflow Versioning

### Save Version
```typescript
trpc.workflow.saveVersion.mutate({
  projectId: string,
  changelog?: string
})
// Returns: WorkflowVersion object
```

### List Versions
```typescript
trpc.workflow.listVersions.query({
  projectId: string
})
// Returns: WorkflowVersion[]
```

### Restore Version
```typescript
trpc.workflow.restoreVersion.mutate({
  projectId: string,
  versionId: string
})
// Returns: { success: boolean }
```

## Type Definitions

All types are available in the `@repo/types` package:

```typescript
import type {
  User,
  Project,
  WorkflowNode,
  WorkflowEdge,
  WorkflowData,
  WorkflowExecution,
  Template,
  Showcase,
  Notification,
  // ... and more
} from '@repo/types'
```

## Error Handling

All API calls may return tRPC errors with the following codes:

- `BAD_REQUEST` - Invalid input
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Not authorized
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict
- `INTERNAL_SERVER_ERROR` - Server error

Example error handling:

```typescript
try {
  const result = await trpc.project.create.mutate(data)
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // Redirect to login
  } else if (error.code === 'BAD_REQUEST') {
    // Show validation errors
  }
}
```

## Rate Limiting

The API implements rate limiting on certain endpoints:

- AI Generation: 100 requests per hour
- Workflow Execution: 50 executions per hour
- General API: 1000 requests per hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Frontend Integration Checklist

### Essential Features to Implement First

1. **Authentication Flow**
   - [ ] Login/Register pages
   - [ ] Token management (access & refresh)
   - [ ] Protected routes
   - [ ] User profile management

2. **Project Management**
   - [ ] Project list/grid view
   - [ ] Create/Edit project forms
   - [ ] Project dashboard
   - [ ] Workflow editor (ReactFlow integration)

3. **Workflow Builder**
   - [ ] Node palette
   - [ ] Drag-and-drop interface
   - [ ] Node configuration panels
   - [ ] Edge connections
   - [ ] Save/Load workflow

4. **Workflow Execution**
   - [ ] Execute button
   - [ ] Execution status display
   - [ ] Real-time progress (SSE)
   - [ ] Execution logs viewer
   - [ ] Results display

5. **AI Integration**
   - [ ] AI node configuration
   - [ ] Model selection
   - [ ] Cost estimation display
   - [ ] Usage statistics

### Secondary Features

6. **Templates**
   - [ ] Template gallery
   - [ ] Template preview
   - [ ] Use template flow
   - [ ] Create template from project

7. **Showcase**
   - [ ] Public showcase gallery
   - [ ] Showcase detail page
   - [ ] Like/Fork functionality
   - [ ] Create showcase from project

8. **Collaboration**
   - [ ] Invite collaborators
   - [ ] Manage permissions
   - [ ] Accept invitations
   - [ ] Collaborator list

9. **Notifications**
   - [ ] Notification bell/badge
   - [ ] Notification dropdown
   - [ ] Mark as read
   - [ ] Notification preferences

10. **Real-time Updates**
    - [ ] SSE connection management
    - [ ] Live execution updates
    - [ ] Collaboration notifications
    - [ ] Connection status indicator

### Future Features

11. **Marketplace**
    - [ ] Browse marketplace
    - [ ] Purchase workflows
    - [ ] Seller dashboard
    - [ ] Reviews and ratings

12. **Analytics**
    - [ ] Analytics dashboard
    - [ ] Performance charts
    - [ ] Cost tracking
    - [ ] Usage trends

13. **Scheduling**
    - [ ] Schedule creation UI
    - [ ] CRON builder
    - [ ] Schedule management
    - [ ] Execution history

## Development Tips

1. **Use tRPC Client**: Install `@trpc/client` and configure with the backend URL
2. **Type Safety**: Import types from `@repo/types` for full type safety
3. **Error Boundaries**: Implement error boundaries for API error handling
4. **Loading States**: Show loading indicators during API calls
5. **Optimistic Updates**: Update UI optimistically for better UX
6. **Cache Management**: Use React Query or similar for API response caching
7. **SSE Reconnection**: Implement automatic reconnection for SSE
8. **Token Refresh**: Implement automatic token refresh on 401 errors

## Support

For questions or issues, please refer to:
- Backend codebase: `/apps/api`
- Type definitions: `/packages/types`
- Database schema: `/packages/database/prisma/schema.prisma`