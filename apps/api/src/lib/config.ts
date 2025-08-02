import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.string().default('info'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // OpenRouter AI
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_BASE_URL: z.string().default('https://openrouter.ai/api/v1'),
  OPENROUTER_SITE_URL: z.string().optional(),
  OPENROUTER_SITE_NAME: z.string().optional(),
  DEFAULT_AI_MODEL: z.string().default('anthropic/claude-3-sonnet'),
  FALLBACK_MODELS: z.string().default('gpt-4-turbo,llama-3-70b'),
  MAX_TOKENS_PER_REQUEST: z.string().default('4000').transform(Number),
  AI_BUDGET_PER_USER: z.string().default('10.00').transform(Number),
  
  // OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  API_URL: z.string().default('http://localhost:3001'),
  
  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().default('6379').transform(Number).optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // Security
  ENCRYPTION_KEY: z.string().optional(),
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),
  RATE_LIMIT_WINDOW: z.string().default('60000').transform(Number),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(JSON.stringify(parsed.error.format(), null, 2))
  process.exit(1)
}

export const config = parsed.data