require('dotenv').config()  

export async function logToSlack(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  console.log('Using webhook url: ', webhookUrl)

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

  console.log(response)

  if (!response.ok) {
    console.error('Failed to send slack message:', response.statusText)
  }
}

export function logMessage(message: string) {
  console.log(message)
  logToSlack(message)
}

export function logError(message: string) {
  console.error(message)
  logToSlack(message)
}
