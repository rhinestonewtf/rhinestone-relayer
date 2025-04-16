import { createServer } from 'prool'
import { anvil } from 'prool/instances'

const executionServer1 = createServer({
  instance: () =>
    anvil({
      chainId: 1,
    }),
  port: 8545,
})

const executionServer2 = createServer({
  instance: () =>
    anvil({
      chainId: 2,
    }),
  port: 8546,
})

const executionServer3 = createServer({
  instance: () =>
    anvil({
      chainId: 3,
    }),
  port: 8547,
})

export default async function setup() {
  await executionServer1.start()
  await executionServer2.start()
  await executionServer3.start()
}
