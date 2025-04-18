import { describe, expect, it } from 'vitest'
import { validateBundle } from '../../src/core/validator'
import { getEmptyBundleEvent } from '../common/utils'

describe('validator', () => {
  it('should validate a bundle', async () => {
    const bundle = getEmptyBundleEvent()

    const isValid = await validateBundle(bundle)
    expect(isValid).toBe(true)
  })
})
