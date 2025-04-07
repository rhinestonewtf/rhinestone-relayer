
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'

// express requires http instrumentation too
export function setupHttpInstrumentation() {
  return new HttpInstrumentation({
    // otherwise it will create huge ws connection span lasting forever
    requireParentforOutgoingSpans: true
  })
}

