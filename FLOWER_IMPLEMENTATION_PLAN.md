# Flower - Agentic Workflow Builder Implementation Plan

## 🌸 Project Overview

Flower is an AI-powered workflow builder platform that helps users transform abstract project ideas into concrete, executable plans. The platform uses visual flow-based editing (ReactFlow), AI-powered plan generation (OpenRouter), and seamless integrations with development tools (GitHub, Jira, Trello).

## 🎯 Core Value Propositions

1. **Zero to Production**: Transform ideas into actionable project structures
2. **AI-Powered Assistance**: Leverage multiple AI models for optimal results
3. **Visual Workflow Design**: Intuitive drag-and-drop interface
4. **One-Click Integrations**: Direct export to development and project management tools
5. **Community Learning**: Share and learn from successful workflows

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15.4 with React 19
- **UI Library**: ReactFlow for workflow visualization
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Real-time**: Socket.io-client
- **Type Safety**: TypeScript + tRPC client

### Backend Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Fastify v5 for high performance
- **API Layer**: tRPC v10 for type-safe APIs
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenRouter API
- **Queue System**: Bull/BullMQ with Redis
- **Real-time**: Socket.io
- **Monitoring**: OpenTelemetry

### Infrastructure
- **Monorepo**: Turborepo for efficient builds
- **Package Manager**: pnpm for fast, efficient dependency management
- **Code Quality**: Biome for linting and formatting
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions
- **Deployment**: Docker + Kubernetes (production)

## 📊 Database Architecture

### Core Models

```prisma
// User & Authentication
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  hashedPassword  String?
  credits         Int       @default(100)
  role            UserRole  @default(USER)
  
  projects        Project[]
  aiGenerations   AIGeneration[]
  integrations    UserIntegration[]
  collaborations  ProjectCollaborator[]
}

// Project & Workflow
model Project {
  id              String    @id @default(cuid())
  name            String
  description     String    @db.Text
  workflowData    Json      // ReactFlow nodes and edges
  status          ProjectStatus
  visibility      Visibility @default(PRIVATE)
  
  owner           User      @relation(fields: [ownerId], references: [id])
  ownerId         String
  collaborators   ProjectCollaborator[]
  executions      WorkflowExecution[]
  aiGenerations   AIGeneration[]
  showcaseEntry   ShowcaseEntry?
}

// AI & Generation
model AIGeneration {
  id            String   @id @default(cuid())
  model         String   // e.g., "anthropic/claude-3-opus"
  provider      String   @default("openrouter")
  prompt        String   @db.Text
  response      String   @db.Text
  inputTokens   Int
  outputTokens  Int
  cost          Decimal
  latency       Int      // milliseconds
  taskType      String   // code, documentation, analysis
  quality       Int?     // 1-5 user feedback
}

// Templates & Showcase
model Template {
  id            String   @id @default(cuid())
  name          String
  description   String
  category      String
  workflowData  Json
  prefillData   Json
  usageCount    Int      @default(0)
  isOfficial    Boolean  @default(false)
}

// Integrations
model UserIntegration {
  id                String   @id @default(cuid())
  provider          String   // github, jira, trello
  accessToken       String   // Encrypted
  refreshToken      String?  // Encrypted
  externalAccountId String
  scopes            String[]
}
```

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure & OpenRouter Setup (Week 1)

#### Day 1-2: Project Setup & Database
- [ ] Initialize enhanced project structure
- [ ] Implement complete Prisma schema
- [ ] Set up database migrations
- [ ] Configure environment variables

```typescript
// Structure
apps/
  api/
    src/
      routers/      # tRPC routers
      services/     # Business logic
      lib/          # Utilities
      middleware/   # Auth, validation
      queue/        # Background jobs
```

#### Day 3-4: Authentication & Authorization
- [ ] JWT implementation with refresh tokens
- [ ] OAuth providers (GitHub, Google)
- [ ] Role-based access control (RBAC)
- [ ] API key management system

```typescript
// auth.router.ts
export const authRouter = router({
  register: publicProcedure.input(registerSchema).mutation(),
  login: publicProcedure.input(loginSchema).mutation(),
  refresh: publicProcedure.input(refreshSchema).mutation(),
  oauth: {
    github: publicProcedure.mutation(),
    google: publicProcedure.mutation(),
  }
});
```

#### Day 5-6: OpenRouter Integration
- [ ] OpenRouter service implementation
- [ ] Model selection strategy
- [ ] Cost tracking system
- [ ] Streaming response support

```typescript
// openrouter.service.ts
class OpenRouterService {
  private readonly apiKey: string;
  private readonly models = {
    'code-generation': 'anthropic/claude-3-opus',
    'documentation': 'openai/gpt-4-turbo',
    'simple-tasks': 'mistralai/mistral-7b',
    'analysis': 'anthropic/claude-3-sonnet'
  };

  async generate(taskType: string, prompt: string, options?: GenerateOptions);
  async stream(taskType: string, prompt: string, onChunk: (chunk: string) => void);
  async estimateCost(prompt: string, model: string): Promise<number>;
}
```

#### Day 7: Testing & Documentation
- [ ] Unit tests for core services
- [ ] Integration tests for API endpoints
- [ ] API documentation
- [ ] Development environment setup guide

### Phase 2: Workflow Engine with AI (Week 2)

#### Core Workflow Features
- [ ] Node CRUD operations
- [ ] Edge management
- [ ] Workflow validation
- [ ] Execution engine
- [ ] State management

```typescript
// workflow.router.ts
export const workflowRouter = router({
  create: protectedProcedure.input(workflowSchema).mutation(),
  update: protectedProcedure.input(updateWorkflowSchema).mutation(),
  execute: protectedProcedure.input(executeSchema).mutation(),
  
  nodes: {
    create: protectedProcedure.input(nodeSchema).mutation(),
    update: protectedProcedure.input(updateNodeSchema).mutation(),
    delete: protectedProcedure.input(deleteNodeSchema).mutation(),
    generateContent: protectedProcedure.input(generateNodeSchema).mutation(),
  },
  
  edges: {
    create: protectedProcedure.input(edgeSchema).mutation(),
    update: protectedProcedure.input(updateEdgeSchema).mutation(),
    delete: protectedProcedure.input(deleteEdgeSchema).mutation(),
  }
});
```

#### AI-Powered Features
- [ ] Context-aware node generation
- [ ] Workflow optimization suggestions
- [ ] Auto-completion for workflows
- [ ] Intelligent validation

#### Real-time Collaboration
- [ ] WebSocket setup
- [ ] Presence system
- [ ] Collaborative editing
- [ ] Change notifications

### Phase 3: Advanced AI Features (Week 3)

#### Multi-Model Orchestration
- [ ] Task classification system
- [ ] Model performance tracking
- [ ] Fallback mechanisms
- [ ] Cost optimization algorithms

```typescript
// ai-orchestrator.service.ts
class AIOrchestrator {
  async routeTask(task: AITask): Promise<AIResponse> {
    const complexity = this.analyzeComplexity(task);
    const model = this.selectOptimalModel(task.type, complexity, task.budget);
    
    try {
      return await this.executeWithModel(model, task);
    } catch (error) {
      return await this.executeWithFallback(task);
    }
  }
  
  private selectOptimalModel(
    taskType: string, 
    complexity: number, 
    budget: number
  ): string {
    // Smart model selection based on multiple factors
  }
}
```

#### Generation Pipeline
- [ ] Prompt engineering system
- [ ] Multi-step generation chains
- [ ] Output validation
- [ ] Quality scoring

#### Analytics & Monitoring
- [ ] Token usage tracking
- [ ] Cost analytics dashboard
- [ ] Model performance metrics
- [ ] User feedback integration

### Phase 4: Export & Integration Services (Week 4)

#### GitHub Integration
- [ ] Repository creation
- [ ] File structure generation
- [ ] README generation
- [ ] GitHub Actions workflow creation

```typescript
// github.service.ts
class GitHubService {
  async createRepository(project: Project): Promise<Repository>;
  async generateProjectStructure(workflow: Workflow): Promise<FileTree>;
  async createWorkflowFile(workflow: Workflow): Promise<string>;
  async pushFiles(repo: Repository, files: FileTree): Promise<void>;
}
```

#### Project Management Integrations
- [ ] Jira board creation
- [ ] Trello card generation
- [ ] Task mapping from workflow nodes
- [ ] Webhook receivers

#### Export Formats
- [ ] Docker configuration
- [ ] Kubernetes manifests
- [ ] Terraform scripts
- [ ] CI/CD pipelines

### Phase 5: Community & Learning (Week 5)

#### Showcase System
- [ ] Publishing workflow
- [ ] Content sanitization
- [ ] Search and filtering
- [ ] Trending algorithms

#### Social Features
- [ ] Voting system
- [ ] Comments
- [ ] Following system
- [ ] Notifications

#### Template Marketplace
- [ ] Template submission
- [ ] Review process
- [ ] Usage analytics
- [ ] Revenue sharing (future)

## 🔧 Development Workflow

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/wiredium/flower.git
cd flower

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Set up database
docker-compose up -d postgres
pnpm -F @repo/database db:push

# 5. Generate Prisma client
pnpm -F @repo/database db:generate

# 6. Start development servers
pnpm dev
```

### API Endpoint Structure

```
/trpc/auth.*              # Authentication
/trpc/user.*              # User management
/trpc/project.*           # Project CRUD
/trpc/workflow.*          # Workflow operations
/trpc/ai.*                # AI generation
/trpc/integration.*       # External integrations
/trpc/template.*          # Template management
/trpc/showcase.*          # Community features
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/flower?schema=public"

# API Server
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
OAUTH_GITHUB_CLIENT_ID=xxx
OAUTH_GITHUB_CLIENT_SECRET=xxx

# OpenRouter AI
OPENROUTER_API_KEY=sk-or-v1-xxx
DEFAULT_AI_MODEL=anthropic/claude-3-sonnet
FALLBACK_MODELS=gpt-4-turbo,llama-3-70b
MAX_TOKENS_PER_REQUEST=4000
AI_BUDGET_PER_USER=10.00

# External Integrations
GITHUB_APP_ID=xxx
GITHUB_PRIVATE_KEY=xxx
JIRA_CLIENT_ID=xxx
JIRA_CLIENT_SECRET=xxx
TRELLO_API_KEY=xxx
TRELLO_API_SECRET=xxx

# Redis (for queues and caching)
REDIS_URL=redis://localhost:6379

# File Storage (S3 or compatible)
S3_BUCKET=flower-exports
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
```

## 📈 Success Metrics

### Technical KPIs
- API response time < 200ms (p95)
- AI generation time < 5s for standard tasks
- System uptime > 99.9%
- Test coverage > 80%

### Business KPIs
- User activation rate > 40%
- Weekly active workflows > 3 per user
- Integration usage > 60% of active users
- Showcase participation > 20%

### AI Performance Metrics
- Model selection accuracy > 85%
- Cost optimization savings > 30%
- User satisfaction score > 4.2/5
- Generation quality score > 4/5

## 🚦 Risk Management

### Technical Risks
- **OpenRouter API downtime**: Implement caching and fallback models
- **Database scaling issues**: Use read replicas and connection pooling
- **Real-time performance**: Implement efficient WebSocket management
- **Cost overruns**: Strict budget controls and monitoring

### Security Considerations
- **Token encryption**: AES-256 for stored tokens
- **Rate limiting**: Per-user and per-endpoint limits
- **Input validation**: Zod schemas for all inputs
- **SQL injection**: Prisma ORM prevents by default
- **XSS prevention**: Content sanitization for showcase

## 🎯 Next Steps

### Immediate Actions (Week 1)
1. Set up enhanced project structure
2. Implement core database schema
3. Create authentication system
4. Integrate OpenRouter API
5. Build basic workflow CRUD

### Short-term Goals (Month 1)
- Complete Phase 1-3
- Launch internal alpha
- Gather initial feedback
- Iterate on AI prompts

### Long-term Vision (Quarter 1)
- Full platform launch
- 100+ active users
- 10+ integration partners
- Template marketplace
- Mobile app (React Native)

## 📚 Resources & Documentation

### External Documentation
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Fastify Documentation](https://www.fastify.io/docs/)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [ReactFlow Documentation](https://reactflow.dev/docs)

### Internal Documentation
- `/docs/api` - API endpoint documentation
- `/docs/architecture` - System architecture diagrams
- `/docs/deployment` - Deployment guides
- `/docs/contributing` - Contribution guidelines

## 🤝 Team & Responsibilities

### Development Team Structure
- **Backend Lead**: API, database, integrations
- **Frontend Lead**: UI/UX, ReactFlow implementation
- **AI Engineer**: OpenRouter integration, prompt engineering
- **DevOps**: Infrastructure, CI/CD, monitoring
- **Product Manager**: Requirements, user feedback, roadmap

---

*This document is a living guide and will be updated as the project evolves.*

**Last Updated**: December 2024
**Version**: 1.0.0