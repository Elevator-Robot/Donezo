import { Amplify } from 'aws-amplify'

const loadAmplifyOutputs = async () => {
  const envOutputs = import.meta.env.VITE_AMPLIFY_OUTPUTS_JSON
  if (envOutputs) {
    return JSON.parse(envOutputs)
  }

  if (typeof window !== 'undefined' && window.__AMPLIFY_OUTPUTS__) {
    return window.__AMPLIFY_OUTPUTS__
  }

  if (import.meta.env.DEV) {
    const module = await import('../../amplify_outputs.json').catch(() => null)
    if (module?.default) return module.default
  }

  throw new Error('Amplify outputs missing. Provide VITE_AMPLIFY_OUTPUTS_JSON or run `npm run sandbox`.')
}

const outputs = await loadAmplifyOutputs()

// Configure Amplify with the generated backend outputs once on app startup
Amplify.configure(outputs)
