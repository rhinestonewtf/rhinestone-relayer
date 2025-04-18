import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'
config()

export default defineConfig({
  test: {
    include: ['**/unit/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
    maxConcurrency: 100,
    pool: 'threads',
    watch: false,
  },
})
