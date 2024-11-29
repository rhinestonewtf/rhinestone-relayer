import { fillBundle } from './filler'

// consumer.js
const amqp = require('amqplib')

require('dotenv').config()

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost'

export const receiveBundles = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL)
    const channel = await connection.createChannel()
    const exchange = 'bundles'

    await channel.assertExchange(exchange, 'fanout', { durable: false })
    const { queue } = await channel.assertQueue('', { exclusive: true })

    console.log('Waiting for messages in %s. To exit press CTRL+C', queue)
    channel.bindQueue(queue, exchange, '')

    channel.consume(
      queue,
      async (msg: { content: { toString: () => string } }) => {
        if (msg.content) {
          const bundle = JSON.parse(msg.content.toString())
          console.log('Received bundle:', bundle)
          try {
            await fillBundle(bundle)
            console.log('Successfully filled bundle')
          } catch (error) {
            console.error('Error filling bundle:', error)
          }
        }
      },
      { noAck: true },
    )
  } catch (error) {
    console.error('Error receiving bundles:', error)
  }
}
