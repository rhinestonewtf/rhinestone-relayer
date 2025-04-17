import { Counter, ValueType } from '@opentelemetry/api'
import { createCounter, currentContext } from '../opentelemetry/api'
import { BundleActionStatus } from './tracing'

const bundleFillCounter: Counter = createCounter('relayer_fill_bundles', {
  description: 'Number of bundles filled by Rhinestone relayer',
  valueType: ValueType.INT,
})

const bundleClaimCounter: Counter = createCounter('relayer_claim_bundles', {
  description: 'Number of bundle claims filled by Rhinestone relayer',
  valueType: ValueType.INT,
})

export const recordBundleFill = (
  chainId: string,
  address: string,
  status: BundleActionStatus,
) => {
  bundleFillCounter.add(
    1,
    {
      'orchestrator.chain.id': chainId,
      'relayer.fill.address': address,
      'fill.status': status.toString(),
    },
    currentContext(),
  )
}

export const recordBundleClaim = (
  chainId: string,
  address: string,
  status: BundleActionStatus,
) => {
  bundleClaimCounter.add(
    1,
    {
      'orchestrator.chain.id': chainId,
      'relayer.claim.address': address,
      'claim.status': status.toString(),
    },
    currentContext(),
  )
}

