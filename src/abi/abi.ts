import { Abi } from "viem"

import routerAbiJson from "./router.json"
export const routerAbi: Abi = routerAbiJson as Abi

import singleCallAbiJson from "./adapters/call.json"
export const singleCallAbi: Abi = singleCallAbiJson as Abi

import multiCallAbiJson from "./adapters/multicall.json"
export const multiCallAbi: Abi = multiCallAbiJson as Abi

import ecoAbiJson from "./adapters/eco.json"
export const ecoAbi: Abi = ecoAbiJson as Abi

import sameChainAbiJson from "./adapters/sameChain.json"
export const sameChainAbi: Abi = sameChainAbiJson as Abi

import acrossMultiCallAbiJson from "./adapters/across_multicall.json"
export const acrossMultiCallAbi: Abi = acrossMultiCallAbiJson as Abi

import across7579AbiJson from "./adapters/across_7579.json"
export const across7579Abi: Abi = across7579AbiJson as Abi

export const adapters = {
    singleCallAbi,
    multiCallAbi,
    ecoAbi,
    sameChainAbi,
    acrossMultiCallAbi,
    across7579Abi
}