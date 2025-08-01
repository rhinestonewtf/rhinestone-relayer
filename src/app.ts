require('dotenv').config()

import WebSocket from 'ws'
import { setupSDK } from './opentelemetry/setup'
import { withSpan } from './opentelemetry/api'
import { debugLog } from './helpers/logger'
import { processRelayerActionV1 } from './relayer_action_v1/processor'

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
    const message = JSON.parse(data.toString())
    switch (message.type) {
      case 'Ping':
        debugLog('Received ping')
        break

      case 'RelayerActionV1':
        await processRelayerActionV1(message)
        break
      default:
        debugLog('Unknown message type')
        debugLog(JSON.stringify(message, undefined, 2))
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
