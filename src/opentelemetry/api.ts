import {
  Attributes,
  context,
  Context,
  Counter,
  Histogram,
  Meter,
  MetricOptions,
  metrics,
  Span,
  SpanOptions,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api'

const INSTRUMENTATION_NAME: string = 'internal.instrumentation'
const INSTRUMENTATION_VERSION: string = '0.0.1'

export function currentSpan(): Span | undefined {
  return trace.getActiveSpan()
}

export function currentContext(): Context {
  return context.active()
}

export function currentTraceId(): string {
  return currentSpan()?.spanContext().traceId ?? '<no trace id>'
}

export function addSpanAttributes(attributes: Attributes) {
  currentSpan()?.setAttributes(attributes)
}

export function withSpan<F extends () => any>(
  name: string,
  fn: F,
  options?: SpanOptions,
): any {
  return trace
    .getTracer(INSTRUMENTATION_NAME, INSTRUMENTATION_VERSION)
    .startActiveSpan(name, options ? options : {}, (span) => {
      try {
        const result = fn()
        if (result instanceof Promise) {
          return result
            .catch((reason) => {
              span
                .setStatus({
                  code: SpanStatusCode.ERROR,
                  message: reason.message,
                })
                .recordException({
                  stack: reason.stack,
                  message: reason.message,
                })
              throw reason
            })
            .finally(() => span.end())
        }
        span.end()
        return result
      } catch (e: any) {
        span
          .setStatus({
            code: SpanStatusCode.ERROR,
            message: e.message,
          })
          .recordException({ stack: e.stack, message: e.message })
        span.end()
        throw e
      }
    })
}

export const CreateSpan = (name?: string) => {
  return (originalMethod: Function, context: ClassMethodDecoratorContext) => {
    const methodName = name ?? String(context.name)
    return function (this: any, ...args: any[]) {
      return withSpan(methodName, () => originalMethod.apply(this, args))
    }
  }
}

const getMeter = (): Meter => {
  return metrics.getMeter(INSTRUMENTATION_NAME, INSTRUMENTATION_VERSION)
}

export const createHistogram = (
  name: string,
  options?: MetricOptions,
): Histogram<Attributes> => {
  return getMeter().createHistogram(name, options)
}

export const createCounter = (
  name: string,
  options?: MetricOptions,
): Counter<Attributes> => {
  return getMeter().createCounter(name, options)
}
