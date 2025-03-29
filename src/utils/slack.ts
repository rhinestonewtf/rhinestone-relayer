import { App } from '@slack/bolt'
import { getAllBalances } from './inventoryNotifs'
import { formatUnits } from 'viem'
import { TOKEN_SYMBOLS } from '../constants/constants'
import { getSupportedChainIds } from '@rhinestone/orchestrator-sdk'

let slackApp: App | null =
  process.env.SLACK_BOT_TOKEN &&
  process.env.SLACK_SIGNING_SECRET &&
  process.env.SLACK_APP_TOKEN
    ? new App({
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        socketMode: true,
        appToken: process.env.SLACK_APP_TOKEN,
      })
    : null

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

export async function startSlackListener() {
  if (!slackApp) {
    console.error(
      'Slack app is not initialized. Ensure environment variables are set.',
    )
    return
  }

  await slackApp.start(process.env.SLACK_PORT || 3000)

  console.log('⚡️ Slack app is running!')

  slackApp?.event('app_mention', async ({ event, say }) => {
    const command = event.text.split(' ').slice(1)
    if (command.length === 0) {
      await say(
        `Please provide a command. I respond to 'balance', 'config', and 'help'`,
      )
      return
    }

    if (command[0] === 'balance') {
      // Parse any parse of the message that says "chain" / "chains" / "chainId" / "chainIds" followed by a list of chain ids
      let chainIds = command
        .slice(1)
        .filter((word) => !isNaN(parseInt(word)))
        .map((word) => parseInt(word))
      // Parse any part of the message that says "token" / "tokens" / "tokenSymbol" / "tokenSymbols" followed by a list of token symbols
      let tokenSymbols = command
        .slice(1)
        .filter((word) => TOKEN_SYMBOLS.includes(word))

      if (chainIds.length === 0) {
        chainIds = getSupportedChainIds()
      }
      if (tokenSymbols.length === 0) {
        tokenSymbols = TOKEN_SYMBOLS
      }
      const balanceMessage = await getBalanceMessage(chainIds, tokenSymbols)
      await say(balanceMessage)
      return
    }
  })
  slackApp.command('/balance', async ({ command, ack, say }) => {
    await ack()
    const balanceMessage = await getBalanceMessage(getSupportedChainIds(), TOKEN_SYMBOLS)
    await say(balanceMessage)
  })
}

async function getBalanceMessage(chainIds: number[], tokenSymbols: string[]) {
  const balances = await getAllBalances(chainIds, tokenSymbols)
  if (balances.length === 0) {
    return `No balances found`
  }
  let balanceMessage = `Balances:\n`
  for (const balance of balances) {
    balanceMessage += `ChainId: ${balance.chainId}, Token: ${balance.symbol}, Balance: ${formatUnits(balance.balance, balance.tokenDecimals)}\n`
  }
  return balanceMessage
}
