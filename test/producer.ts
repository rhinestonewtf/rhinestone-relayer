import { convertBigIntFields } from '../src/controllers/orchestratorController'
import { BundleEvent } from '../src/types'

// producer.js
const amqp = require('amqplib')
require('dotenv').config()

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost'

const sendBundle = async (bundle: BundleEvent) => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL)
    const channel = await connection.createChannel()
    const exchange = 'bundles'

    await channel.assertExchange(exchange, 'fanout', { durable: false })
    channel.publish(
      exchange,
      '',
      Buffer.from(JSON.stringify(convertBigIntFields(bundle))),
    )

    console.log('Bundle sent:', bundle)

    await channel.close()
    await connection.close()
  } catch (error) {
    console.error('Error sending bundle:', error)
  }
}

const exampleBundle: BundleEvent = {
  bundleId: 12312321321,
  standardDepositEvents: [
    {
      inputToken: '0x1234567890123456789012345678901234567890',
      outputToken: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      inputAmount: BigInt('1000000000000000000'),
      outputAmount: BigInt('500000000'),
      destinationChainId: 10,
      depositId: BigInt('1'),
      quoteTimestamp: 1630512000,
      fillDeadline: 1630515600,
      exclusivityDeadline: 1630519200,
      depositor: '0x1234567890123456789012345678901234567890',
      recipient: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      exclusiveRelayer: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      message: '0x',
    },
  ],
  executionDepositEvent: {
    inputToken: '0x1234567890123456789012345678901234567890',
    outputToken: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    inputAmount: BigInt('1000000000000000000'),
    outputAmount: BigInt('500000000'),
    destinationChainId: 10,
    depositId: BigInt('1'),
    quoteTimestamp: 1630512000,
    fillDeadline: 1630515600,
    exclusivityDeadline: 1630519200,
    depositor: '0x1234567890123456789012345678901234567890',
    recipient: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    exclusiveRelayer: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    message: '0x',
  },
}

// Send the example bundle
sendBundle(exampleBundle)
