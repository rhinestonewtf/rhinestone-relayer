import WebSocket from 'ws'
import { setupSDK } from './opentelemetry/setup'
import { withSpan } from './opentelemetry/api'
import { config } from 'dotenv'
import { processBundle } from './processor'

config()
setupSDK({
  version: process.env.VERSION,
  env: process.env.DEPLOYMENT_ENV,
  serviceName: 'rhinestone-relayer',
})

// Create a WebSocket client
const ws = new WebSocket(process.env.ORCHESTRATOR_EVENTS_URL!)

// Handle connection open event
ws.on('open', async () => {
  console.log('Connected to the orchestrator WebSocket server')
})

// Handle incoming messages
ws.on('message', async (data) =>
  withSpan('Handle WS event', async () => {
    const bundle = JSON.parse(data.toString())
    if (bundle.type !== 'Ping') {
      await processBundle(bundle)
    }
  }),
)

// Handle connection close event
ws.on('close', () => {
  console.log('Disconnected from the orchestrator WebSocket server')
})

// Handle errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error)
})
