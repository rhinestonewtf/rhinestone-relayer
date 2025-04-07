require('dotenv').config()

import { setupSDK } from './opentelemetry/setup'
setupSDK({
  version: process.env.VERSION,
  env: process.env.DEPLOYMENT_ENV,
  serviceName: 'rhinestone-relayer',
})

import WebSocket from 'ws'
import { fillBundle } from './filler'
import { withSpan } from './opentelemetry/api'
import { addBundleId, recordError } from './tracing'

// Create a WebSocket client
const ws = new WebSocket(process.env.ORCHESTRATOR_EVENTS_URL!)

// Handle connection open event
ws.on('open', async () => {
  console.log('Connected to the orchestrator WebSocket server')
})

// Handle incoming messages
ws.on('message', async (data) => withSpan('Handle WS event', async () => {
  const bundle = JSON.parse(data.toString())
  try {
    if (bundle.type !== 'Ping') {
      console.log('Received bundle:', bundle.bundleId)
      addBundleId(bundle.bundleId)
      await fillBundle(bundle)
    } else {
      console.log('🟡 Received ping')
    }
  } catch (error: any) {
    recordError(error)
    console.error('Error filling bundle:', error)
  }
}))

// Handle connection close event
ws.on('close', () => {
  console.log('Disconnected from the orchestrator WebSocket server')
})

// Handle errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error)
})

// Generate a bundle with a very small amount every 30 seconds, so that fillers can test integration
// NOTE: This should not be added for production fillers.
// try {
//   setInterval(async () => {
//     try {
//       await generateBundle()
//     } catch (error) {
//       console.error('Error generating bundle:', error)
//     }
//   }, 30000)
// } catch (error) {
//   console.error('Error setting up interval:', error)
// }
