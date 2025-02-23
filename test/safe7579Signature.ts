import {
  getOrderBundleHash,
  getSignedOrderBundle,
  MetaIntent,
  Orchestrator,
  MultiChainCompact,
  SignedMultiChainCompact,
} from '@rhinestone/orchestrator-sdk'
import { Address, Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const OWNABLE_VALIDATOR_ADDRESS: Address =
  '0x2483da3a338895199e5e538530213157e931bf06'

// NOTE: This only works for Safe7579
export async function signOrderBundleWithOwnableValidator(
  orderBundle: MultiChainCompact,
  privateKey: Hex,
): Promise<SignedMultiChainCompact> {
  const digest = await getOrderBundleHash(orderBundle)

  const account = privateKeyToAccount(privateKey)

  // Add the prefix for ownable validator sig
  const signature = await account.signMessage({
    message: {
      raw: digest,
    },
  })

  const encodedSignature = (OWNABLE_VALIDATOR_ADDRESS +
    signature.slice(2)) as Hex

  return getSignedOrderBundle(orderBundle, encodedSignature)
}

export async function postMetaIntentWithOwnableValidator(
  metaIntent: MetaIntent,
  userAddress: Address,
  privateKey: Hex,
  orchestrator: Orchestrator,
): Promise<string> {
  try {
    const { orderBundle, injectedExecutions } = await orchestrator.getOrderPath(
      metaIntent,
      userAddress,
    )

    // TODO: Add injected executions to orderBundleExecution
    const signedOrderBundle = await signOrderBundleWithOwnableValidator(
      orderBundle,
      privateKey,
    )

    return orchestrator.postSignedOrderBundle(signedOrderBundle)
  } catch (error) {
    if (error instanceof Error) {
      console.log(error)
    }
  }
  throw new Error('Failed to post order bundle')
}
