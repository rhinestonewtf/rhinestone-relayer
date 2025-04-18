import fs from 'fs'
import path from 'path'

const interpolateWithEnvVars = (input: string): string => {
  // Regex for ${VAR_NAME:default_value} or ${VAR_NAME}
  const regex = /\$\{(\w+)(?::([^}]+))?\}/g

  return input.replace(regex, (match, variableName, defaultValue) => {
    // Try to get the environment variable value
    const envValue = process.env[variableName]

    // If the environment variable is found, use it
    if (envValue !== undefined) {
      return envValue
    }

    // If there's a default value provided in the string, use it
    if (defaultValue !== undefined) {
      return defaultValue
    }

    // If no env var or default value, throw an error
    throw new Error(`Missing value for ${variableName}`)
  })
}

export function loadConfig(filePath: string): any {
  // Read the JSON file
  const rawData = fs.readFileSync(path.resolve(filePath), 'utf-8')
  const config = JSON.parse(rawData)

  // Interpolate all values in the config object
  function traverseAndInterpolate(obj: any): any {
    if (typeof obj === 'string') {
      return interpolateWithEnvVars(obj) // If it's a string, interpolate
    }

    if (Array.isArray(obj)) {
      return obj.map(traverseAndInterpolate) // Traverse array
    }

    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          obj[key] = traverseAndInterpolate(obj[key]) // Traverse object
        }
      }
    }

    return obj
  }

  // Traverse and interpolate the entire config
  return traverseAndInterpolate(config)
}
