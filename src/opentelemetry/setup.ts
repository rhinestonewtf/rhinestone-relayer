import { NodeSDK } from '@opentelemetry/sdk-node'
import {
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'
import {
  setupHttpInstrumentation,
} from './http'
import { ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { ViemInstrumentation } from '@pimlico/opentelemetry-instrumentation-viem'
import { resourceFromAttributes } from '@opentelemetry/resources'

interface SDKConfig {
  serviceName: string
  version?: string
  env?: string
}

let instance: NodeSDK | undefined

export function setupSDK(config: SDKConfig) {
  // url should be controlled by OTEL_EXPORTER_OTLP_ENDPOINT as per OTEL spec

  const traceExporter = new OTLPTraceExporter({
    compression: CompressionAlgorithm.GZIP,
  })

  // const traceExporter = new ConsoleSpanExporter()

  const metricExporter = new OTLPMetricExporter({
    compression: CompressionAlgorithm.GZIP,
  })

  // const metricExporter = new ConsoleMetricExporter()

  instance = new NodeSDK({
    traceExporter,
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
    }),
    instrumentations: [
      setupHttpInstrumentation(),
      new ViemInstrumentation({
        requireParentSpan: true,
        captureOperationResult: true
      })
    ],
    serviceName: config.serviceName,
    resource: resourceFromAttributes({
      [ATTR_SERVICE_VERSION]: config.version ?? '0.0.1',
      ['deployment.environment.name']: config.env ?? 'local-dev',
    }),
  })
  instance.start()
}

export function sdk(): NodeSDK {
  if (instance) {
    return instance
  }
  throw new Error('please call setupSDK(...) first')
}
