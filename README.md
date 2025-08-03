<div align="center">
  <h1 align="center">🌸 Flower</h1>
  <p align="center">
    <strong>AI-Powered Workflow Builder & BRD Generator</strong>
    <br />
    <em>Transform ideas into executable plans with Cerebras AI and seamless Cline integration</em>
  </p>
  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-how-it-works">How It Works</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-documentation">API Docs</a> •
    <a href="#-contributing">Contributing</a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/github/license/wiredium/flower?style=for-the-badge" alt="License">
    <img src="https://img.shields.io/badge/Hackathon-Cerebras%20×%20Cline-orange?style=for-the-badge" alt="Hackathon">
    <img src="https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge&logo=openai" alt="AI Powered">
  </p>
</div>

---

**Flower** is a revolutionary AI-powered workflow builder that transforms abstract project ideas into concrete, executable plans and comprehensive Business Requirements Documents (BRDs). Built specifically for the **Cerebras × Cline Hackathon**, Flower bridges the gap between ideation and implementation by leveraging cutting-edge AI orchestration and seamless local development integration.

### ✨ [Live Demo](http://localhost:3000) | 📋 [Implementation Plan](FLOWER_IMPLEMENTATION_PLAN.md) | 🚀 [Backend Report](BACKEND_COMPLETION_REPORT.md)

<!-- Landing Page Preview -->
<div align="center">
  <img src="https://via.placeholder.com/800x400/6366f1/ffffff?text=Flower+AI+Workflow+Builder" alt="Flower Platform Preview" width="100%">
  <p><em>Flower's intuitive visual workflow builder powered by ReactFlow and AI</em></p>
</div>

---

## 🌟 The Problem We're Solving

Traditional project planning is time-consuming, inconsistent, and prone to human error:
- **Manual Documentation**: Hours spent writing BRDs and project plans from scratch
- **Inconsistent Quality**: Different team members create varying levels of detail
- **Disconnect from Implementation**: Documentation that doesn't translate to actionable development tasks
- **Context Switching**: Moving between planning tools and development environments

## 💡 Flower's AI-Powered Solution

Flower revolutionizes project planning with intelligent automation:
- **⚡ Instant BRD Generation**: Transform ideas into comprehensive Business Requirements Documents in minutes
- **🧠 AI-Driven Analysis**: Multi-model orchestration using Cerebras and OpenRouter for optimal results
- **🎯 Visual Workflow Design**: Intuitive drag-and-drop interface with ReactFlow
- **🔄 Seamless Integration**: Direct export to local development with Cerebras × Cline compatibility
- **📊 Real-time Collaboration**: Live editing and execution monitoring
- **🎨 Template Marketplace**: Pre-built workflows and community sharing

---

## 🔑 Key Features

### 🧠 AI-Powered Project Planning
Transform abstract ideas into detailed project structures using advanced language models:
- **Multi-Model Orchestration**: Automatic selection between GPT-4, Claude, Llama, and specialized models
- **Context-Aware Generation**: AI understands project requirements and generates relevant workflows
- **Cost Optimization**: Intelligent model routing to minimize AI usage costs
- **Quality Scoring**: Built-in feedback system for continuous improvement

### 🎨 Visual Workflow Builder
Design complex workflows with an intuitive visual interface:
- **Drag & Drop Interface**: ReactFlow-powered editor with custom node types
- **Smart Node Types**: Start, End, Task, Decision, AI, Loop, Parallel, Integration nodes
- **Real-time Validation**: Instant feedback on workflow structure and logic
- **Version Control**: Complete workflow versioning with change history

### 📋 Professional BRD Generation
Generate comprehensive Business Requirements Documents:
- **Structured Output**: Professional formatting with stakeholder requirements
- **Technical Specifications**: Detailed implementation guidelines
- **Task Breakdown**: Actionable todo lists with priorities and dependencies
- **Export Formats**: Multiple output formats for different stakeholders

### 🔄 Cerebras × Cline Integration
Seamless bridge to local development environments:
- **Direct Export**: One-click export to your local Cline-enabled editor
- **Project Structure**: Automatic generation of directory structures and boilerplate
- **Development Ready**: Exported projects are immediately executable
- **Context Preservation**: Maintains project context throughout the development lifecycle

### 🤝 Real-time Collaboration
Work together seamlessly across teams:
- **Live Editing**: Multiple users can edit workflows simultaneously
- **Role-based Access**: Granular permissions (Owner, Editor, Viewer)
- **Change Notifications**: Real-time updates via Server-Sent Events
- **Comment System**: Contextual discussions within workflows

### 🏪 Community & Templates
Learn from and share with the community:
- **Template Marketplace**: Browse and use pre-built workflow templates
- **Showcase Gallery**: Publish successful workflows for community learning
- **Like & Fork**: Discover trending workflows and build upon them
- **Usage Analytics**: Track template performance and adoption

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js) ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css) |
| **Backend** | ![Fastify](https://img.shields.io/badge/Fastify-000000?style=flat&logo=fastify) ![tRPC](https://img.shields.io/badge/tRPC-2596be?style=flat&logo=trpc) ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js) |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=prisma) |
| **AI & ML** | ![OpenRouter](https://img.shields.io/badge/OpenRouter-FF6B6B?style=flat) ![Cerebras](https://img.shields.io/badge/Cerebras-FF6B35?style=flat) ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai) |
| **Workflow** | ![ReactFlow](https://img.shields.io/badge/ReactFlow-FF007A?style=flat) ![Zustand](https://img.shields.io/badge/Zustand-F7931E?style=flat) |
| **Development** | ![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=flat) ![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat&logo=pnpm) ![Biome](https://img.shields.io/badge/Biome-60A5FA?style=flat) |
| **Real-time** | ![Server-Sent Events](https://img.shields.io/badge/SSE-00D8FF?style=flat) |

---

## 🏗 How It Works: Architecture Overview

Flower is built as a modern monorepo with a clear separation of concerns:

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[Landing Page] --> B[Workflow Editor]
        B --> C[AI Integration]
        C --> D[Project Management]
        D --> E[Collaboration Tools]
    end
    
    subgraph "Backend API (Fastify + tRPC)"
        F[Authentication] --> G[Project Router]
        G --> H[Workflow Engine]
        H --> I[AI Orchestrator]
        I --> J[Real-time Events]
    end
    
    subgraph "AI Services"
        K[OpenRouter] --> L[Cerebras AI]
        K --> M[GPT-4 Turbo]
        K --> N[Claude Sonnet]
        K --> O[Llama Models]
    end
    
    subgraph "Data Layer"
        P[(PostgreSQL)] --> Q[Prisma ORM]
        Q --> R[Type Generation]
    end
    
    subgraph "External Integrations"
        S[Cline Export]
        T[GitHub Integration]
        U[Project Templates]
    end
    
    B --> G
    I --> K
    H --> P
    D --> S
    E --> J
```

### Core Workflow Process

1. **Idea Input**: User describes their project idea in natural language
2. **AI Analysis**: Multi-model orchestration analyzes requirements and generates structure
3. **Workflow Creation**: Visual workflow builder creates executable process flows
4. **BRD Generation**: Comprehensive documentation is automatically generated
5. **Local Export**: Project exports directly to Cline-enabled development environment
6. **Execution & Monitoring**: Real-time tracking of workflow execution and results

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **pnpm** (recommended) or npm/yarn
- **PostgreSQL** (local or cloud instance)
- **OpenRouter API Key** (for AI features)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/wiredium/flower.git
cd flower

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

### 2. Environment Configuration

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/flower"

# API Server
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# OpenRouter AI (Required)
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
DEFAULT_AI_MODEL=anthropic/claude-3-sonnet
FALLBACK_MODELS=gpt-4-turbo,llama-3-70b
MAX_TOKENS_PER_REQUEST=4000
AI_BUDGET_PER_USER=10.00

# Optional: External Integrations
GITHUB_APP_ID=your-github-app-id
GITHUB_PRIVATE_KEY=your-github-private-key
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm --filter @repo/database generate

# Push database schema
pnpm --filter @repo/database db:push

# Optional: Seed with templates
pnpm --filter @repo/database db:seed
```

### 4. Start Development Servers

```bash
# Start all services in development mode
pnpm dev

# Or start individually
pnpm --filter api dev          # Backend API (port 3001)
pnpm --filter web dev          # Frontend (port 3000)
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **tRPC Endpoint**: http://localhost:3001/trpc

---

## 📊 Project Structure

```
flower/
├── apps/
│   ├── api/                    # Fastify + tRPC backend
│   │   ├── src/
│   │   │   ├── routers/       # tRPC route handlers
│   │   │   ├── services/      # Business logic services
│   │   │   ├── lib/           # Configuration & utilities
│   │   │   ├── middleware/    # Authentication & validation
│   │   │   └── routes/        # SSE and webhook routes
│   │   └── package.json
│   └── web/                   # Next.js frontend application
│       ├── app/               # Next.js 13+ app directory
│       ├── components/        # React components
│       ├── hooks/             # Custom React hooks
│       ├── stores/            # Zustand state management
│       └── types/             # Frontend-specific types
├── packages/
│   ├── database/              # Prisma schema & migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   └── seed.ts        # Database seeding
│   │   └── src/               # Database client & utilities
│   ├── types/                 # Shared TypeScript types
│   ├── ui/                    # Shared React component library
│   ├── utils/                 # Shared utility functions
│   └── tsconfig/              # Shared TypeScript configurations
├── FLOWER_IMPLEMENTATION_PLAN.md
├── BACKEND_COMPLETION_REPORT.md
├── FRONTEND_API_GUIDE.md
└── README.md
```

---

## ✨ Feature Showcase

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🎨 Visual Workflow Builder</h3>
      <p>Create complex workflows with our intuitive drag-and-drop interface powered by ReactFlow. Design everything from simple linear processes to complex parallel execution flows.</p>
      <ul>
        <li>9 different node types for every workflow need</li>
        <li>Real-time validation and error detection</li>
        <li>Smart auto-layout and connection guidance</li>
        <li>Export to multiple formats including Cline-ready projects</li>
      </ul>
    </td>
    <td width="50%">
      <img src="https://via.placeholder.com/400x300/6366f1/ffffff?text=Workflow+Builder" alt="Workflow Builder Interface" width="100%">
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="https://via.placeholder.com/400x300/ec4899/ffffff?text=AI+Generation" alt="AI Content Generation" width="100%">
    </td>
    <td width="50%" valign="top">
      <h3>🧠 Intelligent AI Integration</h3>
      <p>Leverage the power of multiple AI models with our smart orchestration system. Automatically route tasks to the most appropriate model for optimal results and cost efficiency.</p>
      <ul>
        <li>Multi-model support (GPT-4, Claude, Llama, Cerebras)</li>
        <li>Cost-optimized model selection</li>
        <li>Context-aware prompt engineering</li>
        <li>Real-time usage tracking and analytics</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>📋 Professional BRD Generation</h3>
      <p>Transform your workflow designs into comprehensive Business Requirements Documents that stakeholders love and developers can actually use.</p>
      <ul>
        <li>Structured, professional formatting</li>
        <li>Technical specifications with implementation details</li>
        <li>Stakeholder-specific sections and views</li>
        <li>Export to PDF, Word, and Markdown formats</li>
      </ul>
    </td>
    <td width="50%">
      <img src="https://via.placeholder.com/400x300/10b981/ffffff?text=BRD+Generation" alt="BRD Document Generation" width="100%">
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="https://via.placeholder.com/400x300/f59e0b/ffffff?text=Real-time+Collaboration" alt="Real-time Collaboration" width="100%">
    </td>
    <td width="50%" valign="top">
      <h3>🤝 Real-time Collaboration</h3>
      <p>Work together seamlessly with your team using our real-time collaboration features. See changes as they happen and coordinate effortlessly.</p>
      <ul>
        <li>Live cursor tracking and user presence</li>
        <li>Role-based permissions (Owner, Editor, Viewer)</li>
        <li>Real-time notifications and updates</li>
        <li>Conflict resolution and change history</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🏪 Template Marketplace</h3>
      <p>Accelerate your project development with our curated template marketplace. Find proven workflows for common use cases or share your own successful patterns.</p>
      <ul>
        <li>Categorized template library</li>
        <li>Community ratings and reviews</li>
        <li>One-click template deployment</li>
        <li>Template versioning and updates</li>
      </ul>
    </td>
    <td width="50%">
      <img src="https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Template+Marketplace" alt="Template Marketplace" width="100%">
    </td>
  </tr>
</table>

---

## 📚 API Documentation

Flower provides a comprehensive, type-safe API built with tRPC. Our API supports:

### 🔑 Core Endpoints

- **Authentication**: Register, login, refresh tokens, password management
- **Projects**: CRUD operations, workflow management, collaboration
- **Workflows**: Execution engine, validation, version control
- **AI Generation**: Multi-model content generation, cost estimation
- **Templates**: Marketplace, usage tracking, community features
- **Real-time**: Server-Sent Events for live updates

### 📖 Detailed Documentation

For complete API documentation with examples and type definitions, see our [Frontend API Guide](FRONTEND_API_GUIDE.md).

### 🔗 Quick API Reference

```typescript
// Type-safe API calls with tRPC
import { trpc } from '@/lib/trpc'

// Create a new project
const project = await trpc.project.create.mutate({
  name: "My AI Workflow",
  description: "An intelligent automation workflow",
  visibility: "PRIVATE"
})

// Generate AI content
const result = await trpc.ai.generate.mutate({
  taskType: "code-generation",
  prompt: "Create a React component for user authentication",
  temperature: 0.7
})

// Execute workflow
const execution = await trpc.workflow.execute.mutate({
  projectId: project.id,
  variables: { input: "processing data" }
})
```

---

## 🎯 Development Workflow

### 🚀 Quick Commands

```bash
# Development
pnpm dev                    # Start all services
pnpm dev --filter web       # Frontend only
pnpm dev --filter api       # Backend only

# Building
pnpm build                  # Build all packages
pnpm build --filter web     # Build frontend
pnpm build --filter api     # Build backend

# Quality Assurance
pnpm lint                   # Lint all packages
pnpm lint:fix               # Fix linting issues
pnpm format                 # Format code with Biome
pnpm check-types            # TypeScript type checking

# Database
pnpm --filter @repo/database generate    # Generate Prisma client
pnpm --filter @repo/database db:push     # Push schema changes
pnpm --filter @repo/database db:seed     # Seed database
```

### 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test                   # All tests
pnpm test:unit              # Unit tests
pnpm test:integration       # Integration tests
pnpm test:e2e               # End-to-end tests
```

---

## 🌍 Deployment

### 📦 Production Build

```bash
# Build for production
pnpm build

# Start production servers
pnpm start
```

### 🐳 Docker Deployment

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d
```

### ☁️ Cloud Deployment

Flower is designed to be cloud-native and can be deployed on:

- **Vercel** (Frontend) + **Railway/Render** (Backend)
- **Docker** containers on any cloud provider
- **Kubernetes** clusters for enterprise deployment

---

## 🎊 Hackathon Context: Cerebras × Cline

This project was built specifically for the **Cerebras × Cline Hackathon**, showcasing the powerful combination of:

### 🧠 Cerebras Integration
- **Ultra-fast Inference**: Leverage Cerebras's lightning-fast AI processing
- **Cost-effective AI**: Optimized model routing for budget-conscious development
- **Scalable Architecture**: Built to handle enterprise-level AI workloads

### 🛠️ Cline Compatibility
- **Seamless Export**: One-click export to Cline-enabled development environments
- **Context Preservation**: Maintain project context throughout the development lifecycle
- **Local Development**: Bridge the gap between planning and implementation

### 🏆 Innovation Highlights
- **Multi-Model Orchestration**: Intelligent routing between different AI models
- **Visual Workflow Design**: Intuitive interface for complex process design
- **Real-time Collaboration**: Live editing and execution monitoring
- **Professional Documentation**: Auto-generated BRDs and technical specifications

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)

### ✨ Feature Requests

Have an idea? Open an issue with:
- Detailed description of the feature
- Use case and benefits
- Potential implementation approach

### 🔧 Development Contributions

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper tests
4. **Follow code style**: Run `pnpm lint:fix` and `pnpm format`
5. **Commit changes**: Use conventional commit messages
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with a clear description

### 📝 Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use meaningful commit messages (Conventional Commits)
- Update documentation for new features
- Ensure compatibility with both development and production environments

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Cerebras** for providing cutting-edge AI infrastructure
- **Cline** for revolutionizing AI-assisted development
- **OpenRouter** for multi-model AI orchestration
- **Vercel** for Next.js and deployment platform
- **Prisma** for type-safe database access
- **ReactFlow** for visual workflow capabilities

---

## 📞 Support & Community

- **Documentation**: [Frontend API Guide](FRONTEND_API_GUIDE.md)
- **Implementation**: [Development Plan](FLOWER_IMPLEMENTATION_PLAN.md)
- **Backend Status**: [Completion Report](BACKEND_COMPLETION_REPORT.md)
- **Issues**: [GitHub Issues](https://github.com/wiredium/flower/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wiredium/flower/discussions)

---

<div align="center">
  <p>Built with ❤️ for the Cerebras × Cline Hackathon</p>
  <p>
    <strong>Transform your ideas into reality with AI-powered workflow automation</strong>
  </p>
</div>
