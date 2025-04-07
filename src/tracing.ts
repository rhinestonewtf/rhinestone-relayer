import { SpanStatusCode } from "@opentelemetry/api"
import { addSpanAttributes, currentSpan } from "./opentelemetry/api"

export const enum BundleActionStatus {
    SKIPPED = 'SKIPPED',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}


export const addBundleId = (bundleId: string) => {
    addSpanAttributes({
        'orchestrator.bundle.id': bundleId,
    })
}

export const addFillStatus = (status: BundleActionStatus) => {
    addSpanAttributes({
        'fill.status': status.toString(),
    })
}

export const addClaimStatus = (status: BundleActionStatus) => {
    addSpanAttributes({
        'claim.status': status.toString(),
    })
}

export const addChainId = (chainId: number) => {
    addSpanAttributes({
        'orchestrator.chain.id': chainId.toString()
    })
}

export const recordError = (e: any) => {
    currentSpan()?.setStatus({
        code: SpanStatusCode.ERROR,
        message: e.message,
    }).recordException({
        stack: e.stack,
        message: e.message,
    })
}

export const addTransactionId = (tx: string) => {
    addSpanAttributes({
        'transaction.id': tx,
    })
}
