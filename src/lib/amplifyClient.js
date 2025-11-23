import { Amplify } from 'aws-amplify'

const loadOutputs = async () => {
  const envOutputs = import.meta.env.VITE_AMPLIFY_OUTPUTS_JSON

  if (envOutputs) {
    try {
      return JSON.parse(envOutputs)
    } catch (error) {
      console.error('Failed to parse VITE_AMPLIFY_OUTPUTS_JSON. Ensure it contains valid JSON.')
      throw error
    }
  }

  if (typeof window !== 'undefined' && window.__AMPLIFY_OUTPUTS__) {
    return window.__AMPLIFY_OUTPUTS__
  }

  if (import.meta.env.DEV) {
    const module = await import('../../amplify_outputs.json')
    return module.default ?? module
  }

  throw new Error('Amplify outputs not provided. Set VITE_AMPLIFY_OUTPUTS_JSON before building for production.')
}

const outputs = await loadOutputs()

// Configure Amplify with the generated backend outputs once on app startup
Amplify.configure(outputs)
