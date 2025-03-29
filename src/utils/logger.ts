import { logToSlack } from './slack'

export async function logMessage(message: string) {
  console.log(message)
  logToSlack(message)
}

export async function logError(message: string) {
  console.error(message)
  logToSlack(message)
}
