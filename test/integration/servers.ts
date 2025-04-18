import { beforeAll } from 'vitest'
import { waitForServer } from './common/server'

beforeAll(async () => {
  await waitForServer('http://localhost:8545/healthcheck')
  await waitForServer('http://localhost:8546/healthcheck')
  await waitForServer('http://localhost:8547/healthcheck')
})
