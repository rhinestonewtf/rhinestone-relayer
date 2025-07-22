import { SignedAuthorization, SignedAuthorizationList } from 'viem'
import { defaultGetRPCUrl } from '../config/chains'
import {
  handleTransactions,
} from '../core/transactionHandler'
import { debugLog } from '../helpers/logger'
import {
  addBundleId,
} from '../monitoring/tracing'
import { withSpan } from '../opentelemetry/api'
import { ChainAction, RelayerActionV1 } from './types'
import { Transaction } from '../types'

export const processRelayerActionV1 = async (action: RelayerActionV1) =>
  withSpan('process RelayerActionV1', async () => {
    const bundleId = action.id.toString()
    addBundleId(bundleId)

    const prefillActions = action.claims
      .filter((claim) => claim.beforeFill)
    await withSpan('prefill claim actions', () => handleTransactions(bundleId, toTransactions(prefillActions, false), defaultGetRPCUrl))

    await withSpan('fill action', () => handleTransactions(bundleId, toTransactions([action.fill], true), defaultGetRPCUrl))

    const postFillActions = action.claims
      .filter((claim) => !claim.beforeFill)

    await withSpan('postfill claim actions', () => handleTransactions(bundleId, toTransactions(postFillActions, false), defaultGetRPCUrl))
    debugLog('relayer action v1 completed')
  })

function toTransactions(actions: ChainAction[], isFill: boolean): Transaction[] {
  return actions.map((action) => {
    return {
      chainId: action.call.chainId,
      to: action.call.to,
      value: action.call.value,
      data: action.call.data,
      isFill,
      authorisationList: toAuthorizationList(action.eip7702Delegation)
    }
  })
}

function toAuthorizationList(authorization?: SignedAuthorization): SignedAuthorizationList | undefined {
  if (authorization == undefined) return undefined

  return [authorization]
}