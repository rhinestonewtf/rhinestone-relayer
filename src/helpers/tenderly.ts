import { Hex, Address } from 'viem'

export const getTenderlySimulation = async ({
  chainId,
  from,
  to,
  calldata,
  blockNumber,
}: {
  chainId: number
  from: Address
  to: Address
  calldata: Hex
  blockNumber: number
}) => {
  const TENDERLY_ACCOUNT_SLUG =
    process.env.TENDERLY_ACCOUNT_SLUG ?? 'rhinestone'
  const TENDERLY_PROJECT_SLUG =
    process.env.TENDERLY_PROJECT_SLUG ?? 'chain-abstraction'
  const TENDERLY_ACCESS_KEY = process.env.TENDERLY_ACCESS_KEY

  if (!TENDERLY_ACCESS_KEY) {
    return
  }

  try {
    const response = await fetch(
      `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/simulate`,
      {
        method: 'POST',
        headers: {
          'X-Access-Key': `${TENDERLY_ACCESS_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network_id: chainId,
          from,
          to,
          input: calldata,
          block_number: blockNumber,
          save: true,
          save_if_fails: true,
          simulation_type: 'quick',
        }),
      },
    )

    const data = await response.json()

    await fetch(
      `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/simulations/${data.simulation.id}/share`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Access-Key': `${TENDERLY_ACCESS_KEY}`,
        },
      },
    )

    return `https://www.tdly.co/shared/simulation/${data.simulation.id}`
  } catch (error) {
    console.error(error)
  }
}
