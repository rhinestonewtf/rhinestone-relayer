import { withSpan } from "../opentelemetry/api"

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

export async function logMessage(message: string) {
  console.log(message)
  logToSlack(message)
}

export const logError = async (message: string) => withSpan('log error to slack', async () => {
  console.error(message)
  logToSlack(message)
})
