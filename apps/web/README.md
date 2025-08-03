# Flower Frontend Application

A modern AI-powered workflow builder platform built with Next.js 14, TypeScript, and React Flow.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14, React 18, TypeScript
- **Beautiful UI**: Tailwind CSS with gradient designs
- **Type-Safe API**: tRPC integration with backend
- **Workflow Editor**: React Flow for visual workflow creation
- **Authentication**: JWT-based auth with refresh tokens
- **Real-time Updates**: Server-Sent Events (SSE)
- **AI Integration**: Support for Cerebras, OpenAI, and Anthropic

## 📁 Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── projects/      # Project management
│   │   ├── templates/     # Template gallery
│   │   └── showcase/      # Community showcase
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── providers.tsx      # React context providers
├── lib/                   # Utility functions
│   ├── trpc.ts           # tRPC client setup
│   └── utils.ts          # Helper functions
├── components/            # React components
│   └── workflow/         # Workflow editor components
├── hooks/                 # Custom React hooks
├── stores/               # Zustand state stores
└── types/                # TypeScript type definitions
```

## 🛠️ Installation

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Backend Connection
The frontend connects to the backend API at `http://localhost:3001/trpc`

## 📄 Available Pages

### Public Pages
- `/` - Beautiful landing page with gradient design
- `/login` - User authentication with social login options
- `/register` - New user registration
- `/showcase` - Public workflow gallery
- `/templates` - Template marketplace

### Protected Pages (Coming Soon)
- `/dashboard` - User dashboard with project overview
- `/projects` - Project management interface
- `/projects/[id]` - Workflow editor with React Flow
- `/settings` - User settings and preferences
- `/analytics` - Usage analytics and insights

## 🎨 UI Components

The project uses a custom UI component library located in `packages/ui/src/`:

- **Button**: Multiple variants (default, gradient, outline, ghost) with loading states
- **Toast**: Beautiful notification system
- **Card**: Content containers
- **Dialog**: Modal dialogs
- **Form**: React Hook Form integrated components

## 🔌 API Integration

The frontend connects to the backend via tRPC with these main routers:

- `auth` - Authentication (login, register, refresh, logout)
- `project` - Project CRUD operations
- `workflow` - Workflow execution and validation
- `ai` - AI generation and model management
- `template` - Template management
- `showcase` - Community features
- `collaboration` - Team collaboration
- `notification` - Real-time notifications

## 🎯 Key Features Implemented

### Landing Page
- Modern gradient design
- Feature highlights
- Call-to-action buttons
- Responsive layout

### Authentication
- Beautiful login page
- Form validation
- Social login UI (GitHub, Google)
- Password recovery flow

### UI/UX
- Dark mode support
- Smooth animations
- Gradient backgrounds
- Accessible components

## 🚦 Development

### Running the App
```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

### Type Checking
```bash
pnpm type-check
```

## 📚 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: tRPC
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Workflow Visualization**: React Flow
- **Animations**: Framer Motion
- **UI Components**: Radix UI primitives

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Cerebras Hackathon submission.