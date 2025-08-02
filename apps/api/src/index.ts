import { buildServer } from './lib/server.js'

const start = async () => {
  const server = await buildServer()
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001
  const host = process.env.HOST || '0.0.0.0'

  try {
    await server.listen({ port, host })
    console.log(`🚀 Server ready at http://localhost:${port}`)
    console.log(`🔗 tRPC playground at http://localhost:${port}/trpc-playground`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()