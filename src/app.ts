require('dotenv').config()

import WebSocket from 'ws'
import { fillBundle } from './filler'
import { generateBundle } from './bundleGenerator'
import { chains } from './utils/getClients'
import { nonceManager } from './nonceManager'
import { startSlackListener } from './utils/slack'

// Define the WebSocket URL for the orchestrator
// const ORCHESTRATOR_URL = 'wss://orchestrator.api.rhinestone.wtf/bundles/events'
// const ORCHESTRATOR_URL = 'ws://localhost:3000/bundles/events'
// const ORCHESTRATOR_URL =
//   'wss://orchestrator-ts-dev-lu36d.ondigitalocean.app/bundles/events'

// Create a WebSocket client
const ws = new WebSocket(process.env.ORCHESTRATOR_EVENTS_URL!)

// Handle connection open event
ws.on('open', async () => {
  console.log('Connected to the orchestrator WebSocket server')
  for (const key of Object.keys(chains)) {
    const numKey = parseInt(key)
    await nonceManager.initialize({ chainId: numKey })
  }
  console.log('Nonce manager initialized')
})

// Handle incoming messages
ws.on('message', async (data) => {
  const bundle = JSON.parse(data.toString())
  try {
    if (bundle.type !== 'Ping') {
      console.log('Received bundle:', bundle.bundleId)
      await fillBundle(bundle)
    } else {
      console.log('🟡 Received ping')
    }
  } catch (error) {
    console.error('Error filling bundle:', error)
  }
})

// Handle connection close event
ws.on('close', () => {
  console.log('Disconnected from the orchestrator WebSocket server')
})

// Handle errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error)
})

startSlackListener()

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
