import { vi } from 'vitest'

// this should be fine since we just do one tx per chain
vi.mock('../../src/nonceManager', () => {
  return {
    nonceManager: {
      getNonce: vi.fn().mockResolvedValue(0),
    },
  }
})
