import { withSpan } from '../opentelemetry/api'

export async function logToSlack(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    return
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: message }),
  })

  if (!response.ok) {
    console.error('Failed to send slack message:', response.statusText)
  }
}

// LOG_LEVEL can be set to NONE, LOCAL, or FULL
// NONE: No logs
// LOCAL: Only local logs
// FULL: Local logs and send to slack
// DEBUG: Debug logs
export const logMessage = async (message: string) => {
  const logLevel = process.env.LOG_LEVEL || 'LOCAL'

  if (logLevel == 'NONE') return
  if (logLevel == 'LOCAL' || logLevel == 'FULL' || logLevel == 'DEBUG') {
    console.log(message)
  }
  if (logLevel == 'FULL') {
    await logToSlack(message)
  }
}

export const debugLog = (message: string) => {
  const logLevel = process.env.LOG_LEVEL || 'LOCAL'
  if (logLevel == 'DEBUG' || logLevel == 'FULL') {
    console.log(message)
  }
}
