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
    const [localOutputs] = Object.values(
      import.meta.glob('../../amplify_outputs.json', { eager: true, import: 'default' })
    )
    if (localOutputs) return localOutputs
  }

  throw new Error('Amplify outputs missing. Provide VITE_AMPLIFY_OUTPUTS_JSON or run `npm run sandbox`.')
}

const configurePromise = loadAmplifyOutputs()
  .then((outputs) => {
    // Configure Amplify with the generated backend outputs once on app startup
    Amplify.configure(outputs)
    return outputs
  })
  .catch((error) => {
    console.error('Failed to configure Amplify', error)
    throw error
  })

export const ensureAmplifyConfigured = () => configurePromise
