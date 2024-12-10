import WebSocket from 'ws'
import { fillBundle } from './filler'
import { generateBundle } from './bundleGenerator'

// Define the WebSocket URL for the orchestrator
const ORCHESTRATOR_URL = 'wss://orchestrator.api.rhinestone.wtf/bundles/events'

// Create a WebSocket client
const ws = new WebSocket(ORCHESTRATOR_URL)

// Handle connection open event
ws.on('open', () => {
  console.log('Connected to the orchestrator WebSocket server')
})

// Handle incoming messages
ws.on('message', async (data) => {
  const bundle = JSON.parse(data.toString())
  console.log('Received bundle:', bundle)
  try {
    if (bundle.type !== 'Ping') {
      await fillBundle(bundle)
      console.log('Successfully received bundle')
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

// Call the generateBundle function on repeat every 30 seconds
try {
  setInterval(async () => {
    try {
      await generateBundle()
    } catch (error) {
      console.error('Error generating bundle:', error)
    }
  }, 30000)
} catch (error) {
  console.error('Error setting up interval:', error)
}
