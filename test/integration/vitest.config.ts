import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'
config()

export default defineConfig({
  test: {
    include: ['**/integration/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
    maxConcurrency: 100,
    pool: 'threads',
    watch: false,
    globalSetup: './test/integration/setup.ts',
    setupFiles: ['./test/integration/mocks.ts'],
  },
})
