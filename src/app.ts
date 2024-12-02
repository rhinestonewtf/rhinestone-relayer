import WebSocket from 'ws'
import { fillBundle } from './filler'

// Define the WebSocket URL for the orchestrator
const ORCHESTRATOR_URL = 'wss://orchestrator-prototype-38oyp.ondigitalocean.app/bundles/events'

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
    await fillBundle(bundle)
    console.log('Successfully filled bundle')
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
