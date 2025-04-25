require('dotenv').config()

import WebSocket from 'ws'
import { privateKeyToAccount } from 'viem/accounts'
import { setupSDK } from './opentelemetry/setup'
import { withSpan } from './opentelemetry/api'
import { processBundle } from './processor'
import { debugLog } from './helpers/logger'

setupSDK({
  version: process.env.VERSION,
  env: process.env.DEPLOYMENT_ENV,
  serviceName: 'rhinestone-relayer',
})

// Get the relayer address from private key
const relayerAccount = process.env.SOLVER_PRIVATE_KEY
  ? privateKeyToAccount(process.env.SOLVER_PRIVATE_KEY as `0x${string}`)
  : undefined

if (relayerAccount) {
  debugLog(`Relayer address: ${relayerAccount.address}`)
} else {
  console.warn(
    'No relayer private key provided, inventory rebalancing will be disabled',
  )
}

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
      debugLog(`Received bundle: ${bundle.bundleId}`)
      await processBundle(bundle, undefined, relayerAccount?.address)
    } else {
      debugLog('Received ping')
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
