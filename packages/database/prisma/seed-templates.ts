/**
 * Seed workflow templates for the Flower platform
 */

export const workflowTemplates = [
  {
    name: 'Simple Task Automation',
    description: 'Basic workflow for automating a sequence of tasks',
    category: 'GENERAL' as const,
    icon: '🤖',
    tags: ['automation', 'tasks', 'beginner'],
    isOfficial: true,
    isPublic: true,
    workflowData: {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: {
            label: 'Start',
            description: 'Workflow begins here',
          },
        },
        {
          id: 'task-1',
          type: 'task',
          position: { x: 300, y: 100 },
          data: {
            label: 'First Task',
            description: 'Execute the first task',
            config: {
              type: 'api_call',
              data: {
                method: 'GET',
                url: 'https://api.example.com/data',
              },
            },
          },
        },
        {
          id: 'task-2',
          type: 'task',
          position: { x: 500, y: 100 },
          data: {
            label: 'Process Data',
            description: 'Process the retrieved data',
            config: {
              type: 'data_processing',
              data: {
                operation: 'transform',
              },
            },
          },
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 700, y: 100 },
          data: {
            label: 'End',
            description: 'Workflow completes',
          },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'start-1',
          target: 'task-1',
        },
        {
          id: 'e2',
          source: 'task-1',
          target: 'task-2',
        },
        {
          id: 'e3',
          source: 'task-2',
          target: 'end-1',
        },
      ],
    },
  },
  {
    name: 'AI Content Generator',
    description: 'Generate content using AI with quality checks',
    category: 'AI' as const,
    icon: '🧠',
    tags: ['ai', 'content', 'generation', 'creative'],
    isOfficial: true,
    isPublic: true,
    workflowData: {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 100, y: 200 },
          data: {
            label: 'Start Generation',
            description: 'Begin content generation process',
          },
        },
        {
          id: 'ai-1',
          type: 'ai',
          position: { x: 300, y: 200 },
          data: {
            label: 'Generate Content',
            description: 'Use AI to generate content',
            config: {
              prompt: 'Generate engaging content about $topic',
              taskType: 'creative',
              temperature: 0.8,
              maxTokens: 1500,
            },
          },
        },
        {
          id: 'decision-1',
          type: 'decision',
          position: { x: 500, y: 200 },
          data: {
            label: 'Quality Check',
            description: 'Check if content meets quality standards',
            config: {
              condition: '$contentLength > 500',
            },
          },
        },
        {
          id: 'ai-2',
          type: 'ai',
          position: { x: 500, y: 350 },
          data: {
            label: 'Regenerate',
            description: 'Regenerate content with different parameters',
            config: {
              prompt: 'Improve and expand: $previousContent',
              taskType: 'creative',
              temperature: 0.9,
            },
          },
        },
        {
          id: 'task-1',
          type: 'task',
          position: { x: 700, y: 200 },
          data: {
            label: 'Publish Content',
            description: 'Publish the generated content',
            config: {
              type: 'publish',
            },
          },
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 900, y: 200 },
          data: {
            label: 'Complete',
            description: 'Content generation complete',
          },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'start-1',
          target: 'ai-1',
        },
        {
          id: 'e2',
          source: 'ai-1',
          target: 'decision-1',
        },
        {
          id: 'e3',
          source: 'decision-1',
          target: 'task-1',
          data: { condition: 'pass', label: 'Quality OK' },
        },
        {
          id: 'e4',
          source: 'decision-1',
          target: 'ai-2',
          data: { condition: 'fail', label: 'Need Improvement' },
        },
        {
          id: 'e5',
          source: 'ai-2',
          target: 'decision-1',
        },
        {
          id: 'e6',
          source: 'task-1',
          target: 'end-1',
        },
      ],
    },
  },
  {
    name: 'Data Pipeline',
    description: 'ETL workflow for data processing',
    category: 'GENERAL' as const,
    icon: '📊',
    tags: ['data', 'etl', 'pipeline', 'processing'],
    isOfficial: true,
    isPublic: true,
    workflowData: {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 100, y: 200 },
          data: {
            label: 'Start Pipeline',
            description: 'Begin data processing',
          },
        },
        {
          id: 'integration-1',
          type: 'integration',
          position: { x: 300, y: 200 },
          data: {
            label: 'Extract Data',
            description: 'Extract data from source',
            config: {
              type: 'database',
              connection: 'primary_db',
              query: 'SELECT * FROM users WHERE created_at > $lastRun',
            },
          },
        },
        {
          id: 'parallel-1',
          type: 'parallel',
          position: { x: 500, y: 200 },
          data: {
            label: 'Transform Data',
            description: 'Transform data in parallel',
            config: {
              tasks: [
                { operation: 'clean', target: 'emails' },
                { operation: 'normalize', target: 'names' },
                { operation: 'validate', target: 'addresses' },
              ],
            },
          },
        },
        {
          id: 'task-1',
          type: 'task',
          position: { x: 700, y: 200 },
          data: {
            label: 'Load Data',
            description: 'Load processed data to destination',
            config: {
              type: 'database',
              operation: 'bulk_insert',
              target: 'warehouse',
            },
          },
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 900, y: 200 },
          data: {
            label: 'Pipeline Complete',
            description: 'Data processing finished',
          },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'start-1',
          target: 'integration-1',
        },
        {
          id: 'e2',
          source: 'integration-1',
          target: 'parallel-1',
        },
        {
          id: 'e3',
          source: 'parallel-1',
          target: 'task-1',
        },
        {
          id: 'e4',
          source: 'task-1',
          target: 'end-1',
        },
      ],
    },
  },
  {
    name: 'Issue Tracker Integration',
    description: 'Sync issues between GitHub and Jira',
    category: 'GENERAL' as const,
    icon: '🔄',
    tags: ['github', 'jira', 'sync', 'issues'],
    isOfficial: true,
    isPublic: true,
    workflowData: {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 100, y: 200 },
          data: {
            label: 'Start Sync',
            description: 'Begin issue synchronization',
          },
        },
        {
          id: 'integration-1',
          type: 'integration',
          position: { x: 300, y: 100 },
          data: {
            label: 'Fetch GitHub Issues',
            description: 'Get new issues from GitHub',
            config: {
              type: 'github',
              operation: 'list_issues',
              repo: '$githubRepo',
              since: '$lastSync',
            },
          },
        },
        {
          id: 'integration-2',
          type: 'integration',
          position: { x: 300, y: 300 },
          data: {
            label: 'Fetch Jira Issues',
            description: 'Get issues from Jira',
            config: {
              type: 'jira',
              operation: 'search',
              jql: 'project = $jiraProject AND updated > $lastSync',
            },
          },
        },
        {
          id: 'task-1',
          type: 'task',
          position: { x: 500, y: 200 },
          data: {
            label: 'Compare Issues',
            description: 'Find differences between systems',
            config: {
              type: 'comparison',
              key: 'title',
            },
          },
        },
        {
          id: 'loop-1',
          type: 'loop',
          position: { x: 700, y: 200 },
          data: {
            label: 'Sync Each Issue',
            description: 'Process each difference',
            config: {
              iterations: '$differenceCount',
              operation: 'sync_issue',
            },
          },
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 900, y: 200 },
          data: {
            label: 'Sync Complete',
            description: 'Issues synchronized',
          },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'start-1',
          target: 'integration-1',
        },
        {
          id: 'e2',
          source: 'start-1',
          target: 'integration-2',
        },
        {
          id: 'e3',
          source: 'integration-1',
          target: 'task-1',
        },
        {
          id: 'e4',
          source: 'integration-2',
          target: 'task-1',
        },
        {
          id: 'e5',
          source: 'task-1',
          target: 'loop-1',
        },
        {
          id: 'e6',
          source: 'loop-1',
          target: 'end-1',
        },
      ],
    },
  },
  {
    name: 'Code Review Automation',
    description: 'Automated code review with AI assistance',
    category: 'AI' as const,
    icon: '👨‍💻',
    tags: ['code-review', 'ai', 'github', 'quality'],
    isOfficial: true,
    isPublic: true,
    workflowData: {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 100, y: 200 },
          data: {
            label: 'PR Created',
            description: 'Pull request triggers review',
          },
        },
        {
          id: 'integration-1',
          type: 'integration',
          position: { x: 300, y: 200 },
          data: {
            label: 'Fetch PR Changes',
            description: 'Get code changes from GitHub',
            config: {
              type: 'github',
              operation: 'get_pr_diff',
              pr: '$prNumber',
            },
          },
        },
        {
          id: 'ai-1',
          type: 'ai',
          position: { x: 500, y: 100 },
          data: {
            label: 'Security Review',
            description: 'Check for security issues',
            config: {
              prompt: 'Review this code for security vulnerabilities: $code',
              taskType: 'analysis',
              temperature: 0.3,
            },
          },
        },
        {
          id: 'ai-2',
          type: 'ai',
          position: { x: 500, y: 200 },
          data: {
            label: 'Code Quality',
            description: 'Review code quality and style',
            config: {
              prompt: 'Review code quality, suggest improvements: $code',
              taskType: 'analysis',
              temperature: 0.5,
            },
          },
        },
        {
          id: 'ai-3',
          type: 'ai',
          position: { x: 500, y: 300 },
          data: {
            label: 'Performance Check',
            description: 'Check for performance issues',
            config: {
              prompt: 'Identify performance bottlenecks: $code',
              taskType: 'analysis',
              temperature: 0.4,
            },
          },
        },
        {
          id: 'task-1',
          type: 'task',
          position: { x: 700, y: 200 },
          data: {
            label: 'Compile Feedback',
            description: 'Combine all review feedback',
            config: {
              type: 'aggregate',
              format: 'markdown',
            },
          },
        },
        {
          id: 'integration-2',
          type: 'integration',
          position: { x: 900, y: 200 },
          data: {
            label: 'Post Review',
            description: 'Post review comments to PR',
            config: {
              type: 'github',
              operation: 'create_review',
              pr: '$prNumber',
            },
          },
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 1100, y: 200 },
          data: {
            label: 'Review Complete',
            description: 'Code review finished',
          },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'start-1',
          target: 'integration-1',
        },
        {
          id: 'e2',
          source: 'integration-1',
          target: 'ai-1',
        },
        {
          id: 'e3',
          source: 'integration-1',
          target: 'ai-2',
        },
        {
          id: 'e4',
          source: 'integration-1',
          target: 'ai-3',
        },
        {
          id: 'e5',
          source: 'ai-1',
          target: 'task-1',
        },
        {
          id: 'e6',
          source: 'ai-2',
          target: 'task-1',
        },
        {
          id: 'e7',
          source: 'ai-3',
          target: 'task-1',
        },
        {
          id: 'e8',
          source: 'task-1',
          target: 'integration-2',
        },
        {
          id: 'e9',
          source: 'integration-2',
          target: 'end-1',
        },
      ],
    },
  },
]